import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

const DonationTierManager = ({ fundraiserId }) => {
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    benefits: ''
  });

  useEffect(() => {
    fetchTiers();
  }, [fundraiserId]);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_tiers')
        .select('*')
        .eq('fundraiser_id', fundraiserId)
        .order('amount', { ascending: true });

      if (error) throw error;
      setTiers(data);
    } catch (error) {
      toast.error('Error fetching donation tiers');
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('donation_tiers')
        .insert([{
          ...formData,
          fundraiser_id: fundraiserId,
          amount: parseFloat(formData.amount)
        }]);

      if (error) throw error;
      toast.success('Donation tier created successfully');
      setFormData({
        name: '',
        amount: '',
        description: '',
        benefits: ''
      });
      fetchTiers();
    } catch (error) {
      toast.error('Error creating donation tier');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Donation Tiers</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tier Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Benefits
          </label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Tier'}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="border rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{tier.name}</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${tier.amount}
                </p>
              </div>
            </div>
            {tier.description && (
              <p className="mt-2 text-gray-600">{tier.description}</p>
            )}
            {tier.benefits && (
              <div className="mt-2">
                <h4 className="font-medium text-gray-700">Benefits:</h4>
                <p className="text-sm text-gray-600">{tier.benefits}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationTierManager; 