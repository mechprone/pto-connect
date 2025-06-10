import { apiClient } from './api';

export const budgetAPI = {
  // Budget Categories
  getCategories: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.fiscal_year) queryParams.append('fiscal_year', params.fiscal_year);
    if (params.category_type) queryParams.append('category_type', params.category_type);
    if (params.include_inactive !== undefined) queryParams.append('include_inactive', params.include_inactive);
    if (params.include_spending !== undefined) queryParams.append('include_spending', params.include_spending);

    const response = await apiClient.get(`/budget/categories?${queryParams.toString()}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/budget/categories', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await apiClient.put(`/budget/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await apiClient.delete(`/budget/categories/${categoryId}`);
    return response.data;
  },

  getCategoryTemplates: async (categoryType = null) => {
    const params = categoryType ? `?category_type=${categoryType}` : '';
    const response = await apiClient.get(`/budget/categories/templates${params}`);
    return response.data;
  },

  bulkCreateCategories: async (data) => {
    const response = await apiClient.post('/budget/categories/bulk-create', data);
    return response.data;
  },

  // Budget Plans (placeholder for future implementation)
  getBudgetPlans: async (fiscalYear = null) => {
    const params = fiscalYear ? `?fiscal_year=${fiscalYear}` : '';
    const response = await apiClient.get(`/budget/plans${params}`);
    return response.data;
  },

  createBudgetPlan: async (planData) => {
    const response = await apiClient.post('/budget/plans', planData);
    return response.data;
  },

  updateBudgetPlan: async (planId, planData) => {
    const response = await apiClient.put(`/budget/plans/${planId}`, planData);
    return response.data;
  },

  deleteBudgetPlan: async (planId) => {
    const response = await apiClient.delete(`/budget/plans/${planId}`);
    return response.data;
  },

  // Budget Analytics
  getBudgetAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.fiscal_year) queryParams.append('fiscal_year', params.fiscal_year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.category_id) queryParams.append('category_id', params.category_id);

    const response = await apiClient.get(`/budget/analytics?${queryParams.toString()}`);
    return response.data;
  },

  getBudgetVarianceReport: async (fiscalYear) => {
    const response = await apiClient.get(`/budget/reports/variance?fiscal_year=${fiscalYear}`);
    return response.data;
  },

  // Financial Reports
  generateFinancialReport: async (reportData) => {
    const response = await apiClient.post('/budget/reports/generate', reportData);
    return response.data;
  },

  getFinancialReports: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.report_type) queryParams.append('report_type', params.report_type);
    if (params.fiscal_year) queryParams.append('fiscal_year', params.fiscal_year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const response = await apiClient.get(`/budget/reports?${queryParams.toString()}`);
    return response.data;
  },

  downloadReport: async (reportId, format = 'pdf') => {
    const response = await apiClient.get(`/budget/reports/${reportId}/download?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Fundraising Campaigns
  getCampaigns: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.fiscal_year) queryParams.append('fiscal_year', params.fiscal_year);
    if (params.include_analytics) queryParams.append('include_analytics', params.include_analytics);

    const response = await apiClient.get(`/budget/campaigns?${queryParams.toString()}`);
    return response.data;
  },

  createCampaign: async (campaignData) => {
    const response = await apiClient.post('/budget/campaigns', campaignData);
    return response.data;
  },

  updateCampaign: async (campaignId, campaignData) => {
    const response = await apiClient.put(`/budget/campaigns/${campaignId}`, campaignData);
    return response.data;
  },

  deleteCampaign: async (campaignId) => {
    const response = await apiClient.delete(`/budget/campaigns/${campaignId}`);
    return response.data;
  },

  getCampaignAnalytics: async (campaignId) => {
    const response = await apiClient.get(`/budget/campaigns/${campaignId}/analytics`);
    return response.data;
  }
};

export const expenseAPI = {
  // Expense Submissions
  submitExpense: async (expenseData) => {
    const response = await apiClient.post('/expenses/submit', expenseData);
    return response.data;
  },

  getPendingExpenses: async () => {
    const response = await apiClient.get('/expenses/pending');
    return response.data;
  },

  getUserExpenses: async (userId) => {
    const response = await apiClient.get(`/expenses/user/${userId}`);
    return response.data;
  },

  getExpenseById: async (expenseId) => {
    const response = await apiClient.get(`/expenses/${expenseId}`);
    return response.data;
  },

  approveExpense: async (expenseId, data = {}) => {
    const response = await apiClient.put(`/expenses/${expenseId}/approve`, data);
    return response.data;
  },

  rejectExpense: async (expenseId, data) => {
    const response = await apiClient.put(`/expenses/${expenseId}/reject`, data);
    return response.data;
  },

  requestMoreInfo: async (expenseId, data) => {
    const response = await apiClient.put(`/expenses/${expenseId}/request-info`, data);
    return response.data;
  },

  updateExpense: async (expenseId, expenseData) => {
    const response = await apiClient.put(`/expenses/${expenseId}`, expenseData);
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    const response = await apiClient.delete(`/expenses/${expenseId}`);
    return response.data;
  },

  // Receipt Upload
  uploadReceipt: async (file, expenseId = null) => {
    const formData = new FormData();
    formData.append('receipt', file);
    if (expenseId) formData.append('expense_id', expenseId);

    const response = await apiClient.post('/expenses/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Expense Analytics
  getExpenseAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.fiscal_year) queryParams.append('fiscal_year', params.fiscal_year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.event_id) queryParams.append('event_id', params.event_id);

    const response = await apiClient.get(`/expenses/analytics?${queryParams.toString()}`);
    return response.data;
  },

  // Bulk Operations
  bulkApproveExpenses: async (expenseIds, notes = '') => {
    const response = await apiClient.post('/expenses/bulk-approve', {
      expense_ids: expenseIds,
      notes
    });
    return response.data;
  },

  bulkRejectExpenses: async (expenseIds, reason) => {
    const response = await apiClient.post('/expenses/bulk-reject', {
      expense_ids: expenseIds,
      reason
    });
    return response.data;
  },

  // Export Functions
  exportExpenses: async (params = {}, format = 'csv') => {
    const queryParams = new URLSearchParams();
    
    if (params.fiscal_year) queryParams.append('fiscal_year', params.fiscal_year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.status) queryParams.append('status', params.status);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    queryParams.append('format', format);

    const response = await apiClient.get(`/expenses/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// School Officials API (for future implementation)
export const schoolOfficialsAPI = {
  getOfficials: async () => {
    const response = await apiClient.get('/budget/school-officials');
    return response.data;
  },

  addOfficial: async (officialData) => {
    const response = await apiClient.post('/budget/school-officials', officialData);
    return response.data;
  },

  updateOfficial: async (officialId, officialData) => {
    const response = await apiClient.put(`/budget/school-officials/${officialId}`, officialData);
    return response.data;
  },

  removeOfficial: async (officialId) => {
    const response = await apiClient.delete(`/budget/school-officials/${officialId}`);
    return response.data;
  },

  sendReport: async (officialId, reportData) => {
    const response = await apiClient.post(`/budget/school-officials/${officialId}/send-report`, reportData);
    return response.data;
  }
};

// Approval Workflows API (for future implementation)
export const approvalWorkflowsAPI = {
  getWorkflows: async () => {
    const response = await apiClient.get('/budget/approval-workflows');
    return response.data;
  },

  createWorkflow: async (workflowData) => {
    const response = await apiClient.post('/budget/approval-workflows', workflowData);
    return response.data;
  },

  updateWorkflow: async (workflowId, workflowData) => {
    const response = await apiClient.put(`/budget/approval-workflows/${workflowId}`, workflowData);
    return response.data;
  },

  deleteWorkflow: async (workflowId) => {
    const response = await apiClient.delete(`/budget/approval-workflows/${workflowId}`);
    return response.data;
  },

  getWorkflowStatus: async (workflowId, itemId) => {
    const response = await apiClient.get(`/budget/approval-workflows/${workflowId}/status/${itemId}`);
    return response.data;
  }
};

export default {
  budgetAPI,
  expenseAPI,
  schoolOfficialsAPI,
  approvalWorkflowsAPI
};
