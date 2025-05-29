import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chat.store';
import {
  chatApi,
  ChatSession,
  DescriptionEnhancementResult,
  Equipment,
  Problem
} from '../api/chatAPI';
import { useTranslation } from 'react-i18next';
import { QuestionAnswer } from './useFollowUpQuestions';
import authStore from '../store/auth.store';

interface UseChatLogicProps {
  sessionId: number | null;
  userId: number;
  businessId: number;
  selectedBusinessId: number | null;
}

export const useChatLogic = ({ sessionId, userId, businessId, selectedBusinessId }: UseChatLogicProps) => {
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const {
    session: { messages },
    ui: { input, loading },
    equipment: {
      options: applianceOptions,
      showForm: showEquipmentForm,
      selected: selectedEquipment,
    },
    diagnosis: {
      result: diagnosisResult,
      description: {
        initial: initialIssueDescription,
        enhanced: enhancedDescription,
        original: originalDescription,
        showApproval: showEnhancedDescriptionApproval,
        awaitingApproval: awaitingDescriptionApproval,
      },
    },
    isFollowUpQuestions,
    setFollowUpQuestions,
    setSessionId,
    addMessage,
    setMessages,
    setInput,
    reset,
    setLoading,
    setApplianceOptions,
    setShowEquipmentForm,
    setSelectedEquipment,
    setDiagnosisResult,
    setInitialIssueDescription,
    setShowEnhancedDescriptionApproval,
    setEnhancedDescription,
    setOriginalDescription,
    setAwaitingDescriptionApproval,
  } = useChatStore();

  const { t, i18n } = useTranslation();

  // Initialize chat session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        reset();
        const session: ChatSession = await chatApi.createSession(
          selectedBusinessId || businessId,
          userId
        );
        setSessionId(session.id);
        const systemMsg = await chatApi.addMessage(
          session.id,
          t('chat.session_started'),
          'system'
        );
        setMessages([systemMsg]);
      } catch (error) {
        console.error('Error starting session', error);
      }
    };

    initializeSession();
  }, [selectedBusinessId, userId]);

  // Process appliance recognition from the initial description
  const processApplianceRecognition = async (description: string) => {
    if (!sessionId) return;

    try {
      const searchParameter = description.toLowerCase().trim();
      const equipmentList = await chatApi.searchEquipment(
        sessionId,
        selectedBusinessId || businessId,
        searchParameter
      );

      if (equipmentList && equipmentList.length > 0) {
        const sysMsg = await chatApi.addMessage(
          sessionId,
          t('equipment.found_matching', { count: equipmentList.length }),
          'system'
        );
        addMessage(sysMsg);
        setApplianceOptions(equipmentList);
      } else {
        const sysMsg = await chatApi.addMessage(
          sessionId,
          t('equipment.no_matching'),
          'system'
        );
        addMessage(sysMsg);
        setShowEquipmentForm(true);
      }
    } catch (error) {
      console.error('Error in appliance recognition', error);
    }
  };

  // Diagnose issue after appliance selection
  const diagnoseIssue = async (issueDescription: string, equipmentId: number) => {
    if (!sessionId) return;

    try {
      const sysMsg = await chatApi.addMessage(
        sessionId,
        t('chat.diagnosing'),
        'system'
      );
      addMessage(sysMsg);

      const diagnosisData = await chatApi.diagnoseProblem(
        issueDescription,
        equipmentId,
        selectedBusinessId || businessId,
        sessionId
      );

      setDiagnosisResult(diagnosisData);

      if (diagnosisData.type === 'existing_solutions') {
        const summary = diagnosisData.problems && diagnosisData.problems.length > 0
          ? t('chat.found_similar_problems', { count: diagnosisData.problems.length })
          : t('chat.no_similar_problems');
        const diagSysMsg = await chatApi.addMessage(sessionId, summary, 'system');
        addMessage(diagSysMsg);
      }
    } catch (error) {
      console.error('Error diagnosing issue', error);
    }
  };

  // Get AI solutions only (skip similar solutions)
  const handleGetAISolutions = async () => {
    if (!sessionId || !selectedEquipment) {
      console.error('No session ID or selected equipment available');
      return;
    }

    try {
      setIsLoadingAI(true);

      const sysMsg = await chatApi.addMessage(
        sessionId,
        t('chat.generating_ai_solutions', { defaultValue: 'Generating new AI solutions...' }),
        'system'
      );
      addMessage(sysMsg);

      // Use the final description (enhanced if approved, or original if rejected/not enhanced)
      const problemDescription = initialIssueDescription || enhancedDescription || messages.filter(m => m.type === 'user').pop()?.content;

      if (!problemDescription) {
        console.error('No problem description found');
        return;
      }

      const diagnosisData = await chatApi.diagnoseProblem(
        problemDescription,
        selectedEquipment.id,
        selectedBusinessId || businessId,
        sessionId,
        true // skipSimilar = true
      );

      setDiagnosisResult(diagnosisData);

      const aiSolutionsMsg = await chatApi.addMessage(
        sessionId,
        t('chat.ai_solutions_generated', { defaultValue: 'AI solutions generated based on your description.' }),
        'system'
      );
      addMessage(aiSolutionsMsg);
    } catch (error) {
      console.error('Error getting AI solutions', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Handle enhanced description approval
  const handleApproveEnhancedDescription = async (approvedDescription: string) => {
    setShowEnhancedDescriptionApproval(false);
    setAwaitingDescriptionApproval(false);

    if (!sessionId || !selectedEquipment) return;

    try {
      const approvedMsg = await chatApi.addMessage(
        sessionId,
        t('chat.using_enhanced_description', { description: approvedDescription }),
        'system'
      );
      addMessage(approvedMsg);

      setInitialIssueDescription(approvedDescription);
      await diagnoseIssue(approvedDescription, selectedEquipment.id);
    } catch (error) {
      console.error('Error after description approval:', error);
    }
  };

  // Handle enhanced description rejection
  const handleRejectEnhancedDescription = async () => {
    setShowEnhancedDescriptionApproval(false);
    setAwaitingDescriptionApproval(false);

    if (!sessionId || !selectedEquipment) return;

    try {
      const rejectMsg = await chatApi.addMessage(
        sessionId,
        t('chat.using_original_description'),
        'system'
      );
      addMessage(rejectMsg);

      await diagnoseIssue(originalDescription, selectedEquipment.id);
    } catch (error) {
      console.error('Error after description rejection:', error);
    }
  };

  // Handle sending chat messages
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    try {
      setLoading(true);

      const userMessage = await chatApi.addMessage(sessionId, input, 'user', {
        userId,
      });
      addMessage(userMessage);

      if (!initialIssueDescription && !awaitingDescriptionApproval) {
        setInitialIssueDescription(input);
        await processApplianceRecognition(input);
      } else if (awaitingDescriptionApproval) {
        // Do nothing, waiting for approval
      } else if (!selectedEquipment) {
        await processApplianceRecognition(input);
      } else {
        const followUpMsg = await chatApi.addMessage(
          sessionId,
          t('chat.additional_info_prompt'),
          'system'
        );
        addMessage(followUpMsg);
      }

      setInput('');
    } catch (error) {
      console.error('Error sending message', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle equipment selection
  const handleEquipmentSelect = async (equipment: Equipment) => {
    if (!sessionId) return;

    setSelectedEquipment(equipment);
    setApplianceOptions(null);
    setFollowUpQuestions(true);
    const sysMsg = await chatApi.addMessage(
      sessionId,
      `${t('chat.equipment_selected')}: ${equipment.manufacturer} ${equipment.model}`,
      'system',
      equipment
    );
    addMessage(sysMsg);
  };

  // Handle equipment form submission
  const handleEquipmentFormSubmit = async (formData: Partial<Equipment>) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const newEquipment = await chatApi.createEquipment({
        businessId: selectedBusinessId || businessId,
        ...formData,
      });
      setSelectedEquipment(newEquipment);
      setShowEquipmentForm(false);
      const sysMsg = await chatApi.addMessage(
        sessionId,
        `New equipment added: ${newEquipment.manufacturer} ${newEquipment.model}`,
        'system'
      );
      addMessage(sysMsg);
      if (initialIssueDescription) {
        await diagnoseIssue(initialIssueDescription, newEquipment.id);
      }
    } catch (error) {
      console.error('Error creating equipment', error);
    } finally {
      setLoading(false);
    }
  };

  // Create issue with solution
  const createIssueWithSolution = async (solutionText: string, effectiveness: number) => {
    if (!initialIssueDescription || !selectedEquipment || !sessionId) {
      console.error('Missing necessary information to create the issue.');
      return;
    }

    try {
      const problemDto = { description: initialIssueDescription };
      const solutionDto = solutionText.trim().length > 0
        ? {
            cause: diagnosisResult?.diagnosis?.possibleCauses.join(', ') || 'N/A',
            treatment: solutionText,
            resolvedBy: 'User',
            effectiveness,
          }
        : undefined;

      const issue = await chatApi.createIssue(
        sessionId,
        selectedEquipment.id,
        problemDto,
        solutionDto
      );
      const sysMsg = await chatApi.addMessage(
        sessionId,
        `Issue created successfully (Issue ID: ${issue.id}).`,
        'system'
      );
      addMessage(sysMsg);
      setDiagnosisResult(null);
    } catch (error) {
      console.error('Error creating issue with solution', error);
    }
  };

  // Handle solution acceptance
  const handleSolutionAccepted = async (solutionText: string) => {
    await createIssueWithSolution(solutionText, 1);
  };

  // Handle solution rejection
  const handleSolutionRejected = async (solutionText: string) => {
    await createIssueWithSolution(solutionText, 0);
  };

  // Handle existing solution selection
  const handleExistingSolutionSelect = (problem: Problem) => {
    console.log('User selected an existing problem for further review:', problem);
  };

  // Handle request for more information
  const handleRequestMoreInfo = async () => {
    if (!sessionId) return;

    try {
      const sysMsg = await chatApi.addMessage(
        sessionId,
        'Can you please be more specific with your problem description? Please provide additional details.',
        'system'
      );
      addMessage(sysMsg);
    } catch (error) {
      console.error('Error requesting more info', error);
    }
  };

  // Handle description improvement
  const handleImproveDescription = async (followUpQuestions: QuestionAnswer[] = []) => {
    if (!sessionId || !selectedEquipment) return;
console.log('Improving description with follow-up questions:', followUpQuestions);
    try {
      const sysMsg = await chatApi.addMessage(
        sessionId,
        t('chat.enhancing_description'),
        'system'
      );
      addMessage(sysMsg);

      // Convert QuestionAnswer[] to the format expected by the API
      // The API expects type to be one of: 'timing', 'symptom', 'context', 'severity'
      const followUpQuestionsForApi = followUpQuestions.map(qa => {
        // Use a default type if we can't determine the actual type
        let questionType: 'timing' | 'symptom' | 'context' | 'severity' = 'context';

        // Try to determine the type from the question
        const lowerQuestion = qa.question.toLowerCase();
        if (lowerQuestion.includes('when') || lowerQuestion.includes('time')) {
          questionType = 'timing';
        } else if (lowerQuestion.includes('symptom') || lowerQuestion.includes('notice')) {
          questionType = 'symptom';
        } else if (lowerQuestion.includes('severe') || lowerQuestion.includes('bad')) {
          questionType = 'severity';
        }

        return {
          question: qa.question,
          answer: qa.answer,
          type: questionType
        };
      });

      const result: DescriptionEnhancementResult = await chatApi.enhanceProblemDescription(
        sessionId,
        initialIssueDescription || '',
        selectedEquipment,
        followUpQuestionsForApi
      );

      setOriginalDescription(result.originalDescription);
      setEnhancedDescription(result.enhancedDescription);
      setShowEnhancedDescriptionApproval(true);
      setAwaitingDescriptionApproval(true);
    } catch (error) {
      console.error('Error improving description:', error);
    }
  };

  // Handle assigning issue to default technician
  const handleAssignToTechnician = async () => {
    try {
      if (!sessionId) {
        console.error('No session ID available');
        return;
      }

      // Use the final description (enhanced if approved, or original if rejected/not enhanced)
      const problemDescription = initialIssueDescription || enhancedDescription || messages.filter(m => m.type === 'user').pop()?.content;

      if (!problemDescription) {
        console.error('No problem description found');
        return;
      }

      const result = await chatApi.createIssueWithTechnicianAssignment(
        selectedBusinessId || businessId,
        userId,
        problemDescription,
        selectedEquipment || undefined
      );

      // Add a system message to the chat
      const message = t('diagnosis.technicianAssigned', {
        defaultValue: 'Issue has been assigned to the default technician for your business.'
      });

      if (sessionId) {
        await chatApi.addMessage(sessionId, message, 'system');
        // Refresh messages to show the new system message
        addMessage({
          id: Date.now(),
          content: message,
          type: 'system',
          createdAt: new Date().toISOString(),
          metadata: {}
        });
      }

      // Reset the chat state after successful assignment
      resetChatState();

      console.log('Issue assigned to technician:', result);
    } catch (error) {
      console.error('Error assigning issue to technician:', error);
      // You might want to show an error message to the user here
    }
  };

  // After we create the issue, we can reset all the state related to the chat
  const resetChatState = () => {
    setApplianceOptions(null);
    setShowEquipmentForm(false);
    setSelectedEquipment(null);
    setDiagnosisResult(null);
    setInitialIssueDescription('');
    setEnhancedDescription('');
    setOriginalDescription('');
    setShowEnhancedDescriptionApproval(false);
    setAwaitingDescriptionApproval(false);
  };

  // Handle solution helped button click
  const handleSolutionHelped = async (solutionId: number, problemDescription: string) => {
    try {
      if (!sessionId) {
        console.error('No session ID available');
        return;
      }

      // Record that the solution was effective and create an issue
      const result = await chatApi.recordSolutionEffectiveness(
        solutionId,
        true, // effective = true
        selectedBusinessId || businessId,
        userId,
        problemDescription,
        selectedEquipment || undefined
      );

      // Add a system message to the chat
      const message = t('diagnosis.solutionHelped', {
        defaultValue: 'Thank you for the feedback! Solution effectiveness has been recorded and an issue has been created.'
      });

      if (sessionId) {
        await chatApi.addMessage(sessionId, message, 'system');
        // Refresh messages to show the new system message
        addMessage({
          id: Date.now(),
          content: message,
          type: 'system',
          createdAt: new Date().toISOString(),
          metadata: {}
        });
      }
      // Reset the chat state after successful recording
      resetChatState();

      console.log('Solution effectiveness recorded and issue created:', result);
    } catch (error) {
      console.error('Error recording solution effectiveness:', error);
      // You might want to show an error message to the user here
    }
  };

  return {
    // State
    messages,
    input,
    loading,
    applianceOptions,
    showEquipmentForm,
    selectedEquipment,
    diagnosisResult,
    initialIssueDescription,
    enhancedDescription,
    originalDescription,
    showEnhancedDescriptionApproval,
    isFollowUpQuestions,
    isLoadingAI,

    // Actions

    setFollowUpQuestions,
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
    setApplianceOptions,
    setShowEquipmentForm,

    // Additional methods for external use
    resetChatState,
    addMessage,
    handleAssignToTechnician,
    handleGetAISolutions,
    handleSolutionHelped
  };
};
