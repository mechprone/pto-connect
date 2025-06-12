import { get, post } from './api';

const BASE_URL = '/reconciliation';

export const reconciliationAPI = {
  getReconciliations: () => {
    return get(BASE_URL);
  },

  startReconciliation: (month, year) => {
    return post(`${BASE_URL}/start`, { month, year });
  },

  uploadStatement: (reconciliationId, transactions) => {
    return post(`${BASE_URL}/${reconciliationId}/upload`, { transactions });
  },

  getReconciliationData: (reconciliationId) => {
    return get(`${BASE_URL}/${reconciliationId}/transactions`);
  },

  matchTransaction: (reconciliationId, bank_transaction_id, expense_id) => {
    return post(`${BASE_URL}/${reconciliationId}/match`, { bank_transaction_id, expense_id });
  },
};
