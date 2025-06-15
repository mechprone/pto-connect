import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fundraisersAPI } from '@/utils/api';
import { handleError, handleSuccess } from '@/utils/errorHandling';
import PageLayout from '@/modules/components/layout/PageLayout';
import Card from '@/components/common/Card';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { Chart } from 'chart.js';
import { Dropdown } from '@/components/common/Dropdown';

export default function FundraiserAnalytics() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    total_donations: 0,
    total_donors: 0,
    average_donation: 0,
    progress: 0,
    top_donor: null,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await fundraisersAPI.getFundraiserAnalytics(id);
      if (error) throw new Error(error);
      let topDonor = null;
      if (!data.top_donor) {
        const { data: topDonorData, error: topDonorError } = await fundraisersAPI.getFundraiserTopDonor(id);
        if (topDonorError) throw new Error(topDonorError);
        topDonor = topDonorData;
      } else {
        topDonor = data.top_donor;
      }
      setAnalytics({ ...data, top_donor: topDonor });
      setError(null);
    } catch (error) {
      const message = 'Failed to fetch fundraiser analytics';
      setError(message);
      handleError(error, message);
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
      title="Fundraiser Analytics"
      loading={loading}
      error={error}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(analytics.total_donations)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Donors</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.total_donors}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Donation</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(analytics.average_donation)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Top Donor</h3>
              {analytics.top_donor ? (
                <>
                  <p className="text-lg font-semibold text-gray-900">{analytics.top_donor.name}</p>
                  <p className="text-sm text-green-600">{formatCurrency(analytics.top_donor.amount)}</p>
                </>
              ) : (
                <p className="text-gray-400">No donations yet</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-900">{analytics.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${analytics.progress}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
} 