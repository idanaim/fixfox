import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export default {
  createIssue: (data) => axios.post(`${API_BASE}/issues`, data),
  recordSolutionOutcome: ({ solutionId, effective }) =>
    axios.patch(`${API_BASE}/solutions/${solutionId}`, { effective }),
  createTicket: (issueId, techId) =>
    axios.post(`${API_BASE}/issues/${issueId}/tickets`, { techId }),
  registerEquipment: (data) => axios.post(`${API_BASE}/equipment`, data)
};
