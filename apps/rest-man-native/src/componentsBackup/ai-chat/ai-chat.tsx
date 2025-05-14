import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInRight, SlideInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import API from './api';
import { QueryClientProvider } from '@tanstack/react-query';
import ReactQueryWrapper from '../../queries/react-query-wrapper/react-query-wrapper';

const ChatInterface = ({ businessId, userId }) => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [step, setStep] = useState('problem');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const flatListRef = useRef(null);

  // React Query Mutations
  const createIssueMutation = useMutation({
    mutationFn: API.createIssue,
    onSuccess: (data) => {
      queryClient.setQueryData(['issue', data.issue.id], data);
      setStep('solutions');
    }
  });
  const solutionMutation = useMutation({
    mutationFn: API.recordSolutionOutcome,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['solutions'] })
  });

  const technicianMutation = useMutation({
    mutationFn: API.createTicket,
    onSuccess: () => setStep('completed')
  });

  const handleProblemSubmit = () => {
  debugger;
    createIssueMutation.mutate({
      businessId,
      userId,
      problemDescription: input,
      equipmentDescription: input
    });
    setInput('');
  };

  const handleSolutionFeedback = (solutionId, effective) => {
    solutionMutation.mutate({ solutionId, effective });
    if (!effective) setStep('technicians');
  };

  const renderStepContent = () => {
    switch(step) {
      case 'problem':
        return (
          <Animated.View entering={SlideInUp.duration(300)} style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="🔍 Describe your equipment issue..."
              placeholderTextColor="#888"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, createIssueMutation.isPending && styles.disabledButton]}
              onPress={handleProblemSubmit}
              disabled={createIssueMutation.isPending}
            >
              {createIssueMutation.isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="send" size={24} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>
        );

      case 'solutions':
        return (
          <SolutionsView
            data={createIssueMutation.data?.solutions || []}
            onFeedback={handleSolutionFeedback}
          />
        );

      case 'technicians':
        return (
          <TechniciansView
            technicians={createIssueMutation.data?.technicians || []}
            onSelect={technicianId =>
              technicianMutation.mutate({
                issueId: createIssueMutation.data.issue.id,
                technicianId
              })
            }
          />
        );

      case 'completed':
        return (
          <Animated.View entering={FadeInDown} style={styles.completedContainer}>
            <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
            <Text style={styles.completedText}>Technician dispatched! 🎉</Text>
          </Animated.View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={[]}
        contentContainerStyle={styles.messagesContainer}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <Animated.View entering={FadeInRight.delay(100)}>
              <ChatBubble
                message={{
                  text: "Hi! Let's solve your equipment issue 🔧",
                  sender: 'bot'
                }}
              />
            </Animated.View>

            {createIssueMutation.data?.equipmentPrompt && (
              <EquipmentForm
                initialType={createIssueMutation.data.equipmentPrompt.type}
                onSubmit={API.registerEquipment}
              />
            )}
          </>
        }
      />

      {renderStepContent()}
    </KeyboardAvoidingView>
  );
};

const ChatBubble = ({ message }) => (
  <Animated.View
    style={[
      styles.bubble,
      message.sender === 'user' ? styles.userBubble : styles.botBubble
    ]}
  >
    <Text style={message.sender === 'user' ? styles.userText : styles.botText}>
      {message.text}
    </Text>
  </Animated.View>
);

const SolutionsView = ({ data, onFeedback }) => (
  <Animated.View entering={FadeInDown} style={styles.solutionsContainer}>
    <Text style={styles.sectionTitle}>Suggested Solutions</Text>
    <FlatList
      horizontal
      data={data}
      renderItem={({ item }) => (
        <SolutionCard solution={item} onFeedback={onFeedback} />
      )}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.solutionsList}
      showsHorizontalScrollIndicator={false}
    />
  </Animated.View>
);

