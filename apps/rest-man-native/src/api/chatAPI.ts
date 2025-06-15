import { api } from './api';
import { User } from '../interfaces/business';
import i18n from 'i18next';
import { config } from '../config/environment';

const API_BASE = config.API_BASE_URL;

export interface ChatSession {
  id: number;
  status: string;
  metadata: any;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  type: 'user' | 'system' | 'assistant';
  createdAt: string;
  metadata?: {
    userId?: number;
    [key: string]: any;
  };
}

export interface Equipment {
  id: number;
  businessId: number;
  type: string;
  manufacturer: string;
  model: string;
  location?: string;
  purchaseDate?: Date;
  supplier?: string;
  warrantyExpiration?: Date;
  photoUrl?: string;
  createdAt?: Date;
  serialNumber?: string;
  category?: string;
  expectedLifespan?: number;
  lastMaintenanceDate?: Date;
  maintenanceIntervalDays?: number;
  status?: string;
  maintenanceHistory?: any;
  aiMetadata?: any;
  specifications?: any;
  purchasePrice?: number;
  tags?: string[];
}

export interface Problem {
  id?: number;
  description: string;
  createdAt?: string;
  userId?: number;
  equipment?: Equipment;
  solutions?: Solution[];
}

export interface Solution {
  id: number;
  cause: string;
  treatment: string;
  cost?: number;
  resolvedBy: string;
  effectiveness: number;
  createdAt: string;
}

export interface Diagnosis {
  possibleCauses: string[];
  suggestedSolutions: string[];
  estimatedCost: string;
  partsNeeded: string[];
  diagnosisConfidence: number;
}

export interface ContextBadge {
  type: 'current_business' | 'other_business' | 'ai_generated';
  label: string;
}

export interface EnhancedDiagnosisResult {
  type: 'issue_matches' | 'problem_matches' | 'ai_diagnosis';
  source: 'current_business' | 'other_business' | 'ai_generated';
  message: string;
  issues?: any[];
  problems?: Problem[];
  diagnosis?: Diagnosis;
}

export interface DescriptionEnhancementResult {
  originalDescription: string;
  enhancedDescription: string;
  potentialEquipmentTypes?: string[];
}

export interface FollowUpQuestion {
  question: string;
  type: 'timing' | 'symptom' | 'context' | 'severity';
  options?: string[];
  context?: string;
}

export interface AnalysisResult {
  problems: Problem[];
  followUpQuestions: FollowUpQuestion[];
  confidence: string;
  summary?: string;
  isDiagnosisReady?: boolean;
}

// Helper function to get current language
const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

