import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fundraisersAPI } from '@/utils/api';
import { handleError, handleSuccess } from '@/utils/errorHandling';
import PageLayout from '@/modules/components/layout/PageLayout';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import Select from '@/components/common/Select';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DonationTierManager() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [editingTier, setEditingTier] = useState(null);
  const [newTier, setNewTier] = useState({
    name: '',
    amount: '',
    description: '',
    benefits: ''
  });
  const [donorData, setDonorData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedFundraiser, setSelectedFundraiser] = useState('');
  const [selectedDonorType, setSelectedDonorType] = useState('');

  useEffect(() => {
    fetchTiers();
    fetchDonorData();
  }, [id]);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const { data, error } = await fundraisersAPI.getDonationTiers(id);
      if (error) throw new Error(error);
      setTiers(data);
      setError(null);
    } catch (error) {
      const message = 'Failed to fetch donation tiers';
      setError(message);
      handleError(error, message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonorData = async () => {
    try {
      setLoading(true);
      const { data, error } = await fundraisersAPI.getDonorData(id, selectedYear, selectedFundraiser, selectedDonorType);
      if (error) throw new Error(error);
      setDonorData(data);
      setError(null);
    } catch (error) {
      const message = 'Failed to fetch donor data';
      setError(message);
      handleError(error, message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await fundraisersAPI.createDonationTier(id, newTier);
      if (error) throw new Error(error);
      setTiers([...tiers, data]);
      setNewTier({
        name: '',
        amount: '',
        description: '',
        benefits: ''
      });
      handleSuccess('Donation tier created successfully');
    } catch (error) {
      handleError(error, 'Failed to create donation tier');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTier = async (tierId, updatedData) => {
    try {
      setLoading(true);
      const { data, error } = await fundraisersAPI.updateDonationTier(id, tierId, updatedData);
      if (error) throw new Error(error);
      setTiers(tiers.map(tier => tier.id === tierId ? data : tier));
      setEditingTier(null);
      handleSuccess('Donation tier updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update donation tier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTier = async (tierId) => {
    if (!window.confirm('Are you sure you want to delete this donation tier?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await fundraisersAPI.deleteDonationTier(id, tierId);
      if (error) throw new Error(error);
      setTiers(tiers.filter(tier => tier.id !== tierId));
      handleSuccess('Donation tier deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete donation tier');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <PageLayout
      title="Donation Tiers"
      loading={loading}
      error={error}
    >
      <div className="space-y-6">
        <Card title="Create New Tier">
          <form onSubmit={handleCreateTier} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tier Name"
                value={newTier.name}
                onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                required
              />
              <Input
                label="Amount"
                type="number"
                value={newTier.amount}
                onChange={(e) => setNewTier({ ...newTier, amount: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <Input
              label="Description"
              value={newTier.description}
              onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
              required
              as="textarea"
              rows={2}
            />
            <Input
              label="Benefits"
              value={newTier.benefits}
              onChange={(e) => setNewTier({ ...newTier, benefits: e.target.value })}
              required
              as="textarea"
              rows={2}
            />
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Tier</span>
              </Button>
            </div>
          </form>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              title={editingTier === tier.id ? 'Edit Tier' : tier.name}
            >
              {editingTier === tier.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateTier(tier.id, {
                      name: e.target.name.value,
                      amount: e.target.amount.value,
                      description: e.target.description.value,
                      benefits: e.target.benefits.value
                    });
                  }}
                  className="space-y-4"
                >
                  <Input
                    label="Tier Name"
                    name="name"
                    defaultValue={tier.name}
                    required
                  />
                  <Input
                    label="Amount"
                    name="amount"
                    type="number"
                    defaultValue={tier.amount}
                    required
                    min="0"
                    step="0.01"
                  />
                  <Input
                    label="Description"
                    name="description"
                    defaultValue={tier.description}
                    required
                    as="textarea"
                    rows={2}
                  />
                  <Input
                    label="Benefits"
                    name="benefits"
                    defaultValue={tier.benefits}
                    required
                    as="textarea"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingTier(null)}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-5 w-5" />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      type="submit"
                      className="flex items-center space-x-2"
                    >
                      <Check className="h-5 w-5" />
                      <span>Save</span>
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(tier.amount)}
                  </div>
                  <p className="text-gray-600">{tier.description}</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits</h4>
                    <p className="text-gray-600 whitespace-pre-line">{tier.benefits}</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingTier(tier.id)}
                      className="flex items-center space-x-2"
                    >
                      <Edit2 className="h-5 w-5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteTier(tier.id)}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card title="Donor Data">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Year"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  fetchDonorData();
                }}
                options={Array.from({ length: 10 }, (_, i) => ({
                  value: new Date().getFullYear() - i,
                  label: new Date().getFullYear() - i
                }))}
              />
              <Select
                label="Fundraiser"
                value={selectedFundraiser}
                onChange={(e) => {
                  setSelectedFundraiser(e.target.value);
                  fetchDonorData();
                }}
                options={Array.from({ length: 10 }, (_, i) => ({
                  value: `Fundraiser ${i + 1}`,
                  label: `Fundraiser ${i + 1}`
                }))}
              />
              <Select
                label="Donor Type"
                value={selectedDonorType}
                onChange={(e) => {
                  setSelectedDonorType(e.target.value);
                  fetchDonorData();
                }}
                options={Array.from({ length: 10 }, (_, i) => ({
                  value: `Donor Type ${i + 1}`,
                  label: `Donor Type ${i + 1}`
                }))}
              />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={donorData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(str) => {
                      return str.length > 20 ? str.slice(0, 20) + '...' : str;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      return `Amount: ${value}`;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
} 