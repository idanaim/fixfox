import { api } from './api';
import { User } from '../interfaces/business';

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

export const chatApi = {
  createSession: async (
    businessId: number,
    userId: number
  ): Promise<ChatSession> => {
    try {

      const response = await api.post('/chat/sessions', { businessId, userId });
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
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, {
        content,
        type,
        metadata,
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
      const response = await api.post(
        `/chat/sessions/${sessionId}/equipment-search`,
        {
          businessId,
          description,
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
      const response = await api.post(`/chat/sessions/${sessionId}/issues`, {
        equipmentId,
        problem,
        solution
      });
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error);
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
    sessionId?: number
  ): Promise<{
    type: 'existing_solutions' | 'ai_diagnosis';
    problems?: Problem[];
    diagnosis?: Diagnosis;
  }> => {
    try {
      // If a sessionId is provided, use the chat flow endpoint
      if (sessionId) {
        const response = await api.post(`/chat/sessions/${sessionId}/diagnose`, {
          description,
          equipmentId,
          businessId,
        });
        return response.data;
      }
      // Otherwise fall back to the direct problem endpoint (which is now deprecated)
      else {
        const response = await api.post('/problems/diagnose', {
          description,
          equipmentId,
          businessId,
        });
        return response.data;
      }
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

  createBulkEquipment: async (
    equipments: Partial<Equipment>[],
    businessId: number
  ): Promise<Equipment[]> => {
    try {
      const response = await api.post('/equipment/bulk', {
        equipments,
        businessId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating bulk equipment:', error);
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

  rateSolutionEffectiveness: async (
    id: number,
    effective: boolean
  ): Promise<void> => {
    try {
      await api.post(`/solutions/${id}/effectiveness`, { effective });
    } catch (error) {
      console.error(`Error rating solution with id ${id}:`, error);
      throw error;
    }
  },

  generateSolutionsForProblem: async (
    problemId: number
  ): Promise<Solution[]> => {
    try {
      const response = await api.post(
        `/solutions/generate-for-problem/${problemId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error generating solutions for problem ${problemId}:`,
        error
      );
      throw error;
    }
  },

  enhancedDiagnosis: async (
    description: string,
    equipmentId: number,
    businessId: number,
    maxResults: number = 5,
    sessionId?: number
  ): Promise<EnhancedDiagnosisResult> => {
    try {
      // If a sessionId is provided, use the chat flow endpoint
      if (sessionId) {
        const response = await api.post(`/chat/sessions/${sessionId}/enhanced-diagnosis`, {
          description,
          equipmentId,
          businessId,
          maxResults
        });
        return response.data;
      }
      // Otherwise fall back to the direct problem endpoint (which is now deprecated)
      else {
        const response = await api.post('/problems/enhanced-diagnosis', {
          description,
          equipmentId,
          businessId,
          maxResults
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error performing enhanced diagnosis:', error);
      throw error;
    }
  },

  getContextBadge: (source: string): ContextBadge => {
    switch (source) {
      case 'current_business':
        return {
          type: 'current_business',
          label: 'Used before in this business'
        };
      case 'other_business':
        return {
          type: 'other_business',
          label: 'Other businesses use it'
        };
      case 'ai_generated':
        return {
          type: 'ai_generated',
          label: 'AI Solution'
        };
      default:
        return {
          type: 'ai_generated',
          label: 'AI Solution'
        };
    }
  },

  enhanceProblemDescription: async (
    sessionId: number,
    description: string,
    equipment?: Equipment
  ): Promise<{ originalDescription: string; enhancedDescription: string }> => {
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/enhance-description`, {
        description,
        equipment
      });
      return response.data;
    } catch (error) {
      console.error('Error enhancing problem description:', error);
      throw error;
    }
  },

  completeDiagnosisWorkflow: async (
    initialDescription: string,
    equipmentId: number,
    businessId: number,
    maxResults: number = 5
  ): Promise<{
    step: 'enhance_description' | 'issue_matches' | 'problem_matches' | 'ai_diagnosis';
    enhancedDescription?: string;
    originalDescription?: string;
    diagnosisResult?: EnhancedDiagnosisResult;
  }> => {
    try {
      // Create a temporary session ID for the enhancement
      // This is a workaround since we don't have a real session ID at this point
      const tempSessionId = equipmentId; // Using equipment ID as a fallback

      // Step 1: Enhance the description
      const enhancementResult = await chatApi.enhanceProblemDescription(
        tempSessionId,
        initialDescription
      );

      // Return the enhanced description for user approval
      // The client should display this to the user and ask for approval
      return {
        step: 'enhance_description',
        enhancedDescription: enhancementResult.enhancedDescription,
        originalDescription: enhancementResult.originalDescription
      };

      // Note: The client should call performDiagnosis() after user approves or provides a new description
    } catch (error) {
      console.error('Error in diagnosis workflow:', error);
      throw error;
    }
  },

  performDiagnosis: async (
    approvedDescription: string,
    equipmentId: number,
    businessId: number,
    maxResults: number = 5
  ): Promise<{
    step: 'issue_matches' | 'problem_matches' | 'ai_diagnosis';
    diagnosisResult: EnhancedDiagnosisResult;
  }> => {
    try {
      // Perform the enhanced diagnosis with the approved description
      const diagnosisResult = await chatApi.enhancedDiagnosis(
        approvedDescription,
        equipmentId,
        businessId,
        maxResults
      );

      return {
        step: diagnosisResult.type as 'issue_matches' | 'problem_matches' | 'ai_diagnosis',
        diagnosisResult
      };
    } catch (error) {
      console.error('Error performing diagnosis:', error);
      throw error;
    }
  },
};
