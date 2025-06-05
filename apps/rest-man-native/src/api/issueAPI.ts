import { api } from './api';

export interface Issue {
  id: number;
  status: string;
  cost?: number;
  createdAt: string;
  openedBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  solvedBy?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  problem: {
    id: number;
    description: string;
    createdAt: string;
  };
  equipment?: {
    id: number;
    type: string;
    manufacturer?: string;
    model?: string;
    location?: string;
  };
  solution?: {
    id: number;
    treatment: string;
    resolvedBy: string;
    createdAt: string;
  };
  business: {
    id: number;
    name: string;
  };
  chatSessions?: any[];
}

export interface IssueFilters {
  page?: number;
  limit?: number;
  status?: string;
  equipmentId?: number;
  userId?: number;
  businessId?: number;
}

export interface IssueResponse {
  issues: Issue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IssueStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  closed: number;
  activeIssues: number;
}

export const issueAPI = {
  /**
   * Get all issues for a specific business
   */
  getIssuesByBusiness: async (
    businessId: number,
    filters: IssueFilters = {}
  ): Promise<IssueResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.equipmentId) params.append('equipmentId', filters.equipmentId.toString());
      if (filters.userId) params.append('userId', filters.userId.toString());

      const response = await api.get(`/issues/business/${businessId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching issues by business:', error);
      throw error;
    }
  },

  /**
   * Get all issues for a specific user
   */
  getIssuesByUser: async (
    userId: number,
    filters: IssueFilters = {}
  ): Promise<IssueResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.businessId) params.append('businessId', filters.businessId.toString());

      const response = await api.get(`/issues/user/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching issues by user:', error);
      throw error;
    }
  },

  /**
   * Get a single issue by ID
   */
  getIssueById: async (issueId: number, businessId?: number): Promise<Issue> => {
    try {
      const params = businessId ? `?businessId=${businessId}` : '';
      const response = await api.get(`/issues/${issueId}${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching issue by ID:', error);
      throw error;
    }
  },

  /**
   * Get issue statistics for a business
   */
  getIssueStats: async (businessId: number): Promise<IssueStats> => {
    try {
      const response = await api.get(`/issues/business/${businessId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching issue stats:', error);
      throw error;
    }
  },

  /**
   * Update issue status
   */
  updateIssueStatus: async (
    issueId: number,
    status: string,
    businessId?: number,
    userId?: number
  ): Promise<Issue> => {
    try {
      const response = await api.put(`/issues/${issueId}/status`, {
        status,
        businessId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  },

  /**
   * Assign technician to issue
   */
  assignTechnician: async (
    issueId: number,
    technicianId: number,
    businessId?: number
  ): Promise<Issue> => {
    try {
      const response = await api.put(`/issues/${issueId}/assign`, {
        technicianId,
        businessId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning technician:', error);
      throw error;
    }
  },

  /**
   * Create a new issue
   */
  createIssue: async (issueData: {
    businessId: number;
    userId: number;
    problemDescription: string;
    equipmentDescription: string;
  }): Promise<any> => {
    try {
      const response = await api.post('/issues', issueData);
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },

  /**
   * Create issue with technician assignment
   */
  createIssueWithTechnicianAssignment: async (issueData: {
    businessId: number;
    userId: number;
    problemDescription: string;
    equipment?: any;
    language?: string;
  }): Promise<any> => {
    try {
      const response = await api.post('/issues/assign-technician', issueData);
      return response.data;
    } catch (error) {
      console.error('Error creating issue with technician assignment:', error);
      throw error;
    }
  },

  /**
   * Create resolved issue
   */
  createResolvedIssue: async (issueData: {
    businessId: number;
    userId: number;
    problemDescription: string;
    solutionId: number;
    equipment?: any;
    language?: string;
  }): Promise<any> => {
    try {
      const response = await api.post('/issues/resolved', issueData);
      return response.data;
    } catch (error) {
      console.error('Error creating resolved issue:', error);
      throw error;
    }
  },

  /**
   * Update issue cost
   */
  updateIssueCost: async (
    issueId: number,
    cost: number,
    businessId?: number
  ): Promise<Issue> => {
    try {
      const response = await api.put(`/issues/${issueId}/cost`, {
        cost,
        businessId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating issue cost:', error);
      throw error;
    }
  },

  /**
   * Update issue treatment description
   */
  updateIssueTreatment: async (
    issueId: number,
    treatment: string,
    businessId?: number,
    userId?: number
  ): Promise<Issue> => {
    try {
      const response = await api.put(`/issues/${issueId}/treatment`, {
        treatment,
        businessId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating issue treatment:', error);
      throw error;
    }
  },

  /**
   * Close issue with cost and treatment
   */
  closeIssue: async (
    issueId: number,
    cost?: number,
    treatment?: string,
    businessId?: number,
    userId?: number
  ): Promise<Issue> => {
    try {
      const response = await api.put(`/issues/${issueId}/close`, {
        cost,
        treatment,
        businessId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error closing issue:', error);
      throw error;
    }
  },

  /**
   * Comprehensive update for issue - handles status, cost, treatment, and closing
   */
  updateIssueComprehensive: async (
    issueId: number,
    data: {
      status?: string;
      cost?: number;
      treatment?: string;
      shouldClose?: boolean;
      businessId?: number;
      userId?: number;
    }
  ): Promise<Issue> => {
    try {
      const response = await api.put(`/issues/${issueId}/update`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating issue comprehensively:', error);
      throw error;
    }
  }
};
