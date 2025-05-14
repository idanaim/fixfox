import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, TextInput, ActivityIndicator, Chip } from 'react-native-paper';
import { chatApi } from '../api/chatAPI';
import { useBusiness } from '../hooks/useBusiness';
import SolutionSuggestion from './SolutionSuggestion';
import { MaterialIcons } from '@expo/vector-icons';
import { BadgeType } from './ContextBadge';

// Helper to transform issue/problem solutions into the format expected by SolutionSuggestion
const extractSolutions = (items: any[], type: 'issues' | 'problems') => {
  const solutions: string[] = [];
  const sources: BadgeType[] = [];
  
  items.forEach(item => {
    if (type === 'issues' && item.solution) {
      solutions.push(item.solution.treatment);
      sources.push('current_business');
    } else if (type === 'problems' && item.solutions && item.solutions.length > 0) {
      solutions.push(item.solutions[0].treatment);
      sources.push('other_business');
    }
  });
  
  return { solutions, sources };
};

interface EnhancedDiagnosisFlowProps {
  equipmentId: number;
  initialDescription: string;
  onComplete: (diagnosisResult: any) => void;
  onCancel: () => void;
}

export const EnhancedDiagnosisFlow: React.FC<EnhancedDiagnosisFlowProps> = ({
  equipmentId,
  initialDescription,
  onComplete,
  onCancel
}) => {
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'initial' | 'enhance_description' | 'issue_matches' | 'problem_matches' | 'ai_diagnosis'>('initial');
  
  const [originalDescription, setOriginalDescription] = useState(initialDescription);
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [userEditedDescription, setUserEditedDescription] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  // For solutions display
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState<number>(0);

  // Step 1: Start the diagnosis workflow with enhancement
  const startDiagnosis = async () => {
    if (!currentBusiness?.id) {
      Alert.alert('Error', 'No business selected');
      return;
    }

    setLoading(true);
    try {
      const result = await chatApi.completeDiagnosisWorkflow(
        originalDescription,
        equipmentId,
        currentBusiness.id,
        5 // Max results
      );
      
      setStep('enhance_description');
      setEnhancedDescription(result.enhancedDescription || '');
      setUserEditedDescription(result.enhancedDescription || '');
      setLoading(false);
    } catch (error) {
      console.error('Error starting diagnosis:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to enhance problem description. Please try again.');
    }
  };

  // Step 2: User approves or edits the enhanced description
  const handleDescriptionResponse = (approved: boolean) => {
    if (approved) {
      // User approves enhanced description
      performDiagnosis(enhancedDescription);
    } else {
      // User wants to edit the description
      setEditMode(true);
    }
  };

  // Step 3: Submit user-edited description or retry enhancement
  const submitUserDescription = () => {
    if (userEditedDescription.trim().length < 10) {
      Alert.alert('Error', 'Please provide a more detailed description (at least 10 characters)');
      return;
    }
    
    setEditMode(false);
    // Use the user-edited description for diagnosis
    performDiagnosis(userEditedDescription);
  };

  // Step 3 Alternative: Ask AI to re-enhance with more context
  const retryEnhancement = async () => {
    if (!currentBusiness?.id) return;
    
    setLoading(true);
    try {
      // Create a temporary session ID for the enhancement
      // This is a workaround since we don't have a session ID in this context
      // In a real implementation, you'd need to get the actual session ID
      const tempSessionId = equipmentId; // Using equipment ID as a fallback
      
      const result = await chatApi.enhanceProblemDescription(
        tempSessionId,
        userEditedDescription
      );
      
      setEnhancedDescription(result.enhancedDescription);
      setUserEditedDescription(result.enhancedDescription);
      setLoading(false);
      setEditMode(false);
    } catch (error) {
      console.error('Error re-enhancing description:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to enhance description. Proceeding with your input.');
      performDiagnosis(userEditedDescription);
    }
  };

  // Step 4: Perform the actual diagnosis with the approved description
  const performDiagnosis = async (approvedDescription: string) => {
    if (!currentBusiness?.id) return;
    
    setLoading(true);
    try {
      const result = await chatApi.performDiagnosis(
        approvedDescription,
        equipmentId,
        currentBusiness.id,
        5
      );
      
      setStep(result.step);
      setDiagnosisResult(result.diagnosisResult);
      setLoading(false);
    } catch (error) {
      console.error('Error performing diagnosis:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to perform diagnosis. Please try again.');
    }
  };

  // Helper to render context badge
  const renderBadge = (source: string) => {
    const badge = chatApi.getContextBadge(source);
    let color = '';
    
    switch (badge.type) {
      case 'current_business':
        color = '#4CAF50'; // Green
        break;
      case 'other_business':
        color = '#2196F3'; // Blue
        break;
      case 'ai_generated':
        color = '#9C27B0'; // Purple
        break;
    }
    
    return (
      <Chip style={{ backgroundColor: color, marginRight: 8 }} textStyle={{ color: 'white' }}>
        {badge.label}
      </Chip>
    );
  };

  // Handle solution acceptance
  const handleSolutionAccepted = (solution: string) => {
    onComplete({
      ...diagnosisResult,
      selectedSolution: solution
    });
  };

  // Handle solution rejection
  const handleSolutionRejected = (solution: string) => {
    // If user rejected this solution, show the next one or allow them to re-describe
    setSelectedSolutionIndex((prev: number) => prev + 1);
  };

  // Check if we've run out of solutions
  const handleNoMoreSolutions = () => {
    Alert.alert(
      "No More Solutions",
      "There are no more solutions available. Would you like to describe your problem again?",
      [
        {
          text: "Yes, Describe Again",
          onPress: () => {
            setStep('enhance_description');
            setEditMode(true);
          }
        },
        {
          text: "Use Best Solution",
          onPress: () => onComplete(diagnosisResult)
        }
      ]
    );
  };

  // Render based on current step
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {step === 'initial' ? 'Enhancing your description...' : 
           step === 'enhance_description' ? 'Analyzing your problem...' :
           'Processing your request...'}
        </Text>
      </View>
    );
  }

  // Initial step or enhance description step
  if (step === 'initial' || (step === 'enhance_description' && !editMode)) {
    return (
      <View style={styles.container}>
        {step === 'initial' ? (
          <Card style={styles.card}>
            <Card.Title title="Describe Your Problem" />
            <Card.Content>
              <Text variant="bodyMedium">{originalDescription}</Text>
              <Button 
                mode="contained" 
                onPress={startDiagnosis}
                style={styles.button}
              >
                Start Diagnosis
              </Button>
              <Button 
                mode="outlined" 
                onPress={onCancel}
                style={styles.button}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Title title="Enhanced Problem Description" />
            <Card.Content>
              <Text style={styles.subtitle}>Original:</Text>
              <Text variant="bodyMedium" style={styles.description}>{originalDescription}</Text>
              
              <Text style={styles.subtitle}>Enhanced:</Text>
              <Text variant="bodyMedium" style={styles.enhancedDescription}>{enhancedDescription}</Text>
              
              <Text style={styles.question}>
                Does this enhanced description accurately describe your problem?
              </Text>
              
              <View style={styles.buttonRow}>
                <Button 
                  mode="contained" 
                  onPress={() => handleDescriptionResponse(true)}
                  style={[styles.button, styles.buttonHalf]}
                >
                  Yes, Proceed
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => handleDescriptionResponse(false)}
                  style={[styles.button, styles.buttonHalf]}
                >
                  No, I'll Edit
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  }

  // Edit mode for description
  if (editMode) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Edit Problem Description" />
          <Card.Content>
            <Text style={styles.subtitle}>Please provide more details about your problem:</Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={userEditedDescription}
              onChangeText={setUserEditedDescription}
              style={styles.textInput}
            />
            
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                onPress={submitUserDescription}
                style={[styles.button, styles.buttonHalf]}
              >
                Submit
              </Button>
              <Button 
                mode="outlined" 
                onPress={retryEnhancement}
                style={[styles.button, styles.buttonHalf]}
              >
                Enhance Again
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Issue matches step - Updated with SolutionSuggestion
  if (step === 'issue_matches' && diagnosisResult) {
    const { solutions, sources } = extractSolutions(diagnosisResult.issues, 'issues');
    
    if (solutions.length === 0) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title 
              title="No Solutions Found" 
              subtitle="No applicable solutions could be found for similar issues."
            />
            <Card.Content>
              <Button 
                mode="contained" 
                onPress={() => {
                  setStep('enhance_description');
                  setEditMode(true);
                }}
                style={styles.button}
              >
                Describe Problem Again
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title 
            title="Solutions From Similar Issues" 
            subtitle="We found solutions to similar problems in your business."
          />
          <Card.Content>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.problemDescription}>
                <MaterialIcons name="description" size={16} color="#333" /> 
                <Text style={styles.bold}> Problem: </Text> 
                {diagnosisResult.issues[0]?.problem?.description || enhancedDescription}
              </Text>
              
              <SolutionSuggestion 
                solutions={solutions}
                solutionSources={sources}
                onSolutionAccepted={handleSolutionAccepted}
                onSolutionRejected={handleSolutionRejected}
              />
            </ScrollView>
            
            <Button 
              mode="outlined" 
              onPress={() => {
                setStep('enhance_description');
                setEditMode(true);
              }}
              style={styles.button}
            >
              Describe Again
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Problem matches step - Updated with SolutionSuggestion
  if (step === 'problem_matches' && diagnosisResult) {
    const { solutions, sources } = extractSolutions(diagnosisResult.problems, 'problems');
    
    if (solutions.length === 0) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title 
              title="No Solutions Found" 
              subtitle="No applicable solutions could be found for similar problems."
            />
            <Card.Content>
              <Button 
                mode="contained" 
                onPress={() => {
                  setStep('enhance_description');
                  setEditMode(true);
                }}
                style={styles.button}
              >
                Describe Problem Again
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title 
            title="Solutions From Other Businesses" 
            subtitle="We found solutions to similar problems from other businesses."
          />
          <Card.Content>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.problemDescription}>
                <MaterialIcons name="description" size={16} color="#333" /> 
                <Text style={styles.bold}> Problem: </Text> 
                {diagnosisResult.problems[0]?.description || enhancedDescription}
              </Text>
              
              <SolutionSuggestion 
                solutions={solutions}
                solutionSources={sources}
                onSolutionAccepted={handleSolutionAccepted}
                onSolutionRejected={handleSolutionRejected}
              />
            </ScrollView>
            
            <Button 
              mode="outlined" 
              onPress={() => {
                setStep('enhance_description');
                setEditMode(true);
              }}
              style={styles.button}
            >
              Describe Again
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // AI diagnosis step - Updated with SolutionSuggestion
  if (step === 'ai_diagnosis' && diagnosisResult) {
    const diagnosis = diagnosisResult.diagnosis;
    const aiSolutions = diagnosis.suggestedSolutions || [];
    const aiSources: BadgeType[] = Array(aiSolutions.length).fill('ai_generated');
    
    if (aiSolutions.length === 0) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title 
              title="AI Diagnosis" 
              subtitle="No solutions could be generated."
            />
            <Card.Content>
              <Button 
                mode="contained" 
                onPress={() => {
                  setStep('enhance_description');
                  setEditMode(true);
                }}
                style={styles.button}
              >
                Describe Problem Again
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title 
            title="AI-Generated Solutions" 
            subtitle="Our AI has generated these solutions based on your description."
          />
          <Card.Content>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.problemDescription}>
                <MaterialIcons name="description" size={16} color="#333" /> 
                <Text style={styles.bold}> Problem: </Text> 
                {enhancedDescription}
              </Text>
              
              <View style={styles.causesContainer}>
                <Text style={styles.causesTitle}>
                  <MaterialIcons name="error-outline" size={16} color="#333" /> 
                  <Text style={styles.bold}> Possible Causes:</Text>
                </Text>
                {diagnosis.possibleCauses.map((cause: string, index: number) => (
                  <Text key={index} style={styles.listItem}>• {cause}</Text>
                ))}
              </View>
              
              <SolutionSuggestion 
                solutions={aiSolutions}
                solutionSources={aiSources}
                onSolutionAccepted={handleSolutionAccepted}
                onSolutionRejected={handleSolutionRejected}
              />
            </ScrollView>
            
            <Button 
              mode="outlined" 
              onPress={() => {
                setStep('enhance_description');
                setEditMode(true);
              }}
              style={styles.button}
            >
              Describe Again
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Fallback
  return (
    <View style={styles.container}>
      <Text>Something went wrong. Please try again.</Text>
      <Button onPress={onCancel}>Go Back</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  scrollView: {
    maxHeight: 420, // Increased height to accommodate the solution cards
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  enhancedDescription: {
    marginBottom: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  question: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
  buttonHalf: {
    flex: 0.48,
  },
  textInput: {
    marginBottom: 16,
  },
  issueCard: {
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    marginBottom: 8,
  },
  listItem: {
    marginBottom: 4,
    marginLeft: 8,
  },
  problemDescription: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    lineHeight: 22,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  causesContainer: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  causesTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 15,
    color: '#333',
  },
}); 