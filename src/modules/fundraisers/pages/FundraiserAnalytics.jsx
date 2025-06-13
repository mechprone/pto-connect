import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/utils/api';
import { handleError } from '@/utils/errorHandling';
import PageLayout from '@/modules/components/layout/PageLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function FundraiserAnalytics() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalDonations: 0,
    totalDonors: 0,
    averageDonation: 0,
    progress: 0,
    goal: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/fundraisers/${id}/analytics`);
      setAnalytics(data);
      setError(null);
    } catch (error) {
      const message = 'Failed to fetch fundraiser analytics';
      setError(message);
      handleError(error, message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout 
      title="Fundraiser Analytics"
      loading={loading}
      error={error}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Donations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Donations</h3>
          <p className="text-3xl font-bold text-blue-600">
            ${analytics.totalDonations.toLocaleString()}
          </p>
        </div>

        {/* Total Donors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Donors</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics.totalDonors.toLocaleString()}
          </p>
        </div>

        {/* Average Donation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Donation</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${analytics.averageDonation.toLocaleString()}
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Progress</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {analytics.progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${analytics.progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Goal: ${analytics.goal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 