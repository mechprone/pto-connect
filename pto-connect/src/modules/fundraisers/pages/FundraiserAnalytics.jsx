import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { toast } from 'sonner';

const FundraiserAnalytics = ({ fundraiserId }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    total_donations: 0,
    total_donors: 0,
    average_donation: 0,
    completion_percentage: 0,
    recent_donations: [],
    top_donors: [],
    donation_trends: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [fundraiserId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch basic analytics
      const { data: basicAnalytics, error: basicError } = await supabase
        .from('fundraiser_analytics')
        .select('*')
        .eq('fundraiser_id', fundraiserId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (basicError) throw basicError;

      // Fetch recent donations
      const { data: recentDonations, error: donationsError } = await supabase
        .from('donations')
        .select(`
          *,
          profiles:donor_id (full_name)
        `)
        .eq('fundraiser_id', fundraiserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (donationsError) throw donationsError;

      // Fetch top donors
      const { data: topDonors, error: donorsError } = await supabase
        .from('donations')
        .select(`
          donor_id,
          profiles:donor_id (full_name),
          sum:amount
        `)
        .eq('fundraiser_id', fundraiserId)
        .group('donor_id, profiles.full_name')
        .order('sum', { ascending: false })
        .limit(5);

      if (donorsError) throw donorsError;

      // Fetch donation trends (last 7 days)
      const { data: trends, error: trendsError } = await supabase
        .from('donations')
        .select('amount, created_at')
        .eq('fundraiser_id', fundraiserId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (trendsError) throw trendsError;

      setAnalytics({
        ...basicAnalytics,
        recent_donations: recentDonations,
        top_donors: topDonors,
        donation_trends: trends
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
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

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Donations</CardTitle>
            <CardDescription>Total amount raised</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(analytics.total_donations)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Donors</CardTitle>
            <CardDescription>Number of unique donors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.total_donors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Donation</CardTitle>
            <CardDescription>Average amount per donation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(analytics.average_donation)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>Fundraising goal progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={analytics.completion_percentage} className="h-4" />
          <p className="text-sm text-gray-500 mt-2">
            {analytics.completion_percentage.toFixed(1)}% of goal reached
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Latest contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recent_donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{donation.profiles.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">
                    {formatCurrency(donation.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Donors</CardTitle>
            <CardDescription>Most generous contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_donors.map((donor) => (
                <div
                  key={donor.donor_id}
                  className="flex justify-between items-center"
                >
                  <p className="font-medium">{donor.profiles.full_name}</p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(donor.sum)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donation Trends</CardTitle>
          <CardDescription>Last 7 days of activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {/* Here you would typically use a charting library like Chart.js or Recharts */}
            <div className="flex items-end h-full space-x-2">
              {analytics.donation_trends.map((trend, index) => (
                <div
                  key={index}
                  className="flex-1 bg-green-100 rounded-t"
                  style={{
                    height: `${(trend.amount / Math.max(...analytics.donation_trends.map(t => t.amount))) * 100}%`
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundraiserAnalytics; 