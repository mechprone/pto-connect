import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { getApiConfig, getLoggingConfig } from '@/config/environment.js';

const config = getApiConfig();
const loggingConfig = getLoggingConfig();

console.log('[DEBUG] Environment config:', {
  apiUrl: config.baseURL,
  environment: import.meta.env.MODE,
  isPreview: import.meta.env.VITE_IS_PREVIEW === 'true'
});

if (!config.baseURL) {
  throw new Error('API URL is not configured! Please check your environment variables.');
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: config.headers,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    if (loggingConfig.enableNetworkLogs) {
      console.log('🔍 [FRONTEND DEBUG] API Request interceptor started');
      console.log('🔍 [FRONTEND DEBUG] Request URL:', config.url);
      console.log('🔍 [FRONTEND DEBUG] Request method:', config.method);
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (loggingConfig.enableNetworkLogs) {
        console.log('🔍 [FRONTEND DEBUG] Session retrieved:', !!session);
        console.log('🔍 [FRONTEND DEBUG] Access token present:', !!session?.access_token);
      }
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        
        if (loggingConfig.enableNetworkLogs) {
          console.log('🔍 [FRONTEND DEBUG] Auth header set, token length:', session.access_token.length);
        }
      } else {
        if (loggingConfig.enableNetworkLogs) {
          console.warn('⚠️ [FRONTEND DEBUG] No access token found in session');
        }
      }
    } catch (error) {
      console.error('❌ [FRONTEND DEBUG] Error getting session:', error);
    }
    
    if (loggingConfig.enableNetworkLogs) {
      console.log('🔍 [FRONTEND DEBUG] Final request headers:', config.headers);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [FRONTEND DEBUG] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (loggingConfig.enableNetworkLogs) {
      console.log('✅ [FRONTEND DEBUG] API Response received:', {
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        dataKeys: Object.keys(response.data || {})
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ [FRONTEND DEBUG] API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message
    });
    
    if (error.response?.status === 401) {
      console.warn('🚫 [FRONTEND DEBUG] Unauthorized - redirecting to login');
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
    
    // Handle standardized backend response structure
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Backend uses response standardization middleware
      if (response.data.success) {
        return { data: response.data.data, error: null };
      } else {
        // Extract error from standardized error response
        const errorMessage = response.data.errors?.[0]?.message || 'An error occurred';
        return { data: null, error: errorMessage };
      }
    } else {
      // Legacy/direct response format
      return { data: response.data, error: null };
    }
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    
    // Handle standardized error responses
    let errorMessage = 'An error occurred';
    if (error.response?.data && typeof error.response.data === 'object' && 'success' in error.response.data) {
      errorMessage = error.response.data.errors?.[0]?.message || errorMessage;
    } else {
      errorMessage = error.response?.data?.message || error.message || errorMessage;
    }
    
    return { 
      data: null, 
      error: errorMessage
    };
  }
};

// Auth API calls
export const authAPI = {
  login: (credentials) => apiRequest('POST', '/api/auth/login', credentials),
  signup: (userData) => apiRequest('POST', '/api/signup', userData),
  logout: () => apiRequest('POST', '/api/auth/logout'),
  refreshToken: () => apiRequest('POST', '/api/auth/refresh'),
};

// Profile API calls
export const profileAPI = {
  getProfile: () => apiRequest('GET', '/api/profiles/me'),
  updateProfile: (data) => apiRequest('PUT', '/api/profiles/me', data),
  getUsers: () => apiRequest('GET', '/api/profiles'),
  createUser: (userData) => apiRequest('POST', '/api/admin-users', userData),
  updateUser: (userId, data) => apiRequest('PUT', `/api/admin-users/${userId}`, data),
  deleteUser: (userId) => apiRequest('DELETE', `/api/admin-users/${userId}`),
};

