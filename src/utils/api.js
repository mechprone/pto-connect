import axios from 'axios';
import { supabase } from './supabaseClient';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pto-connect-backend.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API functions
export const apiRequest = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await api({
      method,
      url: endpoint,
      data,
      ...config,
    });
    return { data: response.data, error: null };
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    return { 
      data: null, 
      error: error.response?.data?.message || error.message || 'An error occurred' 
    };
  }
};

// Auth API calls
export const authAPI = {
  login: (credentials) => apiRequest('POST', '/auth/login', credentials),
  signup: (userData) => apiRequest('POST', '/signup', userData),
  logout: () => apiRequest('POST', '/auth/logout'),
  refreshToken: () => apiRequest('POST', '/auth/refresh'),
};

// Profile API calls
export const profileAPI = {
  getProfile: () => apiRequest('GET', '/profiles/me'),
  updateProfile: (data) => apiRequest('PUT', '/profiles/me', data),
  getUsers: () => apiRequest('GET', '/admin-users'),
  createUser: (userData) => apiRequest('POST', '/admin-users', userData),
  updateUser: (userId, data) => apiRequest('PUT', `/admin-users/${userId}`, data),
  deleteUser: (userId) => apiRequest('DELETE', `/admin-users/${userId}`),
};

// Events API calls
export const eventsAPI = {
  getEvents: () => apiRequest('GET', '/event'),
  getEvent: (id) => apiRequest('GET', `/event/${id}`),
  createEvent: (eventData) => apiRequest('POST', '/event', eventData),
  updateEvent: (id, eventData) => apiRequest('PUT', `/event/${id}`, eventData),
  deleteEvent: (id) => apiRequest('DELETE', `/event/${id}`),
  rsvpEvent: (eventId, status) => apiRequest('POST', `/event/${eventId}/rsvp`, { status }),
  getEventRSVPs: (eventId) => apiRequest('GET', `/event/${eventId}/rsvps`),
};

// Fundraisers API calls
export const fundraisersAPI = {
  getFundraisers: () => apiRequest('GET', '/fundraiser'),
  getFundraiser: (id) => apiRequest('GET', `/fundraiser/${id}`),
  createFundraiser: (data) => apiRequest('POST', '/fundraiser', data),
  updateFundraiser: (id, data) => apiRequest('PUT', `/fundraiser/${id}`, data),
  deleteFundraiser: (id) => apiRequest('DELETE', `/fundraiser/${id}`),
  getDonations: (fundraiserId) => apiRequest('GET', `/fundraiser/${fundraiserId}/donations`),
};

