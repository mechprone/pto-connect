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
    goal: '',
    type: 'donation',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const typeOptions = [
    { value: 'donation', label: 'Donation' },
    { value: 'sales', label: 'Sales' },
    { value: 'pledge', label: 'Pledge' }
  ];

  const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
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
      const { data, error } = await fundraisersAPI.getFundraiser(id);
      console.log('Fetched fundraiser data:', data, 'Error:', error);
      if (error) throw new Error(error);
      if (!data) throw new Error('No fundraiser found with this ID.');
      setFormData(data);
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
      if (id) {
        const { error } = await fundraisersAPI.updateFundraiser(id, formData);
        if (error) throw new Error(error);
        handleSuccess('Fundraiser updated successfully');
      } else {
        const { error } = await fundraisersAPI.createFundraiser(formData);
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
      [name]: name === 'is_active' ? value === 'true' : value
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
          label="Goal"
          id="goal"
          name="goal"
          type="number"
          value={formData.goal}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
        />

        <Select
          label="Type"
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          options={typeOptions}
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

        <Select
          label="Status"
          id="is_active"
          name="is_active"
          value={formData.is_active}
          onChange={handleChange}
          required
          options={statusOptions}
        />

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