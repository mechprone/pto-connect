import api from '@/utils/api';

export const communicationsTemplatesAPI = {
  // Get all templates for the current org and shared
  getTemplates: async () => {
    const { data, error } = await api.get('/communications/templates');
    if (error) throw new Error(error);
    return data;
  },

  // Create a new template
  createTemplate: async (template) => {
    const { data, error } = await api.post('/communications/templates', template);
    if (error) throw new Error(error);
    return data;
  },

  // Update an existing template
  updateTemplate: async (id, template) => {
    const { data, error } = await api.put(`/communications/templates/${id}`, template);
    if (error) throw new Error(error);
    return data;
  },

  // Delete a template
  deleteTemplate: async (id) => {
    const { data, error } = await api.delete(`/communications/templates/${id}`);
    if (error) throw new Error(error);
    return data;
  },
};

export default communicationsTemplatesAPI; 