// Budget API calls
export const budgetAPI = {
  getTransactions: () => apiRequest('GET', '/budget'),
  getTransaction: (id) => apiRequest('GET', `/budget/${id}`),
  createTransaction: (data) => apiRequest('POST', '/budget', data),
  updateTransaction: (id, data) => apiRequest('PUT', `/budget/${id}`, data),
  deleteTransaction: (id) => apiRequest('DELETE', `/budget/${id}`),
  uploadReceipt: (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return apiRequest('POST', '/budget/upload-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Reconciliation API calls
export const reconciliationAPI = {
  // Get all reconciliation records
  getReconciliations: () => apiRequest('GET', '/reconciliation'),
  
  // Get specific reconciliation by ID
  getReconciliation: (id) => apiRequest('GET', `/reconciliation/${id}`),
  
  // Create new reconciliation
  createReconciliation: (data) => apiRequest('POST', '/reconciliation', data),
  
  // Update reconciliation
  updateReconciliation: (id, data) => apiRequest('PUT', `/reconciliation/${id}`, data),
  
  // Delete reconciliation
  deleteReconciliation: (id) => apiRequest('DELETE', `/reconciliation/${id}`),
  
  // Upload bank statement for reconciliation
  uploadStatement: (file, reconciliationId) => {
    const formData = new FormData();
    formData.append('statement', file);
    formData.append('reconciliationId', reconciliationId);
    return apiRequest('POST', '/reconciliation/upload-statement', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Get transactions for matching
  getTransactionsForMatching: (reconciliationId, startDate, endDate) => 
    apiRequest('GET', `/reconciliation/${reconciliationId}/transactions`, {
      params: { startDate, endDate }
    }),
  
  // Match transactions
  matchTransactions: (reconciliationId, matches) => 
    apiRequest('POST', `/reconciliation/${reconciliationId}/match`, { matches }),
  
  // Get reconciliation report
  getReconciliationReport: (reconciliationId) => 
    apiRequest('GET', `/reconciliation/${reconciliationId}/report`),
  
  // Save reconciliation progress
  saveProgress: (reconciliationId, progressData) => 
    apiRequest('PUT', `/reconciliation/${reconciliationId}/progress`, progressData),
  
  // Finalize reconciliation
  finalizeReconciliation: (reconciliationId, finalData) => 
    apiRequest('POST', `/reconciliation/${reconciliationId}/finalize`, finalData),
  
  // Get reconciliation history/dashboard data
  getDashboardData: (startDate, endDate) => 
    apiRequest('GET', '/reconciliation/dashboard', {
      params: { startDate, endDate }
    }),
};

// Communications API calls
export const communicationsAPI = {
  getMessages: () => apiRequest('GET', '/messages'),
  getMessage: (id) => apiRequest('GET', `/messages/${id}`),
  createMessage: (data) => apiRequest('POST', '/messages', data),
  updateMessage: (id, data) => apiRequest('PUT', `/messages/${id}`, data),
  deleteMessage: (id) => apiRequest('DELETE', `/messages/${id}`),
  sendMessage: (id) => apiRequest('POST', `/messages/${id}/send`),
  
  // Email drafts
  getEmailDrafts: () => apiRequest('GET', '/communications/email-drafts'),
  createEmailDraft: (data) => apiRequest('POST', '/communications/email-drafts', data),
  updateEmailDraft: (id, data) => apiRequest('PUT', `/communications/email-drafts/${id}`, data),
  deleteEmailDraft: (id) => apiRequest('DELETE', `/communications/email-drafts/${id}`),
};

// Teacher Requests API calls
export const teacherRequestsAPI = {
  getRequests: () => apiRequest('GET', '/teacher-requests'),
  getRequest: (id) => apiRequest('GET', `/teacher-requests/${id}`),
  createRequest: (data) => apiRequest('POST', '/teacher-requests', data),
  updateRequest: (id, data) => apiRequest('PUT', `/teacher-requests/${id}`, data),
  deleteRequest: (id) => apiRequest('DELETE', `/teacher-requests/${id}`),
  approveRequest: (id, response) => apiRequest('POST', `/teacher-requests/${id}/approve`, { response }),
  denyRequest: (id, response) => apiRequest('POST', `/teacher-requests/${id}/deny`, { response }),
};

// Documents API calls
export const documentsAPI = {
  getDocuments: () => apiRequest('GET', '/documents'),
  getDocument: (id) => apiRequest('GET', `/documents/${id}`),
  uploadDocument: (file, metadata) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('metadata', JSON.stringify(metadata));
    return apiRequest('POST', '/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateDocument: (id, data) => apiRequest('PUT', `/documents/${id}`, data),
  deleteDocument: (id) => apiRequest('DELETE', `/documents/${id}`),
};

// Shared Library API calls
export const sharedLibraryAPI = {
  getTemplates: () => apiRequest('GET', '/shared-library'),
  getTemplate: (id) => apiRequest('GET', `/shared-library/${id}`),
  createTemplate: (data) => apiRequest('POST', '/shared-library', data),
  updateTemplate: (id, data) => apiRequest('PUT', `/shared-library/${id}`, data),
  deleteTemplate: (id) => apiRequest('DELETE', `/shared-library/${id}`),
  useTemplate: (id) => apiRequest('POST', `/shared-library/${id}/use`),
};

// AI API calls
export const aiAPI = {
  generateEventIdeas: (prompt) => apiRequest('POST', '/event-ideas', { prompt }),
  generateContent: (type, prompt, context) => apiRequest('POST', '/ai/generate', { type, prompt, context }),
  analyzeDocument: (documentId) => apiRequest('POST', `/ai/analyze-document/${documentId}`),
  chatWithDocuments: (query) => apiRequest('POST', '/ai/chat', { query }),
};

// Stripe API calls
export const stripeAPI = {
  getPrices: () => apiRequest('GET', '/stripe/prices'),
  createCheckoutSession: (priceId, metadata) => apiRequest('POST', '/stripe/create-checkout-session', { priceId, metadata }),
  createPortalSession: () => apiRequest('POST', '/stripe/create-portal-session'),
  getSubscription: () => apiRequest('GET', '/stripe/subscription'),
};

// Notifications API calls
export const notificationsAPI = {
  getNotifications: () => apiRequest('GET', '/notifications'),
  markAsRead: (id) => apiRequest('PUT', `/notifications/${id}/read`),
  markAllAsRead: () => apiRequest('PUT', '/notifications/read-all'),
  deleteNotification: (id) => apiRequest('DELETE', `/notifications/${id}`),
};

// Export both named and default
export { api };
export default api;