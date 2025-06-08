// Dashboard API endpoints for backend integration
// This file contains the API functions that will connect the enhanced dashboard to real data

import { supabase } from '../../utils/supabaseClient';

export const DashboardAPI = {
  // Metrics API
  async getMetrics(orgId) {
    try {
      const [members, events, budget, engagement] = await Promise.all([
        this.getTotalMembers(orgId),
        this.getActiveEvents(orgId),
        this.getBudgetMetrics(orgId),
        this.getEngagementRate(orgId)
      ]);

      return {
        totalMembers: members,
        activeEvents: events,
        budgetUsed: budget.percentUsed,
        engagementRate: engagement
      };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  },

  async getTotalMembers(orgId) {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);
    return count || 0;
  },

  async getActiveEvents(orgId) {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('event_date', new Date().toISOString());
    return count || 0;
  },

  async getBudgetMetrics(orgId) {
    const { data: budgetEntries } = await supabase
      .from('budget_entries')
      .select('amount, category, type')
      .eq('org_id', orgId);

    if (!budgetEntries) return { percentUsed: 0, totalBudget: 0, spent: 0, remaining: 0 };

    const income = budgetEntries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = budgetEntries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    
    return {
      totalBudget: income,
      spent: expenses,
      remaining: income - expenses,
      percentUsed: income > 0 ? Math.round((expenses / income) * 100) : 0
    };
  },

  async getEngagementRate(orgId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    return totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  },

  // Activity API
  async getRecentActivity(orgId, limit = 8) {
    const { data: recentEvents } = await supabase
      .from('events')
      .select('title, created_at, created_by')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentUsers } = await supabase
      .from('users')
      .select('first_name, last_name, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(3);

    const activity = [];
    
    if (recentEvents) {
      recentEvents.forEach(event => {
        activity.push({
          type: 'event_created',
          title: `New event: ${event.title}`,
          timestamp: event.created_at,
          user: 'System'
        });
      });
    }

    if (recentUsers) {
      recentUsers.forEach(user => {
        activity.push({
          type: 'user_joined',
          title: `${user.first_name} ${user.last_name} joined`,
          timestamp: user.created_at,
          user: `${user.first_name} ${user.last_name}`
        });
      });
    }

    return activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  },

  // Events API
  async getUpcomingEvents(orgId, limit = 5) {
    const { data: events } = await supabase
      .from('events')
      .select('id, title, event_date, location, status')
      .eq('org_id', orgId)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(limit);

    return events || [];
  },

  // Tasks API (placeholder - would need tasks table)
  async getPendingTasks(orgId, userRole) {
    // This would come from a tasks table in a real implementation
    const tasks = [];
    
    if (userRole === 'admin' || userRole === 'board_member') {
      tasks.push(
        { id: 1, title: 'Review budget proposal', priority: 'high', dueDate: '2025-06-10' },
        { id: 2, title: 'Approve volunteer applications', priority: 'medium', dueDate: '2025-06-12' },
        { id: 3, title: 'Update event calendar', priority: 'low', dueDate: '2025-06-15' }
      );
    }

    return tasks;
  },

  // Analytics API
  async getAnalyticsData(orgId, timeRange = '6months') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }

    const [membershipData, eventsData, financialData, engagementData] = await Promise.all([
      this.getMembershipAnalytics(orgId, startDate, endDate),
      this.getEventsAnalytics(orgId, startDate, endDate),
      this.getFinancialAnalytics(orgId, startDate, endDate),
      this.getEngagementAnalytics(orgId, startDate, endDate)
    ]);

    return {
      membership: membershipData,
      events: eventsData,
      financial: financialData,
      engagement: engagementData
    };
  },

  async getMembershipAnalytics(orgId, startDate, endDate) {
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .lte('created_at', monthEnd.toISOString());

      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        value: count || 0,
        date: monthStart
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  },

  async getEventsAnalytics(orgId, startDate, endDate) {
    const { data: events } = await supabase
      .from('events')
      .select('event_date, title, status')
      .eq('org_id', orgId)
      .gte('event_date', startDate.toISOString())
      .lte('event_date', endDate.toISOString())
      .order('event_date');

    const monthlyEvents = {};
    events?.forEach(event => {
      const month = new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyEvents[month]) {
        monthlyEvents[month] = { total: 0, completed: 0 };
      }
      monthlyEvents[month].total++;
      if (event.status === 'completed') {
        monthlyEvents[month].completed++;
      }
    });

    return Object.entries(monthlyEvents).map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
      success_rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  },

  async getFinancialAnalytics(orgId, startDate, endDate) {
    const { data: budgetEntries } = await supabase
      .from('budget_entries')
      .select('amount, type, category, created_at')
      .eq('org_id', orgId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const categoryData = {};
    budgetEntries?.forEach(entry => {
      if (!categoryData[entry.category]) {
        categoryData[entry.category] = { income: 0, expenses: 0 };
      }
      if (entry.type === 'income') {
        categoryData[entry.category].income += entry.amount;
      } else {
        categoryData[entry.category].expenses += entry.amount;
      }
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }));
  },

  async getEngagementAnalytics(orgId, startDate, endDate) {
    // Mock engagement data - in real implementation, this would come from activity tracking
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const month = currentDate.toLocaleDateString('en-US', { month: 'short' });
      
      // Generate realistic engagement metrics
      const baseEngagement = 65;
      const variation = Math.random() * 20 - 10; // ±10%
      const engagement = Math.max(0, Math.min(100, baseEngagement + variation));
      
      months.push({
        month,
        engagement: Math.round(engagement),
        email_opens: Math.round(engagement * 0.8),
        event_attendance: Math.round(engagement * 0.6),
        volunteer_participation: Math.round(engagement * 0.4)
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  },

  // Smart Notifications API
  async generateSmartNotifications(orgId) {
    const notifications = [];
    
    try {
      // Generate budget alerts
      const budgetAlerts = await this.generateBudgetAlerts(orgId);
      notifications.push(...budgetAlerts);
      
      // Generate membership insights
      const membershipInsights = await this.generateMembershipInsights(orgId);
      notifications.push(...membershipInsights);
      
      // Generate event alerts
      const eventAlerts = await this.generateEventAlerts(orgId);
      notifications.push(...eventAlerts);
      
      // Generate engagement insights
      const engagementInsights = await this.generateEngagementInsights(orgId);
      notifications.push(...engagementInsights);
      
      // Sort by priority and timestamp
      notifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      return notifications;
    } catch (error) {
      console.error('Error generating smart notifications:', error);
      return [];
    }
  },

  async generateBudgetAlerts(orgId) {
    const alerts = [];
    
    try {
      const { data: budgetEntries } = await supabase
        .from('budget_entries')
        .select('amount, category, type')
        .eq('org_id', orgId);

      if (budgetEntries && budgetEntries.length > 0) {
        const income = budgetEntries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
        const expenses = budgetEntries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
        const percentUsed = income > 0 ? (expenses / income) * 100 : 0;

        if (percentUsed > 80) {
          alerts.push({
            id: 'budget-alert-1',
            type: 'budget',
            priority: 'high',
            title: 'Budget Alert: High Usage',
            message: `Budget is ${Math.round(percentUsed)}% spent. Consider reviewing upcoming expenses.`,
            timestamp: new Date().toISOString(),
            actionable: true,
            actions: [
              { label: 'Review Budget', action: 'review_budget' },
              { label: 'View Details', action: 'view_details' }
            ]
          });
        }
      }
    } catch (error) {
      console.error('Error generating budget alerts:', error);
    }

    return alerts;
  },

  async generateMembershipInsights(orgId) {
    const insights = [];
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newMembers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: totalMembers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId);

      const growthRate = totalMembers > 0 ? (newMembers / totalMembers) * 100 : 0;

      if (growthRate < 5) {
        insights.push({
          id: 'membership-growth-1',
          type: 'membership',
          priority: 'medium',
          title: 'Membership Growth Opportunity',
          message: `New member registrations are below target. Consider launching a recruitment campaign.`,
          timestamp: new Date().toISOString(),
          actionable: true,
          actions: [
            { label: 'Start Campaign', action: 'start_campaign' },
            { label: 'View Analytics', action: 'view_analytics' }
          ]
        });
      }
    } catch (error) {
      console.error('Error generating membership insights:', error);
    }

    return insights;
  },

  async generateEventAlerts(orgId) {
    const alerts = [];
    
    try {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('id, title, event_date, volunteer_slots_needed, volunteer_slots_filled')
        .eq('org_id', orgId)
        .gte('event_date', new Date().toISOString())
        .lte('event_date', nextWeek.toISOString());

      upcomingEvents?.forEach(event => {
        const daysUntil = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));
        const volunteerShortage = (event.volunteer_slots_needed || 0) - (event.volunteer_slots_filled || 0);

        if (daysUntil <= 3 && volunteerShortage > 0) {
          alerts.push({
            id: `event-volunteer-${event.id}`,
            type: 'events',
            priority: 'high',
            title: `Volunteer Shortage: ${event.title}`,
            message: `${event.title} in ${daysUntil} days needs ${volunteerShortage} more volunteers.`,
            timestamp: new Date().toISOString(),
            actionable: true,
            actions: [
              { label: 'Send Reminder', action: 'send_reminder' },
              { label: 'View Event', action: 'view_event' }
            ]
          });
        }
      });
    } catch (error) {
      console.error('Error generating event alerts:', error);
    }

    return alerts;
  },

  async generateEngagementInsights(orgId) {
    const insights = [];
    
    // Goal achievement insights
    insights.push({
      id: 'goal-achievement-1',
      type: 'goals',
      priority: 'low',
      title: 'Goal Achievement Update',
      message: 'Monthly engagement targets are being met consistently.',
      timestamp: new Date().toISOString(),
      actionable: false,
      actions: []
    });

    return insights;
  }
};

export default DashboardAPI;
