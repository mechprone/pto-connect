import { api } from '../../utils/api.js';

export const reconciliationAPI = {
  // Start a new reconciliation
  startReconciliation: async (data) => {
    console.log('🔍 [FRONTEND DEBUG] startReconciliation called with data:', data);
    
    try {
      console.log('🔍 [FRONTEND DEBUG] Making API call to /budget/reconciliation/start');
      const response = await api.post('/budget/reconciliation/start', data);
      
      console.log('🔍 [FRONTEND DEBUG] API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // Handle new standardized response format
      const result = {
        success: response.data.success,
        data: response.data.data,
        error: response.data.errors?.[0]?.message || null
      };
      
      console.log('🔍 [FRONTEND DEBUG] Processed result:', result);
      return result;
    } catch (error) {
      console.error('❌ [FRONTEND DEBUG] Error starting reconciliation:', error);
      console.error('❌ [FRONTEND DEBUG] Error response:', error.response);
      console.error('❌ [FRONTEND DEBUG] Error response data:', error.response?.data);
      console.error('❌ [FRONTEND DEBUG] Error response status:', error.response?.status);
      
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                          error.response?.data?.error || 
                          error.message;
      
      console.error('❌ [FRONTEND DEBUG] Final error message:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Get all reconciliations for the organization
  getReconciliations: async () => {
    try {
      const response = await api.get('/api/budget/reconciliation');
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.errors?.[0]?.message || null
      };
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      return { success: false, error: errorMessage };
    }
  },

  // Upload bank statement
  uploadStatement: async (reconciliationId, data) => {
    try {
      const response = await api.post(`/budget/reconciliation/${reconciliationId}/upload`, data);
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.errors?.[0]?.message || null
      };
    } catch (error) {
      console.error('Error uploading statement:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      return { success: false, error: errorMessage };
    }
  },

  // Get transactions for matching
  getTransactions: async (reconciliationId) => {
    try {
      const response = await api.get(`/budget/reconciliation/${reconciliationId}/transactions`);
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.errors?.[0]?.message || null
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      return { success: false, error: errorMessage };
    }
  },

  // Match a bank transaction to an expense
  matchTransaction: async (reconciliationId, matchData) => {
    try {
      const response = await api.post(`/budget/reconciliation/${reconciliationId}/match`, {
        bank_transaction_id: matchData.bankTransactionId,
        expense_id: matchData.expenseId
      });
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.errors?.[0]?.message || null
      };
    } catch (error) {
      console.error('Error matching transaction:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      return { success: false, error: errorMessage };
    }
  },

  // Complete the reconciliation
  completeReconciliation: async (reconciliationId) => {
    try {
      const response = await api.post(`/budget/reconciliation/${reconciliationId}/complete`);
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.errors?.[0]?.message || null
      };
    } catch (error) {
      console.error('Error completing reconciliation:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      return { success: false, error: errorMessage };
    }
  },

  // Generate reconciliation report
  generateReport: async (reconciliationId) => {
    try {
      const response = await api.get(`/budget/reconciliation/${reconciliationId}/report`);
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.errors?.[0]?.message || null
      };
    } catch (error) {
      console.error('Error generating report:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      return { success: false, error: errorMessage };
    }
  }
};