const SolutionCard = ({ solution, onFeedback }) => (
  <View style={styles.solutionCard}>
    <View style={styles.solutionHeader}>
      <MaterialIcons name="handyman" size={24} color="#4CAF50" />
      <Text style={styles.solutionTitle}>{solution.cause}</Text>
      <View style={styles.effectivenessBadge}>
        <Text style={styles.effectivenessText}>{solution.effectiveness}% Success</Text>
      </View>
    </View>
    <Text style={styles.solutionSteps}>{solution.treatment}</Text>
    <View style={styles.solutionActions}>
      <TouchableOpacity
        style={[styles.solutionButton, styles.successButton]}
        onPress={() => onFeedback(solution.id, true)}
      >
        <Ionicons name="checkmark" size={18} color="white" />
        <Text style={styles.buttonText}>Solved</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.solutionButton, styles.failureButton]}
        onPress={() => onFeedback(solution.id, false)}
      >
        <Ionicons name="close" size={18} color="white" />
        <Text style={styles.buttonText}>Not Working</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const TechniciansView = ({ technicians, onSelect }) => (
  <Animated.View entering={FadeInDown} style={styles.techniciansContainer}>
    <Text style={styles.sectionTitle}>Available Technicians</Text>
    <FlatList
      data={technicians}
      renderItem={({ item }) => (
        <TechnicianCard technician={item} onSelect={onSelect} />
      )}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.techniciansList}
    />
  </Animated.View>
);

const TechnicianCard = ({ technician, onSelect }) => (
  <TouchableOpacity
    style={styles.techCard}
    onPress={() => onSelect(technician.id)}
  >
    <Image source={{ uri: technician.photo }} style={styles.techImage} />
    <View style={styles.techInfo}>
      <Text style={styles.techName}>{technician.name}</Text>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < Math.floor(technician.rating) ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
      <Text style={styles.techExpertise}>{technician.expertise.join(', ')}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#666" />
  </TouchableOpacity>
);

const EquipmentForm = ({ initialType, onSubmit }) => {
  const [form, setForm] = useState({ type: initialType });
  const [date, setDate] = useState(new Date());

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (!result.canceled) setForm({...form, photo: result.assets[0].uri });
  };

  return (
    // <ReactQueryWrapper onMfeRender={true}>
    <Animated.View entering={FadeInDown} style={styles.formContainer}>
      <Text style={styles.formTitle}>Register New Equipment</Text>

      <TouchableOpacity style={styles.imageUpload} onPress={handleImagePick}>
        {form.photo ? (
          <Image source={{ uri: form.photo }} style={styles.equipmentImage} />
        ) : (
          <Ionicons name="camera" size={40} color="#4A90E2" />
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.formInput}
        placeholder="Manufacturer"
        value={form.manufacturer}
        onChangeText={t => setForm({...form, manufacturer: t})}
      />

      <TextInput
        style={styles.formInput}
        placeholder="Model Number"
        value={form.model}
        onChangeText={t => setForm({...form, model: t})}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => onSubmit(form)}
      >
        <Text style={styles.submitButtonText}>Save Equipment</Text>
      </TouchableOpacity>
    </Animated.View>
    // </ReactQueryWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 100
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 24,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4A90E2'
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#4A90E2',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2'
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  userText: {
    color: '#FFF',
    fontSize: 16
  },
  botText: {
    color: '#333',
    fontSize: 16
  },
  solutionsContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#EEE'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333'
  },
  solutionsList: {
    paddingBottom: 8
  },
  solutionCard: {
    width: 280,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
    marginBottom: 16,
  },
  errorBorder: {
    borderColor: "#d32f2f",
  },
  submitButton: {
    backgroundColor: "#6200ea",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 'auto',
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  causeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginRight: 8,
    color: '#4A90E2',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  helpButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  helpText: {
    color: '#4A90E2',
    fontWeight: '600',
  },

  formContainer: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 16,
    padding: 20
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center'
  },
  imageUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  equipmentImage: {
    width: 120,
    height: 120,
    borderRadius: 60
  },
  formInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },


  techCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  techImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16
  },
  techInfo: {
    flex: 1
  },
  techName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  techExpertise: {
    fontSize: 14,
    color: '#666'
  },

  disabledButton: {
    backgroundColor: '#BBDEFB'
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  techniciansList: {
    paddingBottom: 16
  },
  solutionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  successButton: {
    backgroundColor: '#4CAF50'
  },
  failureButton: {
    backgroundColor: '#F44336'
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '500'
  },
  effectivenessBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  effectivenessText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500'
  },
  solutionSteps: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // ... (remaining styles from previous example)
});

export default ChatInterface;