export const chatApi = {
  createSession: async (
    businessId: number,
    userId: number
  ): Promise<ChatSession> => {
    try {
      const language = getCurrentLanguage();
      const response = await api.post('/chat/sessions', {
        businessId,
        userId,
        language
      });
      return response.data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  addMessage: async (
    sessionId: number,
    content: string,
    type: 'user' | 'system' | 'ai',
    metadata?: any
  ): Promise<ChatMessage> => {
    try {
      const language = getCurrentLanguage();
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, {
        content,
        type,
        language,
        metadata: {
          ...metadata,
          language
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  getSessionMessages: async (sessionId: number): Promise<ChatMessage[]> => {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error getting session messages:', error);
      throw error;
    }
  },

  updateSessionStatus: async (
    sessionId: number,
    status: string,
    metadata?: any
  ): Promise<ChatSession> => {
    try {
      const response = await api.put(`/chat/sessions/${sessionId}/status`, {
        status,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },

  searchEquipment: async (
    sessionId: number,
    businessId: number,
    description: string
  ): Promise<Equipment[]> => {
    try {
      const language = getCurrentLanguage();
      const response = await api.post(
        `/chat/sessions/${sessionId}/equipment-search`,
        {
          businessId,
          description,
          language
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching equipment:', error);
      throw error;
    }
  },

  createIssue: async (
    sessionId: number,
    equipmentId: number,
    problem: Partial<Problem>,
    solution?: Partial<Solution>,
  ): Promise<any> => {
    try {
      const language = getCurrentLanguage();
      const response = await api.post(`/chat/sessions/${sessionId}/issues`, {
        equipmentId,
        problem,
        solution,
        language
      });
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },

  createIssueWithTechnicianAssignment: async (
    businessId: number,
    userId: number,
    problemDescription: string,
    equipment?: Equipment,
  ): Promise<any> => {
    try {
      const language = getCurrentLanguage();
      const response = await api.post('/issues/assign-technician', {
        businessId,
        userId,
        problemDescription,
        equipment,
        language
      });
      return response.data;
    } catch (error) {
      console.error('Error creating issue with technician assignment:', error);
      throw error;
    }
  },

  createProblem: async (
    description: string,
    businessId: number,
    equipmentId?: number,
    user?: Partial<User>,
  ): Promise<Problem> => {
    try {
      const response = await api.post('/problems', {
      problem:{description,
        businessId,
        equipmentId},
        user,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating problem:', error);
      throw error;
    }
  },

  findSimilarProblems: async (
    description: string,
    equipmentId: number,
    businessId: number
  ): Promise<Problem[]> => {
    try {
      const response = await api.get('/problems/similar', {
        params: {
          description,
          equipmentId,
          businessId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error finding similar problems:', error);
      throw error;
    }
  },

  linkProblemToEquipment: async (
    problemId: number,
    equipmentId: number
  ): Promise<Problem> => {
    try {
      const response = await api.put(
        `/problems/${problemId}/equipment/${equipmentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error linking problem to equipment:', error);
      throw error;
    }
  },

  getProblemWithSolutions: async (problemId: number): Promise<Problem> => {
    try {
      const response = await api.get(`/problems/${problemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting problem with id ${problemId}:`, error);
      throw error;
    }
  },

  getProblemsByEquipment: async (
    equipmentId: number,
    businessId: number
  ): Promise<Problem[]> => {
    try {
      const response = await api.get('/problems', {
        params: {
          equipmentId,
          businessId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting problems by equipment:', error);
      throw error;
    }
  },

  diagnoseProblem: async (
    description: string,
    equipmentId: number,
    businessId: number,
    sessionId: number,
    skipSimilar?: boolean
  ): Promise<any> => {
    try {
      const language = getCurrentLanguage();
      const response = await api.post(`/chat/sessions/${sessionId}/diagnose`, {
        description,
        equipmentId,
        businessId,
        language,
        skipSimilar
      });
      return response.data;
    } catch (error) {
      console.error('Error diagnosing problem:', error);
      throw error;
    }
  },

  getAllEquipment: async (businessId: number): Promise<Equipment[]> => {
    try {
      const response = await api.get(`/equipment?businessId=${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting all equipment:', error);
      throw error;
    }
  },

  getEquipmentById: async (
    id: number,
    businessId: number
  ): Promise<Equipment> => {
    try {
      const response = await api.get(
        `/equipment/${id}?businessId=${businessId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting equipment with id ${id}:`, error);
      throw error;
    }
  },

  createEquipment: async (
    equipment: Partial<Equipment>
  ): Promise<Equipment> => {
    try {
      const response = await api.post('/equipment', equipment);
      return response.data;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  },

  updateEquipment: async (
    id: number,
    businessId: number,
    equipment: Partial<Equipment>
  ): Promise<Equipment> => {
    try {
      const response = await api.put(
        `/equipment/${id}?businessId=${businessId}`,
        equipment
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating equipment with id ${id}:`, error);
      throw error;
    }
  },

  deleteEquipment: async (id: number, businessId: number): Promise<void> => {
    try {
      await api.delete(`/equipment/${id}?businessId=${businessId}`);
    } catch (error) {
      console.error(`Error deleting equipment with id ${id}:`, error);
      throw error;
    }
  },

  searchEquipmentQuery: async (
    query: string,
    businessId: number
  ): Promise<Equipment[]> => {
    try {
      const response = await api.get(
        `/equipment/search/query?q=${query}&businessId=${businessId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching equipment:', error);
      throw error;
    }
  },

  searchEquipmentVector: async (
    query: string,
    businessId: number
  ): Promise<Equipment[]> => {
    try {
      const response = await api.get(
        `/equipment/search/vector?q=${query}&businessId=${businessId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching equipment with vector:', error);
      throw error;
    }
  },

  getEquipmentByCategory: async (
    category: string,
    businessId: number
  ): Promise<Equipment[]> => {
    try {
      const response = await api.get(
        `/equipment/category/${category}?businessId=${businessId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting equipment by category ${category}:`, error);
      throw error;
    }
  },

  getEquipmentByStatus: async (
    status: string,
    businessId: number
  ): Promise<Equipment[]> => {
    try {
      const response = await api.get(
        `/equipment/status/${status}?businessId=${businessId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting equipment by status ${status}:`, error);
      throw error;
    }
  },

  getEquipmentDueForMaintenance: async (
    businessId: number
  ): Promise<Equipment[]> => {
    try {
      const response = await api.get(
        `/equipment/maintenance/due?businessId=${businessId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting equipment due for maintenance:', error);
      throw error;
    }
  },
  // Solution API Calls
  createSolution: async (
    user: Partial<User>,
    solution: Partial<Solution>
  ): Promise<Solution> => {
    try {
      const response = await api.post('/solutions', { user, solution });
      return response.data;
    } catch (error) {
      console.error('Error creating solution:', error);
      throw error;
    }
  },

  getSolutions: async (problemId?: number): Promise<Solution[]> => {
    try {
      const url = problemId
        ? `/solutions?problemId=${problemId}`
        : '/solutions';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error getting solutions:', error);
      throw error;
    }
  },

  getSolutionById: async (id: number): Promise<Solution> => {
    try {
      const response = await api.get(`/solutions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting solution with id ${id}:`, error);
      throw error;
    }
  },

  updateSolution: async (
    id: number,
    solution: Partial<Solution>
  ): Promise<Solution> => {
    try {
      const response = await api.put(`/solutions/${id}`, solution);
      return response.data;
    } catch (error) {
      console.error(`Error updating solution with id ${id}:`, error);
      throw error;
    }
  },

  deleteSolution: async (id: number): Promise<void> => {
    try {
      await api.delete(`/solutions/${id}`);
    } catch (error) {
      console.error(`Error deleting solution with id ${id}:`, error);
      throw error;
    }
  },

  enhanceProblemDescription: async (
    sessionId: number,
    description: string,
    equipment?: Equipment,
    followUpQuestions: FollowUpQuestion[] = []
  ): Promise<{ originalDescription: string; enhancedDescription: string }> => {
    try {
      const language = getCurrentLanguage();
      const response = await api.post(`/chat/sessions/${sessionId}/enhance-description`, {
        description,
        equipment,
        followUpQuestions,
        language
      });
      return response.data;
    } catch (error) {
      console.error('Error enhancing problem description:', error);
      throw error;
    }
  },

  followUpQuestions: async (sessionId: number, equipment: Equipment): Promise<AnalysisResult> => {
    try {
      const language = getCurrentLanguage();
      const response = await api.post(`/chat/sessions/${sessionId}/followup-questions`, {
        language,
        equipment
      });

      return response.data;
    } catch (error) {
      console.error('Error analyzing issue:', error);
      throw error;
    }
  },

  recordSolutionEffectiveness: async (
    solutionId: number,
    effective: boolean,
    businessId: number,
    userId: number,
    problemDescription: string,
    equipment?: Equipment
  ): Promise<any> => {
    try {
      // First record the solution effectiveness
      await api.post(`/solutions/${solutionId}/effectiveness`, {
        effective
      });

      // If the solution was effective, create a resolved issue with the solution
      if (effective) {
        const response = await api.post('/issues/resolved', {
          businessId,
          userId,
          problemDescription,
          solutionId,
          equipment
        });
        return response.data;
      }

      return { success: true };
    } catch (error) {
      console.error('Error recording solution effectiveness:', error);
      throw error;
    }
  },
};
