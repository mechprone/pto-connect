import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.ptoconnect.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supabase.auth.token');
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken.access_token) {
          config.headers.Authorization = `Bearer ${parsedToken.access_token}`;
        }
      } catch (error) {
        console.warn('Failed to parse auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/profiles/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/profiles/me', profileData);
    return response.data;
  },

  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`/profiles?${queryParams.toString()}`);
    return response.data;
  }
};

// Event API
export const eventAPI = {
  getEvents: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`/event?${queryParams.toString()}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await apiClient.post('/event', eventData);
    return response.data;
  },

  updateEvent: async (eventId, eventData) => {
    const response = await apiClient.put(`/event/${eventId}`, eventData);
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await apiClient.delete(`/event/${eventId}`);
    return response.data;
  },

  getEventById: async (eventId) => {
    const response = await apiClient.get(`/event/${eventId}`);
    return response.data;
  },

  // RSVP functions
  submitRSVP: async (eventId, rsvpData) => {
    const response = await apiClient.post(`/event/${eventId}/rsvp`, rsvpData);
    return response.data;
  },

  getRSVPs: async (eventId) => {
    const response = await apiClient.get(`/event/${eventId}/rsvps`);
    return response.data;
  },

  // Volunteer functions
  getVolunteerOpportunities: async (eventId) => {
    const response = await apiClient.get(`/event/${eventId}/volunteers`);
    return response.data;
  },

  signUpVolunteer: async (eventId, volunteerData) => {
    const response = await apiClient.post(`/event/${eventId}/volunteers`, volunteerData);
    return response.data;
  }
};

// Fundraiser API
export const fundraiserAPI = {
  getFundraisers: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`/fundraiser?${queryParams.toString()}`);
    return response.data;
  },

  createFundraiser: async (fundraiserData) => {
    const response = await apiClient.post('/fundraiser', fundraiserData);
    return response.data;
  },

  updateFundraiser: async (fundraiserId, fundraiserData) => {
    const response = await apiClient.put(`/fundraiser/${fundraiserId}`, fundraiserData);
    return response.data;
  },

  deleteFundraiser: async (fundraiserId) => {
    const response = await apiClient.delete(`/fundraiser/${fundraiserId}`);
    return response.data;
  }
};

// Message API
export const messageAPI = {
  getMessages: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`/messages?${queryParams.toString()}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await apiClient.post('/messages', messageData);
    return response.data;
  },

  getMessage: async (messageId) => {
    const response = await apiClient.get(`/messages/${messageId}`);
    return response.data;
  },

  updateMessage: async (messageId, messageData) => {
    const response = await apiClient.put(`/messages/${messageId}`, messageData);
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  }
};

// Teacher Request API
export const teacherRequestAPI = {
  getRequests: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`/teacher-requests?${queryParams.toString()}`);
    return response.data;
  },

  createRequest: async (requestData) => {
    const response = await apiClient.post('/teacher-requests', requestData);
    return response.data;
  },

  updateRequest: async (requestId, requestData) => {
    const response = await apiClient.put(`/teacher-requests/${requestId}`, requestData);
    return response.data;
  },

  deleteRequest: async (requestId) => {
    const response = await apiClient.delete(`/teacher-requests/${requestId}`);
    return response.data;
  }
};

// Document API
export const documentAPI = {
  getDocuments: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`/documents?${queryParams.toString()}`);
    return response.data;
  },

  uploadDocument: async (formData) => {
    const response = await apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateDocument: async (documentId, documentData) => {
    const response = await apiClient.put(`/documents/${documentId}`, documentData);
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },

  downloadDocument: async (documentId) => {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Notification API
export const notificationAPI = {
  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

// AI API
export const aiAPI = {
  generateEventIdea: async (params) => {
    const response = await apiClient.post('/event-ideas/generate', params);
    return response.data;
  },

  chatWithAI: async (message, context = {}) => {
    const response = await apiClient.post('/ai/chat', { message, context });
    return response.data;
  },

  generateContent: async (type, params) => {
    const response = await apiClient.post('/ai/generate', { type, params });
    return response.data;
  }
};

// Import budget APIs
import { budgetAPI, expenseAPI, schoolOfficialsAPI, approvalWorkflowsAPI } from './budgetAPI';

// Export all API functions
export {
  apiClient,
  authAPI,
  userAPI,
  eventAPI,
  fundraiserAPI,
  messageAPI,
  teacherRequestAPI,
  documentAPI,
  notificationAPI,
  aiAPI,
  budgetAPI,
  expenseAPI,
  schoolOfficialsAPI,
  approvalWorkflowsAPI
};
