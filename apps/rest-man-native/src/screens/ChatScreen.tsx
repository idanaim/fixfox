// screens/ChatScreen.tsx
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import ChatHeader from '../components/chat/Header/ChatHeader';
import ChatMessages from '../components/chat/Message/ChatMessages';
import ChatInput from '../components/chat/Input/ChatInput';
import ApplianceSelector from '../components/ApplianceSelector';
import EquipmentForm from '../components/EquipmentForm';
import SolutionSuggestion from '../components/SolutionSuggestion';
import ProblemDiagnosisDisplay from '../components/ProblemDiagnosisDisplay';
import EnhancedDescriptionApproval from '../components/EnhancedDescriptionApproval';
import FollowUpQuestionsContainer from '../components/FollowUpQuestionsContainer';
import { useBusinesses } from '../hooks/useBusinesses';
import { useChatLogic } from '../hooks/useChatLogic';
import { useChatStore } from '../store/chat.store';
import { colors, typography } from '../componentsBackup/admin-dashboard/admin-dashboard-styles';
import { chatApi } from '../api/chatAPI';

interface RouteParams {
  businessId: number;
  userId: number;
}

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const { businessId, userId } = route.params as RouteParams;
  const { businesses, selectedBusiness, setSelectedBusiness } = useBusinesses();
  const { session: { id: sessionId },    isFollowUpQuestions, setFollowUpQuestions} = useChatStore();
  const { t } = useTranslation();

  const {
    // State
    messages,
    input,
    loading,
    applianceOptions,
    showEquipmentForm,
    selectedEquipment,
    diagnosisResult,
    enhancedDescription,
    originalDescription,
    showEnhancedDescriptionApproval,

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
    setApplianceOptions,
    setShowEquipmentForm,
    handleImproveDescription,
    handleAssignToTechnician
  } = useChatLogic({
    sessionId: sessionId ? Number(sessionId) : null,
    userId,
    businessId,
    selectedBusinessId: selectedBusiness?.id || null,
  });

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
      <View style={styles.chatContainer}>
        <ChatMessages messages={messages} />

        {/* Appliance Selector */}
        {applianceOptions && (
          <View style={styles.componentContainer}>
            <Divider style={styles.divider} />
            <ApplianceSelector
              equipmentList={applianceOptions}
              onSelect={handleEquipmentSelect}
              onAddNew={() => {
                setApplianceOptions(null);
                setShowEquipmentForm(true);
              }}
            />
          </View>
        )}

        {/* Equipment Form */}
        {showEquipmentForm && (
          <View style={styles.componentContainer}>
            <Divider style={styles.divider} />
            <EquipmentForm
              onSubmit={handleEquipmentFormSubmit}
              loading={loading}
            />
          </View>
        )}

        {/* Add FollowUpQuestionsContainer right after the equipment selection */}
        {isFollowUpQuestions && selectedEquipment && !diagnosisResult && !showEnhancedDescriptionApproval && sessionId && (
          <FollowUpQuestionsContainer
            sessionId={sessionId}
            equipment={selectedEquipment}
            onReadyForDiagnosis={(summary,isFinish) => {
              setFollowUpQuestions(!isFinish)
              // Send a message to the chat API with the summary
              const message = t('chat.follow_up_summary', { summary });
              chatApi.addMessage(sessionId, message, 'system');
              // The description improvement will be triggered automatically by FollowUpQuestionsContainer
            }}
            onImproveDescription={handleImproveDescription}
          />
        )}

        {/* Enhanced Description Approval Dialog */}
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

        {/* Display problem diagnosis results */}
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
              />
            </View>

            {/* Add a message when we have solutions */}
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
        {/* Show solutions based on the diagnosis type */}
        {diagnosisResult?.type === 'ai_diagnosis' &&
          diagnosisResult.diagnosis?.suggestedSolutions &&
          diagnosisResult.diagnosis.suggestedSolutions.filter(
            (s) => s.trim().length > 0
          ).length > 0 && (
            <View style={styles.componentContainer}>
              <Divider style={styles.divider} />
              <SolutionSuggestion
                solutions={diagnosisResult.diagnosis.suggestedSolutions
                  .filter((s) => s.trim().length > 0)
                  .map((treatment, index) => ({
                    treatment,
                    problemId: `ai-${index}`,
                    resolvedBy: 'AI Assistant'
                  }))}
                onAcceptSolution={(solution) => handleSolutionAccepted(solution.treatment)}
                onRejectSolution={(solution) => handleSolutionRejected(solution.treatment)}
              />
            </View>
          )}

        {/* Show solutions from current business issues */}
        {diagnosisResult?.type === 'issue_matches' &&
          diagnosisResult.issues &&
          diagnosisResult.issues
            .filter((issue) => issue.solution)
            .map((issue) => issue.solution?.treatment || '')
            .filter((treatment) => treatment.trim().length > 0).length > 0 && (
            <View style={styles.componentContainer}>
              <Divider style={styles.divider} />
              <SolutionSuggestion
                solutions={diagnosisResult.issues
                  .filter((issue) => issue.solution)
                  .map((issue) => issue.solution?.treatment || '')
                  .filter((treatment) => treatment.trim().length > 0)
                  .map((treatment, index) => ({
                    treatment,
                    problemId: `business-${index}`,
                    resolvedBy: 'Your Business'
                  }))}
                onAcceptSolution={(solution) => handleSolutionAccepted(solution.treatment)}
                onRejectSolution={(solution) => handleSolutionRejected(solution.treatment)}
              />
            </View>
          )}

        {/* Show solutions from other businesses' problems */}
        {diagnosisResult?.type === 'problem_matches' &&
          diagnosisResult.problems &&
          diagnosisResult.problems
            .filter(
              (problem) => problem.solutions && problem.solutions.length > 0
            )
            .map((problem) => problem.solutions?.[0]?.treatment || '')
            .filter((treatment) => treatment.trim().length > 0).length > 0 && (
            <View style={styles.componentContainer}>
              <Divider style={styles.divider} />
              <SolutionSuggestion
                solutions={diagnosisResult.problems
                  .filter(
                    (problem) => problem.solutions && problem.solutions.length > 0
                  )
                  .map((problem) => problem.solutions?.[0]?.treatment || '')
                  .filter((treatment) => treatment.trim().length > 0)
                  .map((treatment, index) => ({
                    treatment,
                    problemId: `community-${index}`,
                    resolvedBy: 'Community'
                  }))}
                onAcceptSolution={(solution) => handleSolutionAccepted(solution.treatment)}
                onRejectSolution={(solution) => handleSolutionRejected(solution.treatment)}
              />
            </View>
          )}
      </View>

      <ChatInput
        inputValue={input}
        onChange={setInput}
        onSend={handleSend}
        loading={loading}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  componentContainer: {
    backgroundColor: colors.white,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  solutionHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 2,
  },
  solutionHeaderText: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 4,
  },
});

export default ChatScreen;
