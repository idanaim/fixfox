import { useEffect, useState } from 'react';
import { useChatStore, FlowStep } from '../store/chat.store';
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
    currentStep,
    flowHistory,
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
    openIssues,
    triedSolutions,
    currentSolutionIndex,
    isFollowUpQuestions,
    setCurrentStep,
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
    setOpenIssues,
    addTriedSolution,
    setCurrentSolutionIndex,
  } = useChatStore();

  const { t, i18n } = useTranslation();

  // Initialize chat session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        reset();
        setCurrentStep('initial');
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

  // STEP 1: User describes symptom (handled by handleSend)
  
  // STEP 2: AI appliance recognition → user selects from list or adds new
  const processApplianceRecognition = async (description: string) => {
    if (!sessionId) return;

    try {
      setCurrentStep('appliance_recognition');
      const searchParameter = description.toLowerCase().trim();
      const equipmentList = await chatApi.searchEquipment(
        sessionId,
        selectedBusinessId || businessId,
        searchParameter
      );

      setCurrentStep('appliance_selection');
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

  // STEP 3: Check open issues for selected appliance
  const checkOpenIssues = async (equipmentId: number) => {
    if (!sessionId) return;

    try {
      setCurrentStep('checking_open_issues');
      const openIssuesResponse = await chatApi.getOpenIssues(
        sessionId,
        equipmentId,
        selectedBusinessId || businessId
      );
      
      setOpenIssues(openIssuesResponse);
      
      if (openIssuesResponse.length > 0) {
        const sysMsg = await chatApi.addMessage(
          sessionId,
          t('chat.found_open_issues', { count: openIssuesResponse.length }),
          'system'
        );
        addMessage(sysMsg);
        // Add confirmation message
        const confirmMsg = await chatApi.addMessage(
          sessionId,
          t('chat.confirm_continue_new_issue'),
          'system',
          {
            type: 'confirmation',
            action: 'continue_new_issue'
          }
        );
        addMessage(confirmMsg);
      } else {
        // If no open issues, proceed directly to follow-up questions
        setCurrentStep('follow_up_questions');
        setFollowUpQuestions(true);
      }
    } catch (error) {
      console.error('Error checking open issues', error);
      // On error, proceed to follow-up questions
      setCurrentStep('follow_up_questions');
      setFollowUpQuestions(true);
    }
  };

  // STEP 4: Follow-up questions for symptom enhancement (handled by FollowUpQuestionsContainer)

  // STEP 5: Check if symptom+appliance+business combination exists in issues
  const checkSimilarIssues = async (enhancedDescription: string) => {
    if (!sessionId || !selectedEquipment) return;

    try {
      setCurrentStep('checking_similar_issues');
      const similarIssues = await chatApi.checkSimilarIssues(
        sessionId,
        enhancedDescription,
        selectedEquipment.id,
        selectedBusinessId || businessId
      );
      
      if (similarIssues.length > 0) {
        // Found exact matches in current business
        setCurrentStep('solution_presentation');
        const diagnosisData = {
          type: 'issue_matches' as const,
          issues: similarIssues,
          message: t('chat.found_similar_issues_business')
        };
        setDiagnosisResult(diagnosisData);
        return;
      }
      
      // No exact matches, proceed to step 6
      await getMatchingSolutions(enhancedDescription);
    } catch (error) {
      console.error('Error checking similar issues', error);
      await getMatchingSolutions(enhancedDescription);
    }
  };

  // STEP 6: Get matching symptoms/problems/solutions from database
  const getMatchingSolutions = async (description: string) => {
    if (!sessionId || !selectedEquipment) return;

    try {
      setCurrentStep('matching_solutions');
      const problemMatches = await chatApi.getMatchingProblems(
        sessionId,
        description,
        selectedEquipment.id,
        selectedBusinessId || businessId
      );
      
      if (problemMatches.length > 0) {
        setCurrentStep('solution_presentation');
        const diagnosisData = {
          type: 'problem_matches' as const,
          problems: problemMatches,
          message: t('chat.found_similar_problems_other_businesses')
        };
        setDiagnosisResult(diagnosisData);
        return;
      }
      
      // No matches found, suggest AI solutions
      await suggestAISolutions(description);
    } catch (error) {
      console.error('Error getting matching solutions', error);
      await suggestAISolutions(description);
    }
  };

  // STEP 7: Show solution list to user (handled by ProblemDiagnosisDisplay)

  // STEP 8: User tries solutions (handled by solution feedback)

  // STEP 9: If solution works → save and close issue OR If no solutions work → continue
  const handleSolutionFeedback = async (solutionText: string, worked: boolean) => {
    if (!sessionId || !selectedEquipment) return;

    try {
      setCurrentStep('solution_feedback');
      addTriedSolution(solutionText);
      
      if (worked) {
        // Solution worked - save and close
        await chatApi.saveSolutionSuccess(
          sessionId,
          solutionText,
          selectedEquipment.id,
          selectedBusinessId || businessId
        );
        
        const successMsg = await chatApi.addMessage(
          sessionId,
          t('chat.solution_worked'),
          'system'
        );
        addMessage(successMsg);
        
        setCurrentStep('completed');
        return;
      }
      
      // Solution didn't work - check if we have more solutions to try
      const remainingSolutions = diagnosisResult?.problems?.filter(
        p => p.solutions && !triedSolutions.includes(p.solutions[0]?.treatment)
      ) || [];
      
      if (remainingSolutions.length > 0) {
        // Still have solutions to try
        setCurrentSolutionIndex(currentSolutionIndex + 1);
        const nextMsg = await chatApi.addMessage(
          sessionId,
          t('chat.try_next_solution'),
          'system'
        );
        addMessage(nextMsg);
        return;
      }
      
      // No more solutions - proceed to AI solutions
      await suggestAISolutions(initialIssueDescription || enhancedDescription);
    } catch (error) {
      console.error('Error handling solution feedback', error);
    }
  };

  // STEP 10: If no solutions work → suggest AI solutions
  const suggestAISolutions = async (description: string) => {
    if (!sessionId || !selectedEquipment) return;

    try {
      setCurrentStep('ai_solution_generation');
      setIsLoadingAI(true);

      const sysMsg = await chatApi.addMessage(
        sessionId,
        t('chat.generating_ai_solutions'),
        'system'
      );
      addMessage(sysMsg);

      const diagnosisData = await chatApi.diagnoseProblem(
        description,
        selectedEquipment.id,
        selectedBusinessId || businessId,
        sessionId,
        true // skipSimilar = true for AI-only solutions
      );

      setCurrentStep('solution_presentation');
      setDiagnosisResult(diagnosisData);

      const aiSolutionsMsg = await chatApi.addMessage(
        sessionId,
        t('chat.ai_solutions_generated'),
        'system'
      );
      addMessage(aiSolutionsMsg);
    } catch (error) {
      console.error('Error getting AI solutions', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // STEP 11: If AI solution works → create new problem/solution/symptom records
  const handleAISolutionSuccess = async (solutionText: string) => {
    if (!sessionId || !selectedEquipment) return;

    try {
      setCurrentStep('ai_solution_testing');
      
      // Create new problem and solution records
      await chatApi.createNewProblemSolution(
        sessionId,
        {
          description: initialIssueDescription || enhancedDescription,
          equipmentId: selectedEquipment.id,
          businessId: selectedBusinessId || businessId,
          userId: userId
        },
        {
          treatment: solutionText,
          effectiveness: 100, // User confirmed it worked
          resolvedBy: 'AI Assistant'
        }
      );
      
      const successMsg = await chatApi.addMessage(
        sessionId,
        t('chat.ai_solution_worked_saved'),
        'system'
      );
      addMessage(successMsg);
      
      setCurrentStep('completed');
    } catch (error) {
      console.error('Error saving AI solution success', error);
    }
  };

  // STEP 12: Forward to team member/technician with enhanced description
  const handleAssignToTechnician = async () => {
    if (!sessionId || !selectedEquipment) return;

    try {
      setCurrentStep('technician_assignment');
      
      const enhancedDesc = await chatApi.createEnhancedDescription(
        sessionId,
        initialIssueDescription || enhancedDescription,
        selectedEquipment,
        triedSolutions
      );
      
      await chatApi.assignToTechnician(
        sessionId,
        {
          equipmentId: selectedEquipment.id,
          businessId: selectedBusinessId || businessId,
          description: enhancedDesc,
          triedSolutions: triedSolutions,
          priority: 'medium' // Could be determined by AI
        }
      );
      
      const assignedMsg = await chatApi.addMessage(
        sessionId,
        t('chat.assigned_to_technician'),
        'system'
      );
      addMessage(assignedMsg);
      
      setCurrentStep('completed');
    } catch (error) {
      console.error('Error assigning to technician', error);
    }
  };

  // Existing methods updated to work with the new flow

  const handleApproveEnhancedDescription = async (approvedDescription: string) => {
    if (!sessionId) return;

    try {
      setEnhancedDescription(approvedDescription);
      setShowEnhancedDescriptionApproval(false);
      setAwaitingDescriptionApproval(false);

      const approvalMsg = await chatApi.addMessage(
        sessionId,
        t('chat.description_approved'),
        'system'
      );
      addMessage(approvalMsg);

      // Proceed to step 5: Check similar issues
      await checkSimilarIssues(approvedDescription);
    } catch (error) {
      console.error('Error approving enhanced description', error);
    }
  };

  const handleRejectEnhancedDescription = async () => {
    if (!sessionId) return;

    try {
      setShowEnhancedDescriptionApproval(false);
      setAwaitingDescriptionApproval(false);

      const rejectionMsg = await chatApi.addMessage(
        sessionId,
        t('chat.description_rejected'),
        'system'
      );
      addMessage(rejectionMsg);

      // Use original description and proceed to step 5
      const originalDesc = originalDescription || initialIssueDescription || '';
      await checkSimilarIssues(originalDesc);
    } catch (error) {
      console.error('Error rejecting enhanced description', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    try {
      setLoading(true);
      const userMessage = await chatApi.addMessage(sessionId, input.trim(), 'user');
      addMessage(userMessage);
      setInitialIssueDescription(input.trim());
      setInput('');

      // Start the flow: Step 1 → Step 2
      await processApplianceRecognition(input.trim());
    } catch (error) {
      console.error('Error sending message', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentSelect = async (equipment: Equipment) => {
    if (!sessionId) return;

    try {
      setSelectedEquipment(equipment);
      setApplianceOptions(null);

      const selectionMsg = await chatApi.addMessage(
        sessionId,
        t('equipment.selected', { name: `${equipment.manufacturer} ${equipment.model}` }),
        'system'
      );
      addMessage(selectionMsg);

      // Proceed to step 3: Check open issues
      await checkOpenIssues(equipment.id);
    } catch (error) {
      console.error('Error selecting equipment', error);
    }
  };

  const handleEquipmentFormSubmit = async (formData: Partial<Equipment>) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const newEquipment = await chatApi.createEquipment({
        ...formData,
        businessId: selectedBusinessId || businessId,
      });

      setSelectedEquipment(newEquipment);
      setShowEquipmentForm(false);

      const creationMsg = await chatApi.addMessage(
        sessionId,
        t('equipment.created', { name: `${newEquipment.manufacturer} ${newEquipment.model}` }),
        'system'
      );
      addMessage(creationMsg);

      // Proceed to step 3: Check open issues
      await checkOpenIssues(newEquipment.id);
    } catch (error) {
      console.error('Error creating equipment', error);
    } finally {
      setLoading(false);
    }
  };

  // Updated solution handling methods
  const handleSolutionAccepted = async (solutionText: string) => {
    await handleSolutionFeedback(solutionText, true);
  };

  const handleSolutionRejected = async (solutionText: string) => {
    await handleSolutionFeedback(solutionText, false);
  };

  const handleExistingSolutionSelect = (problem: Problem) => {
    // Show solution details or mark as tried
    if (problem.solutions && problem.solutions.length > 0) {
      const solution = problem.solutions[0];
      // Could show a modal or expand details
      console.log('Selected solution:', solution.treatment);
    }
  };

  const handleRequestMoreInfo = async () => {
    // Go back to follow-up questions or request technician
    setCurrentStep('follow_up_questions');
    setFollowUpQuestions(true);
  };

  const handleImproveDescription = async (followUpQuestions: QuestionAnswer[] = []) => {
    if (!sessionId || !selectedEquipment) return;

    try {
      setLoading(true);
      const userMessages = messages.filter(m => m.type === 'user').map(m => m.content);
      const combinedDescription = userMessages.join('\n');

      const enhancementResult: DescriptionEnhancementResult = await chatApi.enhanceDescription(
        sessionId,
        combinedDescription,
        selectedEquipment,
        followUpQuestions
      );

      setOriginalDescription(enhancementResult.originalDescription);
      setEnhancedDescription(enhancementResult.enhancedDescription);
      setShowEnhancedDescriptionApproval(true);
      setAwaitingDescriptionApproval(true);
    } catch (error) {
      console.error('Error improving description', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAISolutions = async () => {
    const description = initialIssueDescription || enhancedDescription || messages.filter(m => m.type === 'user').pop()?.content;
    if (description) {
      await suggestAISolutions(description);
    }
  };

  const handleSolutionHelped = async (solutionText: string) => {
    await handleSolutionFeedback(solutionText, true);
  };

  const handleSelectOpenIssue = async (issue: any) => {
    try {
      // Add a message about selecting an existing issue
      const message = t('chat.selecting_existing_issue', { issueId: issue.id });
      await chatApi.addMessage(sessionId!, message, 'system');

      // Update the diagnosis result with the selected issue
      setDiagnosisResult({
        type: 'issue_matches',
        issues: [issue]
      });

      // Move to solution presentation step
      setCurrentStep('solution_presentation');
    } catch (error) {
      console.error('Error selecting open issue:', error);
      const errorMessage = t('errors.selecting_issue');
      await chatApi.addMessage(sessionId!, errorMessage, 'system');
    }
  };

  const handleContinueWithNewIssue = async () => {
    try {
      // Add a message about continuing with a new issue
      const message = t('chat.continuing_with_new_issue');
      await chatApi.addMessage(sessionId!, message, 'system');

      // Add a confirmation request message
      const confirmMessage = t('chat.confirm_continue_new_issue');
      await chatApi.addMessage(sessionId!, confirmMessage, 'system', {
        type: 'confirmation',
        action: 'continue_new_issue'
      });

      // Don't automatically move to follow-up questions
      // The user needs to confirm first via handleUserConfirmation
    } catch (error) {
      console.error('Error continuing with new issue:', error);
      const errorMessage = t('errors.continuing_with_new_issue');
      await chatApi.addMessage(sessionId!, errorMessage, 'system');
    }
  };

  const handleUserConfirmation = async (action: string, confirmed: boolean) => {
    if (action === 'continue_new_issue' && confirmed) {
      // User confirmed to continue with new issue
      const message = t('chat.starting_follow_up');
      await chatApi.addMessage(sessionId!, message, 'system');
      setCurrentStep('follow_up_questions');
    } else if (action === 'continue_new_issue' && !confirmed) {
      // User declined to continue with new issue
      const message = t('chat.cancelled_new_issue');
      await chatApi.addMessage(sessionId!, message, 'system');
      // Stay on the current step to let user choose an existing issue
    }
  };

  const resetChatState = () => {
    reset();
    setCurrentStep('initial');
  };

  return {
    // State
    currentStep,
    flowHistory,
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
    isLoadingAI,
    openIssues,
    triedSolutions,

    // Actions
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
    handleAssignToTechnician,
    handleGetAISolutions,
    handleSolutionHelped,
    handleSelectOpenIssue,
    handleContinueWithNewIssue,
    handleUserConfirmation,
    resetChatState,

    // New flow-specific actions
    checkOpenIssues,
    checkSimilarIssues,
    getMatchingSolutions,
    suggestAISolutions,
    handleAISolutionSuccess,
  };
};
