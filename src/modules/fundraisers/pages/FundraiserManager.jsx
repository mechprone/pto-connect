import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fundraisersAPI } from '@/utils/api';
import { handleError, handleSuccess } from '@/utils/errorHandling';
import PageLayout from '@/modules/components/layout/PageLayout';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import DonationTierManager from './DonationTierManager';
import FundraiserAnalytics from './FundraiserAnalytics';
import SocialShare from './SocialShare';

export default function FundraiserManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundraisers, setFundraisers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);

  useEffect(() => {
    fetchFundraisers();
  }, []);

  const fetchFundraisers = async () => {
    try {
      setLoading(true);
      const { data, error } = await fundraisersAPI.getFundraisers();
      if (error) throw new Error(error);
      setFundraisers(data);
      setError(null);
    } catch (error) {
      const message = 'Failed to fetch fundraisers';
      setError(message);
      handleError(error, message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fundraiser?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await fundraisersAPI.deleteFundraiser(id);
      if (error) throw new Error(error);
      handleSuccess('Fundraiser deleted successfully');
      fetchFundraisers();
    } catch (error) {
      handleError(error, 'Failed to delete fundraiser');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCreateFundraiser = () => {
    navigate('/fundraisers/create');
  };

  const handleEditFundraiser = (id) => {
    navigate(`/fundraisers/${id}/edit`);
  };

  const handleViewAnalytics = (id) => {
    navigate(`/fundraisers/${id}/analytics`);
  };

  const filteredFundraisers = fundraisers.filter(fundraiser => {
    const matchesSearch = fundraiser.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fundraiser.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || fundraiser.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageLayout
      title="Fundraiser Manager"
      loading={loading}
      error={error}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Active Fundraisers</h2>
          <Button onClick={() => navigate('/fundraisers/create')}>
            Create New Fundraiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFundraisers.map((fundraiser) => (
            <Card
              key={fundraiser.id}
              title={fundraiser.title}
              description={fundraiser.description}
            >
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Goal:</span>
                  <span className="font-medium">{formatCurrency(fundraiser.goal_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    fundraiser.status === 'active' ? 'text-green-600' :
                    fundraiser.status === 'completed' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {fundraiser.status.charAt(0).toUpperCase() + fundraiser.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dates:</span>
                  <span className="font-medium">
                    {formatDate(fundraiser.start_date)} - {formatDate(fundraiser.end_date)}
                  </span>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleEditFundraiser(fundraiser.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(fundraiser.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredFundraisers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No fundraisers found</p>
          </div>
        )}

        {selectedFundraiser && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Fundraiser Details</h2>
            <DonationTierManager fundraiserId={selectedFundraiser.id} />
            <FundraiserAnalytics fundraiserId={selectedFundraiser.id} />
            <SocialShare fundraiserId={selectedFundraiser.id} />
          </div>
        )}
      </div>
    </PageLayout>
  );
} 