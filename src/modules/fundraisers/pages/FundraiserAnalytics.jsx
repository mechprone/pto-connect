import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fundraisersAPI } from '@/utils/api';
import { handleError, handleSuccess } from '@/utils/errorHandling';
import PageLayout from '@/modules/components/layout/PageLayout';
import Card from '@/components/common/Card';
import { DollarSign, Users, TrendingUp, Clock, Package, Calendar, Target, BarChart2, PieChart, Activity } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useUserProfile } from '@/modules/hooks/useUserProfile';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function FundraiserAnalytics() {
  const { id } = useParams();
  const { profile, organization, loading: profileLoading } = useUserProfile();
  const org_id = profile?.org_id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('6m'); // 6m, 1y, all
  const [analytics, setAnalytics] = useState({
    total_donations: 0,
    total_donors: 0,
    average_donation: 0,
    progress: 0,
    top_donor: null,
    monetary_donations: 0,
    time_donations: 0,
    supply_donations: 0,
    donor_retention_rate: 0,
    recurring_donors: 0,
    campaign_efficiency: 0,
    volunteer_hours: 0,
    supply_value: 0,
    monthly_trends: [],
    donor_demographics: [],
    campaign_performance: [],
    volunteer_metrics: [],
    supply_categories: [],
    donors: [], // Add donors array for donor tab
    top_donors: [],
    recurring_donor_list: [],
    donor_retention: []
  });

  const [newDonation, setNewDonation] = useState({
    type: 'monetary',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    is_recurring: false,
    frequency: 'monthly',
    category: '',
    payment_method: 'credit_card'
  });

  useEffect(() => {
    if (profileLoading) return;
    if (!id && !org_id) {
      setError('No fundraiser or organization context found.');
      setLoading(false);
      return;
    }
    fetchAnalytics();
  }, [id, dateRange, org_id, profileLoading]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let data, error;
      if (id) {
        ({ data, error } = await fundraisersAPI.getFundraiserAnalytics(id, { dateRange }));
      } else {
        ({ data, error } = await fundraisersAPI.getAllFundraisersAnalytics({ dateRange }));
      }
      if (error) throw new Error(error);
      setAnalytics(data);
      setError(null);
    } catch (error) {
      const message = id
        ? 'Failed to fetch fundraiser analytics'
        : 'Failed to fetch organization-wide fundraiser analytics';
      setError(message);
      handleError(error, message);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await fundraisersAPI.addDonation(id, newDonation);
      if (error) throw new Error(error);
      handleSuccess('Donation recorded successfully');
      fetchAnalytics();
      setNewDonation({
        type: 'monetary',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        is_recurring: false,
        frequency: 'monthly',
        category: '',
        payment_method: 'credit_card'
      });
    } catch (error) {
      handleError(error, 'Failed to record donation');
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

  const renderOverviewTab = () => (
    <div className="space-y-6">
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
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Volunteer Hours</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.volunteer_hours}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Supply Value</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(analytics.supply_value)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Types</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Monetary', value: analytics.monetary_donations },
                    { name: 'Time', value: analytics.time_donations },
                    { name: 'Supplies', value: analytics.supply_donations }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.monthly_trends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDonorTab = () => (
    <div className="space-y-6">
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
              {analytics.donors && analytics.donors.length > 0 ? (
                analytics.donors.map((donor, idx) => (
                  <tr key={idx} className="bg-white even:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{donor.donor_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{donor.donor_email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(donor.total_donations)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(donor.last_donation_date)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{donor.is_recurring ? 'Yes' : 'No'}</td>
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
          {analytics.top_donors && analytics.top_donors.length > 0 ? (
            analytics.top_donors.map((donor, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{donor.donor_name}</span>
                <span className="font-semibold">{formatCurrency(donor.total_donations)}</span>
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
          {analytics.recurring_donor_list && analytics.recurring_donor_list.length > 0 ? (
            analytics.recurring_donor_list.map((donor, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{donor.donor_name}</span>
                <span className="font-semibold">{formatCurrency(donor.total_donations)}</span>
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
              {analytics.donor_retention && analytics.donor_retention.length > 0 ? (
                analytics.donor_retention.map((row, idx) => (
                  <tr key={idx} className="bg-white even:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{row.donor_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.months_active}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(row.first_donation)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(row.last_donation)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(row.total_donated)}</td>
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

  const renderDonationEntryTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Donation</h3>
        <form onSubmit={handleDonationSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Donation Type"
              value={newDonation.type}
              onChange={(e) => setNewDonation({ ...newDonation, type: e.target.value })}
              options={[
                { value: 'monetary', label: 'Monetary' },
                { value: 'time', label: 'Time' },
                { value: 'supplies', label: 'Supplies' }
              ]}
            />
            <Input
              label="Amount/Value"
              type="number"
              value={newDonation.amount}
              onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })}
              required
            />
            <Input
              label="Donor Name"
              value={newDonation.donor_name}
              onChange={(e) => setNewDonation({ ...newDonation, donor_name: e.target.value })}
              required
            />
            <Input
              label="Donor Email"
              type="email"
              value={newDonation.donor_email}
              onChange={(e) => setNewDonation({ ...newDonation, donor_email: e.target.value })}
            />
            <Input
              label="Donor Phone"
              type="tel"
              value={newDonation.donor_phone}
              onChange={(e) => setNewDonation({ ...newDonation, donor_phone: e.target.value })}
            />
            <Input
              label="Date"
              type="date"
              value={newDonation.date}
              onChange={(e) => setNewDonation({ ...newDonation, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_recurring"
                checked={newDonation.is_recurring}
                onChange={(e) => setNewDonation({ ...newDonation, is_recurring: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_recurring" className="text-sm text-gray-700">
                Recurring Donation
              </label>
            </div>
            {newDonation.is_recurring && (
              <Select
                label="Frequency"
                value={newDonation.frequency}
                onChange={(e) => setNewDonation({ ...newDonation, frequency: e.target.value })}
                options={[
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'annually', label: 'Annually' }
                ]}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={newDonation.category}
              onChange={(e) => setNewDonation({ ...newDonation, category: e.target.value })}
              options={[
                { value: 'general', label: 'General' },
                { value: 'event', label: 'Event' },
                { value: 'program', label: 'Program' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'supplies', label: 'Supplies' }
              ]}
            />
            {newDonation.type === 'monetary' && (
              <Select
                label="Payment Method"
                value={newDonation.payment_method}
                onChange={(e) => setNewDonation({ ...newDonation, payment_method: e.target.value })}
                options={[
                  { value: 'credit_card', label: 'Credit Card' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'check', label: 'Check' },
                  { value: 'cash', label: 'Cash' }
                ]}
              />
            )}
          </div>
          <div>
            <Input
              label="Description"
              value={newDonation.description}
              onChange={(e) => setNewDonation({ ...newDonation, description: e.target.value })}
              multiline
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              Record Donation
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <PageLayout
      title="Fundraiser Analytics"
      loading={loading}
      error={error}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'donors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('donors')}
            >
              Donors
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'entry' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('entry')}
            >
              Record Donation
            </button>
          </div>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '6m', label: 'Last 6 Months' },
              { value: '1y', label: 'Last Year' },
              { value: 'all', label: 'All Time' }
            ]}
            className="w-40"
          />
        </div>

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'donors' && renderDonorTab()}
        {activeTab === 'entry' && renderDonationEntryTab()}
      </div>
    </PageLayout>
  );
} 