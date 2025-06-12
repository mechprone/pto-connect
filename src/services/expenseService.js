import axios from 'axios';
import { authService } from './authService';
import { offlineService } from './offlineService';

class ExpenseService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://api.ptoconnect.com';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await authService.logout();
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );
  }

  async submitExpense(expenseData) {
    try {
      // Check if online
      if (!navigator.onLine) {
        // Store offline and return success
        await offlineService.storeExpense(expenseData);
        return {
          success: true,
          offline: true,
          message: 'Expense saved offline. Will sync when connected.'
        };
      }

      // Prepare form data for file upload
      const formData = new FormData();
      
      // Add expense data
      Object.keys(expenseData).forEach(key => {
        if (key !== 'receipts') {
          formData.append(key, expenseData[key]);
        }
      });

      // Add receipt files
      if (expenseData.receipts && expenseData.receipts.length > 0) {
        for (let i = 0; i < expenseData.receipts.length; i++) {
          const receipt = expenseData.receipts[i];
          formData.append('receipts', receipt.file, `receipt_${i}.jpg`);
        }
      }

      const response = await this.api.post('/api/expenses/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Expense submitted successfully!'
      };
    } catch (error) {
      console.error('Expense submission error:', error);
      
      // If network error, try to store offline
      if (!error.response && !navigator.onLine) {
        try {
          await offlineService.storeExpense(expenseData);
          return {
            success: true,
            offline: true,
            message: 'Expense saved offline. Will sync when connected.'
          };
        } catch (offlineError) {
          console.error('Offline storage failed:', offlineError);
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit expense'
      };
    }
  }

  async getMyExpenses(page = 1, limit = 20) {
    try {
      const response = await this.api.get('/api/expenses/my-expenses', {
        params: { page, limit }
      });

      return {
        success: true,
        data: response.data.expenses,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Get expenses error:', error);
      
      // Try to get cached data if offline
      if (!navigator.onLine) {
        try {
          const cachedExpenses = await offlineService.getCachedExpenses();
          return {
            success: true,
            data: cachedExpenses,
            offline: true
          };
        } catch (cacheError) {
          console.error('Cache retrieval failed:', cacheError);
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load expenses'
      };
    }
  }

  async getExpenseDetails(expenseId) {
    try {
      const response = await this.api.get(`/api/expenses/${expenseId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get expense details error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load expense details'
      };
    }
  }

  async getCategories() {
    try {
      const response = await this.api.get('/api/budget/categories');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get categories error:', error);
      
      // Try to get cached categories if offline
      if (!navigator.onLine) {
        try {
          const cachedCategories = await offlineService.getCachedCategories();
          if (cachedCategories.length > 0) {
            return {
              success: true,
              data: cachedCategories,
              offline: true
            };
          }
        } catch (cacheError) {
          console.error('Cache retrieval failed:', cacheError);
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load categories'
      };
    }
  }

  async getEvents() {
    try {
      const response = await this.api.get('/api/events');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get events error:', error);
      
      // Try to get cached events if offline
      if (!navigator.onLine) {
        try {
          const cachedEvents = await offlineService.getCachedEvents();
          if (cachedEvents.length > 0) {
            return {
              success: true,
              data: cachedEvents,
              offline: true
            };
          }
        } catch (cacheError) {
          console.error('Cache retrieval failed:', cacheError);
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load events'
      };
    }
  }

  async updateExpense(expenseId, updateData) {
    try {
      const response = await this.api.put(`/api/expenses/${expenseId}`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Update expense error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update expense'
      };
    }
  }

  async deleteExpense(expenseId) {
    try {
      await this.api.delete(`/api/expenses/${expenseId}`);
      return {
        success: true,
        message: 'Expense deleted successfully'
      };
    } catch (error) {
      console.error('Delete expense error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete expense'
      };
    }
  }

  // Utility methods
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusColor(status) {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'processing': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status) {
    const icons = {
      'pending': '⏳',
      'approved': '✅',
      'rejected': '❌',
      'processing': '🔄'
    };
    return icons[status] || '📄';
  }

  // Sync methods for offline functionality
  async syncPendingExpenses() {
    try {
      const pendingExpenses = await offlineService.getPendingExpenses();
      const results = [];

      for (const expense of pendingExpenses) {
        try {
          const result = await this.submitExpense(expense.data);
          if (result.success && !result.offline) {
            await offlineService.markExpenseSynced(expense.id);
            results.push({ id: expense.id, success: true });
          } else {
            results.push({ id: expense.id, success: false, error: result.error });
          }
        } catch (error) {
          console.error(`Failed to sync expense ${expense.id}:`, error);
          results.push({ id: expense.id, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Sync pending expenses error:', error);
      throw error;
    }
  }

  // Cache management
  async cacheData(type, data) {
    try {
      await offlineService.cacheData(type, data);
    } catch (error) {
      console.error(`Failed to cache ${type}:`, error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.api.get('/api/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const expenseService = new ExpenseService();
