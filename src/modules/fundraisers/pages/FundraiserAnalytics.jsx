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
    donors: [],
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

  const normalizeAnalytics = (data) => ({
    ...analytics,
    ...data,
    monthly_trends: Array.isArray(data?.monthly_trends) ? data.monthly_trends : [],
    donor_demographics: Array.isArray(data?.donor_demographics) ? data.donor_demographics : [],
    campaign_performance: Array.isArray(data?.campaign_performance) ? data.campaign_performance : [],
    volunteer_metrics: Array.isArray(data?.volunteer_metrics) ? data.volunteer_metrics : [],
    supply_categories: Array.isArray(data?.supply_categories) ? data.supply_categories : [],
    donors: Array.isArray(data?.donors) ? data.donors : [],
    top_donors: Array.isArray(data?.top_donors) ? data.top_donors : [],
    recurring_donor_list: Array.isArray(data?.recurring_donor_list) ? data.recurring_donor_list : [],
    donor_retention: Array.isArray(data?.donor_retention) ? data.donor_retention : [],
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let data, error;
      if (id) {
        ({ data, error } = await fundraisersAPI.getFundraiserAnalytics(id, { dateRange }));
      } else {
        ({ data, error } = await fundraisersAPI.getAllFundraisersAnalytics({ dateRange }));
      }
      console.log('Analytics API full response:', { data, error });
      if (error) throw new Error(error);
      setAnalytics(normalizeAnalytics(typeof data === 'object' && data !== null ? data : {}));
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

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }
  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview metrics */}
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
      {/* Donation Trends Chart */}
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
              <RechartsPieChart>
                <Pie
                  data={analytics.supply_categories}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#2563eb"
                  label
                >
                  {analytics.supply_categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
} 