import { api } from '../../utils/api.js';

export const reconciliationAPI = {
  // Start a new reconciliation
  startReconciliation: async (data) => {
    try {
      const response = await api.post('/budget/reconciliation/start', data);
      return response.data;
    } catch (error) {
      console.error('Error starting reconciliation:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all reconciliations for the organization
  getReconciliations: async () => {
    try {
      const response = await api.get('/budget/reconciliation');
      return response.data;
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload bank statement
  uploadStatement: async (reconciliationId, data) => {
    try {
      const response = await api.post(`/budget/reconciliation/${reconciliationId}/upload`, data);
      return response.data;
    } catch (error) {
      console.error('Error uploading statement:', error);
      return { success: false, error: error.message };
    }
  },

  // Get transactions for matching
  getTransactions: async (reconciliationId) => {
    try {
      const response = await api.get(`/budget/reconciliation/${reconciliationId}/transactions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { success: false, error: error.message };
    }
  },

  // Match a bank transaction to an expense
  matchTransaction: async (reconciliationId, matchData) => {
    try {
      const response = await api.post(`/budget/reconciliation/${reconciliationId}/match`, {
        bank_transaction_id: matchData.bankTransactionId,
        expense_id: matchData.expenseId
      });
      return response.data;
    } catch (error) {
      console.error('Error matching transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Complete the reconciliation
  completeReconciliation: async (reconciliationId) => {
    try {
      const response = await api.post(`/budget/reconciliation/${reconciliationId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing reconciliation:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate reconciliation report
  generateReport: async (reconciliationId) => {
    try {
      const response = await api.get(`/budget/reconciliation/${reconciliationId}/report`);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      return { success: false, error: error.message };
    }
  }
};
