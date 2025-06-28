import api from '@/utils/api';
import { toast } from 'react-toastify';

export const communicationsTemplatesAPI = {
  // Get all templates for the current org and shared
  getTemplates: async () => {
    try {
      const { data, error } = await api.get('/api/communications/templates');
      if (error) throw new Error(error);
      return data;
    } catch (error) {
      toast.error('Failed to fetch templates: ' + error.message);
      throw error;
    }
  },

  // Create a new template
  createTemplate: async (template) => {
    try {
      const { data, error } = await api.post('/communications/templates', template);
      if (error) throw new Error(error);
      toast.success('Template created successfully!');
      return data;
    } catch (error) {
      toast.error('Failed to create template: ' + error.message);
      throw error;
    }
  },

  // Update an existing template
  updateTemplate: async (id, template) => {
    try {
      const { data, error } = await api.put(`/communications/templates/${id}`, template);
      if (error) throw new Error(error);
      toast.success('Template updated successfully!');
      return data;
    } catch (error) {
      toast.error('Failed to update template: ' + error.message);
      throw error;
    }
  },

  // Delete a template
  deleteTemplate: async (id) => {
    try {
      const { data, error } = await api.delete(`/communications/templates/${id}`);
      if (error) throw new Error(error);
      toast.success('Template deleted successfully!');
      return data;
    } catch (error) {
      toast.error('Failed to delete template: ' + error.message);
      throw error;
    }
  },
};

export default communicationsTemplatesAPI; 