// Events API calls
export const eventsAPI = {
  getEvents: () => apiRequest('GET', '/api/event'),
  getEvent: (id) => apiRequest('GET', `/api/event/${id}`),
  createEvent: (eventData) => apiRequest('POST', '/api/event', eventData),
  updateEvent: (id, eventData) => apiRequest('PUT', `/api/event/${id}`, eventData),
  deleteEvent: (id) => apiRequest('DELETE', `/api/event/${id}`),
  rsvpEvent: (eventId, status) => apiRequest('POST', `/api/event/${eventId}/rsvp`, { status }),
  getEventRSVPs: (eventId) => apiRequest('GET', `/api/event/${eventId}/rsvps`),
  
  // Event Project Management API calls
  getEventSummary: (eventId) => apiRequest('GET', `/api/events/${eventId}/summary`),
  
  // Tasks
  getEventTasks: (eventId) => apiRequest('GET', `/api/events/${eventId}/tasks`),
  createTask: (eventId, taskData) => apiRequest('POST', `/api/events/${eventId}/tasks`, taskData),
  updateTask: (eventId, taskId, taskData) => apiRequest('PUT', `/api/events/${eventId}/tasks/${taskId}`, taskData),
  deleteTask: (eventId, taskId) => apiRequest('DELETE', `/api/events/${eventId}/tasks/${taskId}`),
  
  // Milestones
  getEventMilestones: (eventId) => apiRequest('GET', `/api/events/${eventId}/milestones`),
  createMilestone: (eventId, milestoneData) => apiRequest('POST', `/api/events/${eventId}/milestones`, milestoneData),
  updateMilestone: (eventId, milestoneId, milestoneData) => apiRequest('PUT', `/api/events/${eventId}/milestones/${milestoneId}`, milestoneData),
  deleteMilestone: (eventId, milestoneId) => apiRequest('DELETE', `/api/events/${eventId}/milestones/${milestoneId}`),
  
  // Issues
  getEventIssues: (eventId) => apiRequest('GET', `/api/events/${eventId}/issues`),
  createIssue: (eventId, issueData) => apiRequest('POST', `/api/events/${eventId}/issues`, issueData),
  updateIssue: (eventId, issueId, issueData) => apiRequest('PUT', `/api/events/${eventId}/issues/${issueId}`, issueData),
  deleteIssue: (eventId, issueId) => apiRequest('DELETE', `/api/events/${eventId}/issues/${issueId}`),
  
  // Sponsorships
  getEventSponsorships: (eventId) => apiRequest('GET', `/api/events/${eventId}/sponsorships`),
  createSponsorship: (eventId, sponsorshipData) => apiRequest('POST', `/api/events/${eventId}/sponsorships`, sponsorshipData),
  updateSponsorship: (eventId, sponsorshipId, sponsorshipData) => apiRequest('PUT', `/api/events/${eventId}/sponsorships/${sponsorshipId}`, sponsorshipData),
  deleteSponsorship: (eventId, sponsorshipId) => apiRequest('DELETE', `/api/events/${eventId}/sponsorships/${sponsorshipId}`),
  
  // Task Dependencies
  getTaskDependencies: (eventId, taskId) => apiRequest('GET', `/api/events/${eventId}/tasks/${taskId}/dependencies`),
  createTaskDependency: (eventId, taskId, dependencyData) => apiRequest('POST', `/api/events/${eventId}/tasks/${taskId}/dependencies`, dependencyData),
  deleteTaskDependency: (eventId, taskId, dependencyId) => apiRequest('DELETE', `/api/events/${eventId}/tasks/${taskId}/dependencies/${dependencyId}`),
  
  // Task Comments
  getTaskComments: (eventId, taskId) => apiRequest('GET', `/api/events/${eventId}/tasks/${taskId}/comments`),
  createTaskComment: (eventId, taskId, commentData) => apiRequest('POST', `/api/events/${eventId}/tasks/${taskId}/comments`, commentData),
  updateTaskComment: (eventId, taskId, commentId, commentData) => apiRequest('PUT', `/api/events/${eventId}/tasks/${taskId}/comments/${commentId}`, commentData),
  deleteTaskComment: (eventId, taskId, commentId) => apiRequest('DELETE', `/api/events/${eventId}/tasks/${taskId}/comments/${commentId}`),
};

