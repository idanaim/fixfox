// screens/ChatScreen.tsx
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import ChatHeader from '../components/chat/Header/ChatHeader';
import ChatMessages from '../components/chat/Message/ChatMessages';
import ChatInput from '../components/chat/Input/ChatInput';
import SolutionSuggestion from '../components/chat/SolutionSuggestion';
import ProblemDiagnosisDisplay from '../components/chat/ProblemDiagnosisDisplay';
import EnhancedDescriptionApproval from '../components/chat/EnhancedDescriptionApproval';
import FollowUpQuestionsContainer from '../components/chat/FollowUpQuestionsContainer';
import FlowStepIndicator from '../components/chat/FlowStepIndicator';
import OpenIssuesDisplay from '../components/chat/OpenIssuesDisplay';
import { useBusinesses } from '../hooks/useBusinesses';
import { useChatLogic } from '../hooks/useChatLogic';
import { useChatStore } from '../store/chat.store';
import { colors, typography } from '../components/admin-dashboard/admin-dashboard-styles';
import { chatApi, ChatMessage } from '../api/chatAPI';
import BottomNavigation from '../components/BottomNavigation';
import useAuthStore from '../store/auth.store';

interface RouteParams {
  businessId: number;
  userId: number;
}

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { businessId } = route.params as RouteParams;
  const { businesses, selectedBusiness, setSelectedBusiness } = useBusinesses();
  const { session: { id: sessionId }, isFollowUpQuestions, setFollowUpQuestions } = useChatStore();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const {
    currentStep,
    flowHistory,
    messages,
    input,
    loading,
    selectedEquipment,
    diagnosisResult,
    enhancedDescription,
    originalDescription,
    showEnhancedDescriptionApproval,
    isLoadingAI,
    openIssues,
    setInput,
    handleSend,
    handleEquipmentSelect,
    handleEquipmentFormSubmit,
    handleApproveEnhancedDescription,
    handleRejectEnhancedDescription,
    handleSolutionAccepted,
    handleSolutionRejected,
    handleExistingSolutionSelect,
    handleRequestMoreInfo,
    handleImproveDescription,
    handleAssignToTechnician,
    handleGetAISolutions,
    handleSolutionHelped,
    handleSelectOpenIssue,
    handleContinueWithNewIssue,
    handleUserConfirmation
  } = useChatLogic({
    sessionId: sessionId ? Number(sessionId) : null,
    userId: user!.id,
    businessId,
    selectedBusinessId: selectedBusiness?.id || null,
    navigation,
  });

  const handleAddNewEquipment = async () => {
    if (!sessionId) return;
    try {
      await chatApi.addMessage(
        sessionId,
        t('equipment.add_new_manually'),
        'system',
        { type: 'equipment_form' }
      );
    } catch (error) {
      console.error('Error adding new equipment message trigger:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ChatHeader
        title={t('common.maintenance_assistant')}
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        onSelectBusiness={setSelectedBusiness}
      />
      
      <FlowStepIndicator currentStep={currentStep} flowHistory={flowHistory} />
      
      <View style={styles.chatContainer}>
        <ChatMessages 
          messages={messages} 
          onEquipmentSelect={handleEquipmentSelect}
          onAddNewEquipment={handleAddNewEquipment}
          onEquipmentFormSubmit={handleEquipmentFormSubmit}
          onConfirm={(action) => handleUserConfirmation(action, true)}
          onCancel={(action) => handleUserConfirmation(action, false)}
          onSolutionFeedback={(solution) => handleSolutionHelped(solution.treatment)}
          onSelectOpenIssue={handleSelectOpenIssue}
          onContinueWithNewIssue={handleContinueWithNewIssue}
          isSubmitting={loading}
          isLoading={loading || isLoadingAI}
          loadingMessage={
            currentStep === 'appliance_recognition' ? t('equipment.searching') :
            currentStep === 'checking_open_issues' ? t('chat.found_open_issues', { count: 0 }) :
            currentStep === 'matching_solutions' ? t('chat.checking_symptoms') :
            currentStep === 'ai_solution_generation' ? t('chat.diagnosing') :
            isFollowUpQuestions ? t('chat.loading_questions') :
            undefined
          }
        />

        {currentStep === 'checking_open_issues' && openIssues && openIssues.length > 0 && (
          <View style={styles.componentContainer}>
            <Divider style={styles.divider} />
            <OpenIssuesDisplay
              issues={openIssues}
              onSelectIssue={handleSelectOpenIssue}
              onContinue={handleContinueWithNewIssue}
            />
          </View>
        )}

        {isFollowUpQuestions && selectedEquipment && !diagnosisResult && !showEnhancedDescriptionApproval && sessionId && (
          <FollowUpQuestionsContainer
            sessionId={sessionId}
            equipment={selectedEquipment}
            onReadyForDiagnosis={(summary, isFinish) => {
              setFollowUpQuestions(!isFinish)
              const message = t('chat.follow_up_summary', { summary });
              chatApi.addMessage(sessionId, message, 'system');
            }}
            onImproveDescription={handleImproveDescription}
          />
        )}

        {showEnhancedDescriptionApproval && (
          <View style={styles.componentContainer}>
            <Divider style={styles.divider} />
            <EnhancedDescriptionApproval
              originalDescription={originalDescription}
              enhancedDescription={enhancedDescription}
              onApprove={handleApproveEnhancedDescription}
              onReject={handleRejectEnhancedDescription}
            />
          </View>
        )}

        {diagnosisResult && (
          <>
            <View style={styles.componentContainer}>
              <Divider style={styles.divider} />
              <ProblemDiagnosisDisplay
                diagnosisType={diagnosisResult.type}
                problems={diagnosisResult.problems}
                diagnosis={diagnosisResult.diagnosis}
                currentBusinessId={selectedBusiness?.id || businessId}
                onSolutionSelect={handleExistingSolutionSelect}
                onRequestMoreInfo={handleRequestMoreInfo}
                onAssignToTechnician={handleAssignToTechnician}
                handleGetAISolutions={handleGetAISolutions}
                onSolutionHelped={handleSolutionHelped}
                isLoadingAI={isLoadingAI}
              />
            </View>

            {(diagnosisResult.type === 'issue_matches' ||
              diagnosisResult.type === 'problem_matches' ||
              diagnosisResult.type === 'ai_diagnosis') && (
              <View style={styles.solutionHeader}>
                <Text style={styles.solutionHeaderText}>
                  {diagnosisResult.type === 'issue_matches'
                    ? t('common.solutions_your_business')
                    : diagnosisResult.type === 'problem_matches'
                    ? t('common.solutions_other_businesses')
                    : t('common.ai_generated_solutions')}
                </Text>
              </View>
            )}
          </>
        )}
        
        {diagnosisResult?.type === 'ai_diagnosis' &&
          diagnosisResult.diagnosis?.suggestedSolutions &&
          diagnosisResult.diagnosis.suggestedSolutions.filter(
            (s) => s.trim().length > 0
          ).length > 0 && (
            <View style={styles.componentContainer}>
              <Divider style={styles.divider} />
              <SolutionSuggestion
                solutions={diagnosisResult.diagnosis.suggestedSolutions.map((treatment, index) => ({
                  treatment,
                  problemId: `ai-${index}`,
                  resolvedBy: 'AI Assistant'
                }))}
                onAcceptSolution={(solution) => handleSolutionAccepted(solution.treatment)}
                onRejectSolution={(solution) => handleSolutionRejected(solution.treatment)}
                onAssignToTechnician={handleAssignToTechnician}
              />
            </View>
          )}

        {/* Solution Suggestion for problem_matches and issue_matches */}
        {(diagnosisResult?.type === 'problem_matches' || diagnosisResult?.type === 'issue_matches') &&
          diagnosisResult.problems &&
          diagnosisResult.problems.length > 0 &&
          diagnosisResult.problems.some(p => p.solutions && p.solutions.length > 0) && (
            <View style={styles.componentContainer}>
              <Divider style={styles.divider} />
              <SolutionSuggestion
                solutions={diagnosisResult.problems
                  .filter(p => p.solutions && p.solutions.length > 0)
                  .flatMap(p => p.solutions!.map(s => ({
                    treatment: s.treatment,
                    problemId: p.id?.toString() || 'unknown',
                    resolvedBy: s.resolvedBy || 'Unknown',
                    parts: [] // Add empty parts array since it's optional
                  })))}
                onAcceptSolution={(solution) => handleSolutionAccepted(solution.treatment)}
                onRejectSolution={(solution) => handleSolutionRejected(solution.treatment)}
                onAssignToTechnician={handleAssignToTechnician}
              />
            </View>
          )}

        <ChatInput
          inputValue={input}
          onChange={setInput}
          onSend={handleSend}
          loading={loading}
          disabled={loading || isLoadingAI}
        />
      </View>
      <BottomNavigation />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  chatContainer: {
    flex: 1,
  },
  componentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  solutionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.lightGray,
  },
  solutionHeaderText: {
    ...typography.h6,
    color: colors.dark,
  },
});

export default ChatScreen;
