import { create } from 'zustand';
import { ChatMessage, ChatSession, Diagnosis, Equipment, Problem } from '../api/chatAPI';

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
  
  // Reset state
  reset: () => void;
}

const initialState = {
  session: {
    id: null,
    messages: [],
  },
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

  // Session actions
  setSessionId: (id) => set((state) => ({ session: { ...state.session, id } })),
  addMessage: (message) => set((state) => ({ 
    session: { 
      ...state.session, 
      messages: [...state.session.messages, message] 
    } 
  })),
  setMessages: (messages) => set((state) => ({ 
    session: { ...state.session, messages } 
  })),

  // UI actions
  setInput: (input) => set((state) => ({ 
    ui: { ...state.ui, input } 
  })),
  setLoading: (loading) => set((state) => ({ 
    ui: { ...state.ui, loading } 
  })),

  // Equipment actions
  setApplianceOptions: (options) => set((state) => ({ 
    equipment: { ...state.equipment, options } 
  })),
  setShowEquipmentForm: (show) => set((state) => ({ 
    equipment: { ...state.equipment, showForm: show } 
  })),
  setSelectedEquipment: (equipment) => set((state) => ({ 
    equipment: { ...state.equipment, selected: equipment } 
  })),

  // Diagnosis actions
  setDiagnosisResult: (result) => set((state) => ({ 
    diagnosis: { ...state.diagnosis, result } 
  })),
  setInitialIssueDescription: (description) => set((state) => ({ 
    diagnosis: { 
      ...state.diagnosis, 
      description: { ...state.diagnosis.description, initial: description } 
    } 
  })),
  setShowEnhancedDescriptionApproval: (show) => set((state) => ({ 
    diagnosis: { 
      ...state.diagnosis, 
      description: { ...state.diagnosis.description, showApproval: show } 
    } 
  })),
  setEnhancedDescription: (description) => set((state) => ({ 
    diagnosis: { 
      ...state.diagnosis, 
      description: { ...state.diagnosis.description, enhanced: description } 
    } 
  })),
  setOriginalDescription: (description) => set((state) => ({ 
    diagnosis: { 
      ...state.diagnosis, 
      description: { ...state.diagnosis.description, original: description } 
    } 
  })),
  setAwaitingDescriptionApproval: (awaiting) => set((state) => ({ 
    diagnosis: { 
      ...state.diagnosis, 
      description: { ...state.diagnosis.description, awaitingApproval: awaiting } 
    } 
  })),
  setPotentialEquipmentTypes: (types) => set((state) => ({ 
    diagnosis: { ...state.diagnosis, potentialEquipmentTypes: types } 
  })),

  // Reset all state
  reset: () => set(initialState),
})); 