// Fundraisers API calls
export const fundraisersAPI = {
  getFundraisers: () => apiRequest('GET', '/fundraiser'),
  getFundraiser: (id) => apiRequest('GET', `/fundraiser/${id}`),
  createFundraiser: (data) => apiRequest('POST', '/fundraiser', data),
  updateFundraiser: (id, data) => apiRequest('PUT', `/fundraiser/${id}`, data),
  deleteFundraiser: (id) => apiRequest('DELETE', `/fundraiser/${id}`),
  getDonations: (fundraiserId) => apiRequest('GET', `/fundraiser/${fundraiserId}/donations`),
  getFundraiserAnalytics: (id, params) => apiRequest('GET', `/fundraiser/${id}/analytics${params ? `?${new URLSearchParams(params)}` : ''}`),
  getAllFundraisersAnalytics: (params) => apiRequest('GET', `/fundraiser/analytics${params ? `?${new URLSearchParams(params)}` : ''}`),
  // Fundraiser Analytics API calls (using the dedicated analytics router)
  getAnalyticsOverview: (params) => apiRequest('GET', `/fundraiser/analytics/overview${params ? `?${new URLSearchParams(params)}` : ''}`),
  getAnalyticsTrends: (params) => apiRequest('GET', `/fundraiser/analytics/trends${params ? `?${new URLSearchParams(params)}` : ''}`),
  getAnalyticsDonorRetention: (params) => apiRequest('GET', `/fundraiser/analytics/donor-retention${params ? `?${new URLSearchParams(params)}` : ''}`),
  getAnalyticsCampaigns: (params) => apiRequest('GET', `/fundraiser/analytics/campaigns${params ? `?${new URLSearchParams(params)}` : ''}`),
  addDonation: (fundraiserId, data) => apiRequest('POST', '/fundraiser/analytics/donations', { ...data, fundraiser_id: fundraiserId }),
  getFundraiserTopDonor: (id) => apiRequest('GET', `/fundraiser/${id}/top-donor`),
  getDonationTiers: (id) => apiRequest('GET', `/fundraiser/${id}/tiers`),
  createDonationTier: (id, data) => apiRequest('POST', `/fundraiser/${id}/tiers`, data),
  updateDonationTier: (id, tierId, data) => apiRequest('PUT', `/fundraiser/${id}/tiers/${tierId}`, data),
  deleteDonationTier: (id, tierId) => apiRequest('DELETE', `/fundraiser/${id}/tiers/${tierId}`),
  getAnalyticsYears: () => apiRequest('GET', '/fundraiser/analytics/years'),
  getDonorYears: () => apiRequest('GET', '/fundraiser/donors/years'),
  getDonorData: (id, year, fundraiserId, type) => apiRequest('GET', `/fundraiser/donors${year || fundraiserId || type ? `?${new URLSearchParams({ year, fundraiserId, type })}` : ''}`),
  getDonorTypes: () => apiRequest('GET', '/fundraiser/donor-types'),
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

// Enhanced AI API calls
export const aiAPI = {
  generateEventIdeas: (prompt) => apiRequest('POST', '/event-ideas', { prompt }),
  generateContent: (type, prompt, context, includeRecommendations = false) => 
    apiRequest('POST', '/ai/generate', { type, prompt, context, includeRecommendations }),
  analyzeContext: (orgId, analysisType = 'general') => 
    apiRequest('POST', '/ai/analyze-context', { orgId, analysisType }),
  analyzeEventWorkflow: (eventData, orgId) => 
    apiRequest('POST', '/ai/analyze-event-workflow', { eventData, orgId }),
  analyzeDocument: (documentId) => apiRequest('POST', `/ai/analyze-document/${documentId}`),
  chatWithDocuments: (query) => apiRequest('POST', '/ai/chat', { query }),
  
  // Stella Comprehensive Workflow API calls
  generateComprehensiveWorkflow: async (eventData, stellaContext, moduleIntegrations) => {
    try {
      console.log('🌟 [API] Generating comprehensive workflow...');
      console.log('📊 [API] Event data:', eventData);
      console.log('🎯 [API] Stella context:', stellaContext);
      console.log('🔧 [API] Module integrations:', moduleIntegrations);
      
      const response = await apiRequest('POST', '/stella/generate-comprehensive-workflow', {
        eventData,
        stellaContext,
        moduleIntegrations
      });
      
      console.log('✅ [API] Workflow generation response:', response);
      return response;
    } catch (error) {
      console.error('❌ [API] Workflow generation failed:', error);
      throw error;
    }
  },
  getWorkflowDetails: (workflowId) => 
    apiRequest('GET', `/stella/workflow/${workflowId}`),
  listWorkflows: () => 
    apiRequest('GET', '/stella/workflows'),
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
  getNotifications: () => apiRequest('GET', '/api/notifications'),
  markAsRead: (id) => apiRequest('PUT', `/notifications/${id}/read`),
  markAllAsRead: () => apiRequest('PUT', '/notifications/read-all'),
  deleteNotification: (id) => apiRequest('DELETE', `/notifications/${id}`),
};

// Export both named and default
export { api };
export default api;
