import { create } from 'zustand';
import { ChatMessage, Diagnosis, Equipment, Problem } from '../api/chatAPI';

// Define the 12-step flow
export type FlowStep = 
  | 'initial'                    // Step 1: User describes symptom
  | 'appliance_recognition'      // Step 2: AI appliance recognition
  | 'appliance_selection'        // Step 2: User selects from list or adds new
  | 'checking_open_issues'       // Step 3: Check open issues for selected appliance
  | 'open_issues_display'        // Step 3a: Display open issues for user to choose
  | 'user_confirmation'          // Step 3b: User confirms whether to proceed
  | 'follow_up_questions'        // Step 4: Follow-up questions for symptom enhancement
  | 'checking_similar_issues'    // Step 5: Check if symptom+appliance+business combination exists
  | 'matching_solutions'         // Step 6: Get matching symptoms/problems/solutions
  | 'solution_presentation'      // Step 7: Show solution list to user
  | 'solution_testing'           // Step 8: User tries solutions
  | 'solution_feedback'          // Step 9: If solution works → save and close OR continue
  | 'ai_solution_generation'     // Step 10: If no solutions work → suggest AI solutions
  | 'ai_solution_testing'        // Step 11: If AI solution works → create new records
  | 'technician_assignment'      // Step 12: Forward to team member/technician
  | 'completed';

interface ChatState {
  // Flow management
  currentStep: FlowStep;
  flowHistory: FlowStep[];
  
  // Session management
  session: {
    id: number | null;
    messages: ChatMessage[];
  };
  
  // User input and loading states
  ui: {
    input: string;
    loading: boolean;
  };
  
  isFollowUpQuestions: boolean;
  
  // Equipment management
  equipment: {
    options: Equipment[] | null;
    showForm: boolean;
    selected: Equipment | null;
  };

  // Diagnosis and problem solving
  diagnosis: {
    result: {
      type: 'existing_solutions' | 'ai_diagnosis' | 'issue_matches' | 'problem_matches';
      problems?: Problem[];
      issues?: any[];
      diagnosis?: Diagnosis;
    } | null;
    description: {
      initial: string | null;
      enhanced: string;
      original: string;
      showApproval: boolean;
      awaitingApproval: boolean;
    };
    potentialEquipmentTypes: string[];
  };

  // Flow tracking
  openIssues: any[];
  triedSolutions: string[];
  currentSolutionIndex: number;

  // Actions
  setCurrentStep: (step: FlowStep) => void;
  addToFlowHistory: (step: FlowStep) => void;
  setSessionId: (id: number | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setInput: (input: string) => void;
  setLoading: (loading: boolean) => void;
  setApplianceOptions: (options: Equipment[] | null) => void;
  setShowEquipmentForm: (show: boolean) => void;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setDiagnosisResult: (result: any) => void;
  setInitialIssueDescription: (description: string | null) => void;
  setShowEnhancedDescriptionApproval: (show: boolean) => void;
  setEnhancedDescription: (description: string) => void;
  setOriginalDescription: (description: string) => void;
  setAwaitingDescriptionApproval: (awaiting: boolean) => void;
  setPotentialEquipmentTypes: (types: string[]) => void;
  setFollowUpQuestions: (isFollowupQuestions: boolean) => void;
  setOpenIssues: (issues: any[]) => void;
  addTriedSolution: (solution: string) => void;
  setCurrentSolutionIndex: (index: number) => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  currentStep: 'initial' as FlowStep,
  flowHistory: [] as FlowStep[],
  session: {
    id: null,
    messages: [],
  },
  isFollowUpQuestions: false,
  ui: {
    input: '',
    loading: false,
  },
  equipment: {
    options: null,
    showForm: false,
    selected: null,
  },
  diagnosis: {
    result: null,
    description: {
      initial: null,
      enhanced: '',
      original: '',
      showApproval: false,
      awaitingApproval: false,
    },
    potentialEquipmentTypes: [],
  },
  openIssues: [],
  triedSolutions: [],
  currentSolutionIndex: 0,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  // Flow management
  setCurrentStep: (step: FlowStep) => set((state) => ({ 
    ...state, 
    currentStep: step,
    flowHistory: [...state.flowHistory, step]
  })),
  
  addToFlowHistory: (step: FlowStep) => set((state) => ({
    ...state,
    flowHistory: [...state.flowHistory, step]
  })),

  // Follow up questions
  setFollowUpQuestions: (isFollowUpQuestions: boolean) => set((state) => ({ ...state, isFollowUpQuestions })),
  
  // Session actions
  setSessionId: (id: number | null) => set((state) => ({ session: { ...state.session, id } })),
  addMessage: (message: ChatMessage) => set((state) => ({
    session: {
      ...state.session,
      messages: [...state.session.messages, message]
    }
  })),
  setMessages: (messages: ChatMessage[]) => set((state) => ({
    session: { ...state.session, messages }
  })),
  
  // UI actions
  setInput: (input: string) => set((state) => ({
    ui: { ...state.ui, input }
  })),
  setLoading: (loading: boolean) => set((state) => ({
    ui: { ...state.ui, loading }
  })),

  // Equipment actions
  setApplianceOptions: (options: Equipment[] | null) => set((state) => ({
    equipment: { ...state.equipment, options }
  })),
  setShowEquipmentForm: (show: boolean) => set((state) => ({
    equipment: { ...state.equipment, showForm: show }
  })),
  setSelectedEquipment: (equipment: Equipment | null) => set((state) => ({
    equipment: { ...state.equipment, selected: equipment }
  })),

  // Diagnosis actions
  setDiagnosisResult: (result: any) => set((state) => ({
    diagnosis: { ...state.diagnosis, result }
  })),
  setInitialIssueDescription: (description: string | null) => set((state) => ({
    diagnosis: {
      ...state.diagnosis,
      description: { ...state.diagnosis.description, initial: description }
    }
  })),
  setShowEnhancedDescriptionApproval: (show: boolean) => set((state) => ({
    diagnosis: {
      ...state.diagnosis,
      description: { ...state.diagnosis.description, showApproval: show }
    }
  })),
  setEnhancedDescription: (description: string) => set((state) => ({
    diagnosis: {
      ...state.diagnosis,
      description: { ...state.diagnosis.description, enhanced: description }
    }
  })),
  setOriginalDescription: (description: string) => set((state) => ({
    diagnosis: {
      ...state.diagnosis,
      description: { ...state.diagnosis.description, original: description }
    }
  })),
  setAwaitingDescriptionApproval: (awaiting: boolean) => set((state) => ({
    diagnosis: {
      ...state.diagnosis,
      description: { ...state.diagnosis.description, awaitingApproval: awaiting }
    }
  })),
  setPotentialEquipmentTypes: (types: string[]) => set((state) => ({
    diagnosis: { ...state.diagnosis, potentialEquipmentTypes: types }
  })),

  // Flow tracking actions
  setOpenIssues: (issues: any[]) => set((state) => ({ ...state, openIssues: issues })),
  addTriedSolution: (solution: string) => set((state) => ({ 
    ...state, 
    triedSolutions: [...state.triedSolutions, solution] 
  })),
  setCurrentSolutionIndex: (index: number) => set((state) => ({ 
    ...state, 
    currentSolutionIndex: index 
  })),

  // Reset all state
  reset: () => set(initialState),
}));
