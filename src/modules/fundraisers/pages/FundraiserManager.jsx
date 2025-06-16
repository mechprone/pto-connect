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
import Donors from './Donors';
import Reports from './Reports';

export default function FundraiserManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundraisers, setFundraisers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);
  const [activeTab, setActiveTab] = useState('fundraisers');

  useEffect(() => {
    fetchFundraisers();
  }, []);

  const fetchFundraisers = async () => {
    try {
      setLoading(true);
      const { data, error } = await fundraisersAPI.getFundraisers();
      if (error) throw new Error(error);
      setFundraisers(data?.data || []);
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
      {/* Top-level Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'fundraisers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('fundraisers')}
          >
            Active Fundraisers
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'donors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('donors')}
          >
            Donors
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'share' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('share')}
          >
            Share
          </button>
        </nav>
      </div>
      {/* Tab Content */}
      {activeTab === 'fundraisers' && (
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
        </div>
      )}
      {activeTab === 'analytics' && (
        <div className="mt-8">
          <FundraiserAnalytics />
        </div>
      )}
      {activeTab === 'donors' && (
        <div className="mt-8">
          <Donors />
        </div>
      )}
      {activeTab === 'reports' && (
        <div className="mt-8">
          <Reports />
        </div>
      )}
      {activeTab === 'share' && (
        <div className="mb-6">
          <label htmlFor="fundraiser-select" className="block text-sm font-medium text-gray-700 mb-2">Select Fundraiser to Share</label>
          <select
            id="fundraiser-select"
            className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            value={selectedFundraiser ? selectedFundraiser.id : ''}
            onChange={e => {
              const found = fundraisers.find(f => f.id === e.target.value);
              setSelectedFundraiser(found || null);
            }}
          >
            <option value="">-- Select a Fundraiser --</option>
            {fundraisers.map(f => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
        </div>
      )}
      {activeTab === 'share' && (
        <SocialShare fundraiserId={selectedFundraiser ? selectedFundraiser.id : null} />
      )}
    </PageLayout>
  );
} 