import { apiClient } from '../api';

const BASE_URL = '/reconciliation';

export const reconciliationAPI = {
  getReconciliations: async () => {
    const response = await apiClient.get(BASE_URL);
    return response.data;
  },

  startReconciliation: async (month, year) => {
    const response = await apiClient.post(`${BASE_URL}/start`, { month, year });
    return response.data;
  },

  uploadStatement: async (reconciliationId, transactions) => {
    const response = await apiClient.post(`${BASE_URL}/${reconciliationId}/upload`, { transactions });
    return response.data;
  },

  getReconciliationData: async (reconciliationId) => {
    const response = await apiClient.get(`${BASE_URL}/${reconciliationId}/transactions`);
    return response.data;
  },

  matchTransaction: async (reconciliationId, bank_transaction_id, expense_id) => {
    const response = await apiClient.post(`${BASE_URL}/${reconciliationId}/match`, { bank_transaction_id, expense_id });
    return response.data;
  },
};
