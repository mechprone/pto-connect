import { useEffect, useState } from 'react';
import { useUserProfile } from '@/modules/hooks/useUserProfile';
import { supabase } from '@/utils/supabaseClient';
import { Calendar, Users, DollarSign, MessageSquare, FileText, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { profile, organization } = useUserProfile();
  const [dashboardData, setDashboardData] = useState({
    upcomingEvents: 0,
    pendingApprovals: 0,
    budgetTotal: 0,
    activeFundraisers: 0,
    recentMessages: 0,
    teacherRequests: 0,
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile?.org_id) return;

      try {
        // Fetch upcoming events
        const { data: events } = await supabase
          .from('events')
          .select('id')
          .eq('org_id', profile.org_id)
          .eq('status', 'published')
          .gte('start_time', new Date().toISOString())
          .limit(10);

        // Fetch pending teacher requests
        const { data: teacherRequests } = await supabase
          .from('teacher_requests')
          .select('id')
          .eq('org_id', profile.org_id)
          .eq('status', 'pending');

        // Fetch budget total (income - expenses)
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('org_id', profile.org_id);

        const budgetTotal = transactions?.reduce((total, transaction) => {
          return transaction.type === 'income' 
            ? total + parseFloat(transaction.amount)
            : total - parseFloat(transaction.amount);
        }, 0) || 0;

        // Fetch active fundraisers
        const { data: fundraisers } = await supabase
          .from('fundraisers')
          .select('id')
          .eq('org_id', profile.org_id)
          .eq('is_active', true);

        // Fetch recent messages
        const { data: messages } = await supabase
          .from('messages')
          .select('id')
          .eq('org_id', profile.org_id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        setDashboardData({
          upcomingEvents: events?.length || 0,
          pendingApprovals: teacherRequests?.length || 0,
          budgetTotal: budgetTotal,
          activeFundraisers: fundraisers?.length || 0,
          recentMessages: messages?.length || 0,
          teacherRequests: teacherRequests?.length || 0,
          loading: false
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, [profile?.org_id]);

  if (dashboardData.loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'Admin'}
        </h1>
        <p className="text-gray-600 mt-2">
          {organization?.name} Dashboard
        </p>
      </div>

      {/* Subscription Status Alert */}
      {organization?.subscription_status === 'trial' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">
              Trial period active. 
              {organization.trial_ends_at && (
                <span className="ml-1">
                  Expires {new Date(organization.trial_ends_at).toLocaleDateString()}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Upcoming Events" 
          value={dashboardData.upcomingEvents}
          icon={Calendar}
          color="blue"
          link="/events"
        />
        
        <DashboardCard 
          title="Pending Approvals" 
          value={dashboardData.pendingApprovals}
          icon={AlertCircle}
          color="yellow"
          link="/teacher-requests"
        />
        
        <DashboardCard 
          title="Budget Balance" 
          value={`$${dashboardData.budgetTotal.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          link="/budget"
        />
        
        <DashboardCard 
          title="Active Fundraisers" 
          value={dashboardData.activeFundraisers}
          icon={Users}
          color="purple"
          link="/fundraisers"
        />
        
        <DashboardCard 
          title="Recent Messages" 
          value={dashboardData.recentMessages}
          icon={MessageSquare}
          color="indigo"
          link="/communications"
        />
        
        <DashboardCard 
          title="Teacher Requests" 
          value={dashboardData.teacherRequests}
          icon={FileText}
          color="red"
          link="/teacher-requests"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton 
            title="Create Event"
            description="Plan a new PTO event"
            link="/events/create"
            color="blue"
          />
          <QuickActionButton 
            title="Send Message"
            description="Communicate with members"
            link="/communications/create"
            color="green"
          />
          <QuickActionButton 
            title="Add Budget Entry"
            description="Record income or expense"
            link="/budget/create"
            color="yellow"
          />
          <QuickActionButton 
            title="Start Fundraiser"
            description="Launch new campaign"
            link="/fundraisers/create"
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon: Icon, color, link }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  };

  return (
    <div className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${link ? 'cursor-pointer' : ''}`}
         onClick={() => link && (window.location.href = link)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ title, description, link, color }) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <button
      onClick={() => window.location.href = link}
      className={`${colorClasses[color]} text-white p-4 rounded-lg text-left transition-colors`}
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm opacity-90 mt-1">{description}</p>
    </button>
  );
}
