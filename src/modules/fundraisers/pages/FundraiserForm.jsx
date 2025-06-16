import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fundraisersAPI } from '@/utils/api';
import { handleError, handleSuccess } from '@/utils/errorHandling';
import PageLayout from '@/modules/components/layout/PageLayout';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

export default function FundraiserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    category_id: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    visibility: 'organization',
  });

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'organization', label: 'Organization Only' }
  ];

  useEffect(() => {
    if (id) {
      fetchFundraiser();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchFundraiser = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fundraisersAPI.getFundraiser(id);
      console.log('Raw API response:', response);
      
      // Extract the actual fundraiser data from the nested response
      const fundraiserData = response.data?.data || response.data || response;
      console.log('Extracted fundraiser data:', fundraiserData);
      console.log('Fundraiser data keys:', fundraiserData ? Object.keys(fundraiserData) : 'no data');
      
      if (response.error) throw new Error(response.error);
      if (!fundraiserData) throw new Error('No fundraiser found with this ID.');
      
      // Transform data to match form field names
      const transformedData = {
        title: fundraiserData.title || '',
        description: fundraiserData.description || '',
        goal_amount: fundraiserData.goal_amount || fundraiserData.goal || '',
        category_id: fundraiserData.category_id || fundraiserData.category || '',
        start_date: fundraiserData.start_date ? fundraiserData.start_date.split('T')[0] : '',
        end_date: fundraiserData.end_date ? fundraiserData.end_date.split('T')[0] : '',
        status: fundraiserData.status || 'draft',
        visibility: fundraiserData.visibility || 'organization',
      };
      
      console.log('Individual field values:');
      console.log('fundraiserData.title:', fundraiserData.title);
      console.log('fundraiserData.goal:', fundraiserData.goal);
      console.log('fundraiserData.start_date:', fundraiserData.start_date);
      console.log('Transformed data for form:', transformedData);
      setFormData(transformedData);
      setError(null);
    } catch (error) {
      const message = 'Failed to fetch fundraiser details';
      setError(error.message || message);
      handleError(error, message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Transform form data to match backend expectations
      const submitData = {
        title: formData.title,
        description: formData.description,
        goal_amount: formData.goal_amount,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        visibility: formData.visibility,
        category: formData.category_id,
      };
      
      if (id) {
        const { error } = await fundraisersAPI.updateFundraiser(id, submitData);
        if (error) throw new Error(error);
        handleSuccess('Fundraiser updated successfully');
      } else {
        const { error } = await fundraisersAPI.createFundraiser(submitData);
        if (error) throw new Error(error);
        handleSuccess('Fundraiser created successfully');
      }
      navigate('/fundraisers');
    } catch (error) {
      handleError(error, id ? 'Failed to update fundraiser' : 'Failed to create fundraiser');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><span className="text-blue-600 text-lg">Loading fundraiser details...</span></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!id && window.location.pathname.includes('edit')) {
    return <div className="text-red-500 text-center mt-8">No fundraiser selected. Please select a fundraiser to edit.</div>;
  }

  return (
    <PageLayout
      title={id ? 'Edit Fundraiser' : 'Create Fundraiser'}
      loading={loading}
      error={error}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <Input
          label="Title"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Input
          label="Description"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          as="textarea"
          rows={4}
        />

        <Input
          label="Goal Amount"
          id="goal_amount"
          name="goal_amount"
          type="number"
          value={formData.goal_amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
        />

        <Input
          label="Category"
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Start Date"
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />

          <Input
            label="End Date"
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Status"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            options={statusOptions}
          />

          <Select
            label="Visibility"
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            required
            options={visibilityOptions}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/fundraisers')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
          >
            {id ? 'Update' : 'Create'} Fundraiser
          </Button>
        </div>
      </form>
    </PageLayout>
  );
} 