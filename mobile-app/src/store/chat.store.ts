import { create } from 'zustand';
import { ChatMessage, Diagnosis, Equipment, Problem } from '../api/chatAPI';

interface ChatState {
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

  // Actions
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
  setFollowUpQuestions: (isFollowupQuestions:boolean) => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  session: {
    id: null,
    messages: [],
  },
  isFollowUpQuestions:false,
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
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  // Follow up questions
  setFollowUpQuestions: (isFollowUpQuestions:boolean) => set((state) => ({ ...state, isFollowUpQuestions })),
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

  // Reset all state
  reset: () => set(initialState),
}));
