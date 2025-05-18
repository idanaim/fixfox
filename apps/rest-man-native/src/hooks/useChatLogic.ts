import { useEffect } from 'react';
import { useChatStore } from '../store/chat.store';
import { chatApi, ChatSession, DescriptionEnhancementResult, Equipment, Problem } from '../api/chatAPI';

interface UseChatLogicProps {
  sessionId: number | null;
  userId: number;
  businessId: number;
  selectedBusinessId: number | null;
}

export const useChatLogic = ({ sessionId, userId, businessId, selectedBusinessId }: UseChatLogicProps) => {
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
          'What can I help with?',
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
          `Found ${equipmentList.length} matching appliance(s). Please select one:`,
          'system'
        );
        addMessage(sysMsg);
        setApplianceOptions(equipmentList);
      } else {
        const sysMsg = await chatApi.addMessage(
          sessionId,
          "We couldn't find a matching appliance. Please provide more details below.",
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
        'Diagnosing the problem...',
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
          ? `Found ${diagnosisData.problems.length} similar problem(s).`
          : 'No similar problems found.';
        const diagSysMsg = await chatApi.addMessage(sessionId, summary, 'system');
        addMessage(diagSysMsg);
      }
    } catch (error) {
      console.error('Error diagnosing issue', error);
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
        `Using enhanced description: "${approvedDescription}"`,
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
        'Using original description for diagnosis.',
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
          "Thank you for the additional information. Is there anything else you'd like to add?",
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
    const sysMsg = await chatApi.addMessage(
      sessionId,
      `Equipment selected: ${equipment.manufacturer} ${equipment.model}`,
      'system'
    );
    addMessage(sysMsg);

    if (initialIssueDescription) {
      try {
        const enhancingMsg = await chatApi.addMessage(
          sessionId,
          'Enhancing problem description based on selected equipment...',
          'system'
        );
        addMessage(enhancingMsg);

        const result: DescriptionEnhancementResult = await chatApi.enhanceProblemDescription(
          sessionId,
          initialIssueDescription,
          equipment
        );

        setOriginalDescription(result.originalDescription);
        setEnhancedDescription(result.enhancedDescription);
        setShowEnhancedDescriptionApproval(true);
        setAwaitingDescriptionApproval(true);
      } catch (error) {
        console.error('Error enhancing description with equipment context:', error);
        await diagnoseIssue(initialIssueDescription, equipment.id);
      }
    }
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
    awaitingDescriptionApproval,

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
  };
};
