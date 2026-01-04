import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  getCurrentUser: () => api.get('/auth/me'),
  register: (userData) => api.post('/auth/register', userData),
};

// Projects - UPDATED WITH NEW ENDPOINTS
export const projectsAPI = {
  getAll: (showArchived = false) => 
    api.get('/projects', { params: { show_archived: showArchived } }),
  getById: (id) => api.get(`/projects/${id}`),
  getActive: () => api.get('/projects/active'),
  getStats: (id) => api.get(`/projects/${id}/stats`),
  getDashboard: (id) => api.get(`/projects/${id}/dashboard`),
  getSupervisors: () => api.get('/projects/supervisors'), // ADD THIS
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}?confirm=true`),
  setActive: (id) => api.post(`/projects/${id}/activate`),
  assignSupervisor: (projectId, supervisorId) => 
    api.post(`/projects/${projectId}/assign-supervisor`, { supervisor_id: supervisorId }),
};

// Penetrations
export const penetrationsAPI = {
  getAll: (params) => api.get('/penetrations', { params }),
  getById: (id) => api.get(`/penetrations/${id}`),
  create: (penData) => api.post('/penetrations', penData),
  update: (id, penData) => api.put(`/penetrations/${id}`, penData),
  updateStatus: (id, status, notes) => 
    api.post(`/penetrations/${id}/status`, { status, notes }),
  getActivities: (id) => api.get(`/penetrations/${id}/activities`),
  bulkImport: (projectId, penetrations) => 
    api.post('/penetrations/bulk-import', { project_id: projectId, penetrations }),
};

// Contractors
export const contractorsAPI = {
  getAll: (params) => api.get('/contractors', { params }),
  getById: (id) => api.get(`/contractors/${id}`),
  getStats: (id) => api.get(`/contractors/${id}/stats`),
  create: (contractorData) => api.post('/contractors', contractorData),
  update: (id, contractorData) => api.put(`/contractors/${id}`, contractorData),
  generateLink: (id, projectId) => 
    api.post(`/contractors/${id}/generate-link`, { project_id: projectId }),
  merge: (sourceId, targetId) => 
    api.post('/contractors/merge', { 
      source_contractor_id: sourceId, 
      target_contractor_id: targetId 
    }),
};

// Photos
export const photosAPI = {
  upload: (formData) => 
    api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getById: (id) => api.get(`/photos/${id}`),
  getInfo: (id) => api.get(`/photos/${id}/info`),
  getByPenetration: (penId) => api.get(`/photos/penetration/${penId}`),
  delete: (id) => api.delete(`/photos/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getByContractor: () => api.get('/dashboard/by-contractor'),
  getByDeck: () => api.get('/dashboard/by-deck'),
  getOpenTooLong: (hours = 48) => api.get('/dashboard/open-too-long', { params: { hours } }),
  getCriticalStatus: () => api.get('/dashboard/critical-status'),
  getActivityTimeline: (days = 7) => api.get('/dashboard/activity-timeline', { params: { days } }),
};

// PDF Export
export const pdfAPI = {
  exportProject: (projectId) => 
    api.get(`/pdf/project/${projectId}`, { responseType: 'blob' }),
  exportProjectExcel: (projectId) =>
    api.get(`/pdf/project/${projectId}/excel`, { responseType: 'blob' }),
  exportCompletePackage: (projectId) =>
    api.get(`/pdf/project/${projectId}/complete`, { responseType: 'blob' }),
  exportContractor: (contractorId) =>
    api.get(`/pdf/contractor/${contractorId}`, { responseType: 'blob' }),
};

// Registration
export const registrationAPI = {
  getForm: (inviteCode) => api.get(`/registration/join/${inviteCode}`),
  submit: (inviteCode, data) => api.post(`/registration/join/${inviteCode}`, data),
  getPending: (projectId) => api.get('/registration/pending', { params: { project_id: projectId } }),
  approve: (id, data) => api.post(`/registration/${id}/approve`, data),
  reject: (id, reason) => api.post(`/registration/${id}/reject`, { reason }),
};

// Admin endpoints
export const adminAPI = {
  getAccessRequests: (status = 'pending') => 
    api.get(`/admin/access-requests?status=${status}`),
  
  approveAccessRequest: (requestId) => 
    api.post(`/admin/access-requests/${requestId}/approve`),
  
  rejectAccessRequest: (requestId, reason) => 
    api.post(`/admin/access-requests/${requestId}/reject`, { reason }),
}

// Report (Public - no auth)
export const reportAPI = {
  getForm: (token) => 
    axios.get(`${API_BASE_URL}/report/${token}`),
  createPen: (token, data) =>
    axios.post(`${API_BASE_URL}/report/${token}/create-pen`, data),
  submit: (token, data) => 
    axios.post(`${API_BASE_URL}/report/${token}/submit`, data),
  uploadPhoto: (token, formData) => 
    axios.post(`${API_BASE_URL}/report/${token}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;