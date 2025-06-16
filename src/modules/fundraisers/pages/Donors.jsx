import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fundraisersAPI } from '@/utils/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { format } from 'date-fns';

export default function Donors() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    donors: [],
    top_donors: [],
    recurring_donor_list: [],
    donor_retention: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Use the dedicated donor retention endpoint
      const retentionResponse = await fundraisersAPI.getAnalyticsDonorRetention();
      console.log('Donor retention response:', retentionResponse);
      
      // Safely extract data with fallbacks
      const responseData = retentionResponse?.data?.data;
      let donorData = [];
      
      // Handle different possible response structures
      if (Array.isArray(responseData)) {
        donorData = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // If data is an object, try to extract an array from it
        donorData = responseData.donors || responseData.retention || [];
      }
      
      // Ensure donorData is always an array
      if (!Array.isArray(donorData)) {
        donorData = [];
      }
      
      console.log('Processed donor data:', donorData);
      
      setAnalytics({
        donors: donorData, // Use retention data as main donor list
        top_donors: donorData.slice(0, 10), // Top 10 by total donated
        recurring_donor_list: donorData.filter(d => d.months_active > 1), // Donors active multiple months
        donor_retention: donorData
      });
      setError(null);
    } catch (error) {
      setError('Failed to fetch donor analytics');
      console.error('Donor analytics fetch error:', error);
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

  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }
  if (loading) {
    return <div className="text-center py-12">Loading donors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Donor Analytics</h2>
        <Button onClick={() => navigate('/fundraisers/record-donation')}>Add Donation</Button>
      </div>
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Donor List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Donated</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Donation</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recurring</th>
              </tr>
            </thead>
            <tbody>
              {(analytics.donors && analytics.donors.length > 0) ? (
                analytics.donors.map((donor, idx) => (
                  <tr key={idx} className="bg-white even:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{donor?.donor_email || `Donor ${idx + 1}`}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{donor?.donor_email || 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(donor?.total_donated || 0)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{donor?.last_donation ? formatDate(donor.last_donation) : 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{(donor?.months_active || 0) > 1 ? 'Yes' : 'No'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-4 text-gray-500">No donors found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Donors</h3>
        <ul className="divide-y divide-gray-200">
          {(analytics.top_donors && analytics.top_donors.length > 0) ? (
            analytics.top_donors.map((donor, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{donor?.donor_email || `Donor ${idx + 1}`}</span>
                <span className="font-semibold">{formatCurrency(donor?.total_donated || 0)}</span>
              </li>
            ))
          ) : (
            <li className="text-center py-4 text-gray-500">No top donors found.</li>
          )}
        </ul>
      </Card>
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recurring Donors</h3>
        <ul className="divide-y divide-gray-200">
          {(analytics.recurring_donor_list && analytics.recurring_donor_list.length > 0) ? (
            analytics.recurring_donor_list.map((donor, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{donor?.donor_email || `Donor ${idx + 1}`}</span>
                <span className="font-semibold">{formatCurrency(donor?.total_donated || 0)}</span>
              </li>
            ))
          ) : (
            <li className="text-center py-4 text-gray-500">No recurring donors found.</li>
          )}
        </ul>
      </Card>
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Donor Retention</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Months Active</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Donation</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Donation</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Donated</th>
              </tr>
            </thead>
            <tbody>
              {(analytics.donor_retention && analytics.donor_retention.length > 0) ? (
                analytics.donor_retention.map((row, idx) => (
                  <tr key={idx} className="bg-white even:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{row?.donor_email || `Donor ${idx + 1}`}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row?.months_active || 0}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row?.first_donation ? formatDate(row.first_donation) : 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row?.last_donation ? formatDate(row.last_donation) : 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(row?.total_donated || 0)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-4 text-gray-500">No donor retention data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 