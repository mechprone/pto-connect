import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, AlertCircle, CheckCircle, 
  Users, Calendar, DollarSign, MessageSquare, Target,
  ChevronDown, ChevronUp, Lightbulb, BarChart3,
  ArrowRight, Zap, Settings, Activity, Star
} from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '@/utils/api';
import { supabase } from '@/utils/supabaseClient';

const AIAssistanceToggle = ({ 
  mode = 'toggle', // 'toggle', 'dashboard', 'full'
  module = 'general', // 'events', 'budget', 'communications', 'fundraising', 'general'
  context = {},
  onRecommendationClick = () => {},
  className = ''
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stellaAnalysis, setStellaAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [quickActions, setQuickActions] = useState([]);

  useEffect(() => {
    const initializeStella = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setCurrentUser(profile);
          
          if (profile?.org_id && isEnabled) {
            await fetchStellaAnalysis(profile.org_id);
          }
        }
      } catch (error) {
        console.error('Error initializing Stella:', error);
      }
    };

    initializeStella();
  }, [isEnabled]);

  const fetchStellaAnalysis = async (orgId) => {
    setIsLoading(true);
    try {
      const analysisType = module === 'general' ? 'general' : module;
      const analysis = await aiAPI.analyzeContext(orgId, analysisType);
      setStellaAnalysis(analysis);
      generateQuickActions(analysis);
    } catch (error) {
      console.error('Error fetching Stella analysis:', error);
      toast.error('Stella encountered an issue analyzing your data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuickActions = (analysis) => {
    if (!analysis?.analysis?.recommendations) return;

    const recommendations = analysis.analysis.recommendations;
    const actions = recommendations.slice(0, 4).map(rec => ({
      id: rec.title.toLowerCase().replace(/\s+/g, '-'),
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      category: rec.category,
      estimatedTime: rec.estimatedTime,
      potentialImpact: rec.potentialImpact,
      icon: getIconForCategory(rec.category)
    }));

    setQuickActions(actions);
  };

  const getIconForCategory = (category) => {
    const iconMap = {
      events: Calendar,
      budget: DollarSign,
      communications: MessageSquare,
      fundraising: Target,
      volunteers: Users,
      general: Sparkles
    };
    return iconMap[category] || Sparkles;
  };

  const getModuleInsights = () => {
    if (!stellaAnalysis?.analysis) return null;

    const { analysis } = stellaAnalysis;

    switch (module) {
      case 'events':
        return {
          title: 'Event Planning Intelligence',
          metrics: [
            { label: 'Upcoming Events', value: analysis.upcomingEvents || 0, icon: Calendar, color: 'blue' },
            { label: 'Event Frequency', value: analysis.eventFrequency || 'moderate', icon: TrendingUp, color: 'green' },
            { label: 'Most Popular', value: analysis.mostPopularCategory || 'Fundraiser', icon: Star, color: 'purple' }
          ]
        };

      case 'budget':
        return {
          title: 'Financial Intelligence',
          metrics: [
            { label: 'Budget Health', value: analysis.budgetHealth || 'healthy', icon: DollarSign, color: 'green' },
            { label: 'Total Budget', value: `$${analysis.totalBudget?.toLocaleString() || '0'}`, icon: BarChart3, color: 'blue' },
            { label: 'Avg Event Budget', value: `$${Math.round(analysis.averageEventBudget || 0)}`, icon: Target, color: 'purple' }
          ]
        };

      case 'communications':
        return {
          title: 'Communication Intelligence',
          metrics: [
            { label: 'Recent Campaigns', value: analysis.recentCampaigns || 0, icon: MessageSquare, color: 'blue' },
            { label: 'Engagement Rate', value: analysis.engagementRate || 'N/A', icon: TrendingUp, color: 'green' },
            { label: 'Best Send Time', value: analysis.bestSendTime || 'Morning', icon: Clock, color: 'purple' }
          ]
        };

      case 'fundraising':
        return {
          title: 'Fundraising Intelligence',
          metrics: [
            { label: 'Active Campaigns', value: analysis.activeFundraisers || 0, icon: Target, color: 'green' },
            { label: 'Total Raised', value: `$${analysis.totalRaised?.toLocaleString() || '0'}`, icon: DollarSign, color: 'blue' },
            { label: 'Donor Retention', value: analysis.donorRetention || 'N/A', icon: Users, color: 'purple' }
          ]
        };

      default:
        return {
          title: 'Organization Intelligence',
          metrics: [
            { label: 'Active Members', value: analysis.keyMetrics?.totalMembers || 0, icon: Users, color: 'blue' },
            { label: 'Active Events', value: analysis.keyMetrics?.activeEvents || 0, icon: Calendar, color: 'green' },
            { label: 'Total Budget', value: `$${analysis.keyMetrics?.totalBudget?.toLocaleString() || '0'}`, icon: DollarSign, color: 'purple' }
          ]
        };
    }
  };

  const StellaToggle = () => (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        isEnabled 
          ? 'bg-purple-100 text-purple-700 border border-purple-200' 
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
      } ${className}`}
    >
      <Sparkles className="w-4 h-4" />
      <span className="font-medium">Stella Assistant</span>
      {isEnabled && stellaAnalysis && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </button>
  );

  const StellaInsightsPanel = () => {
    if (!isEnabled || !stellaAnalysis) return null;

    const insights = getModuleInsights();

  return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">
              {insights?.title || 'Stella\'s Insights'}
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-700"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
      </div>
      
        {/* Metrics Overview */}
        {insights?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {insights.metrics.map((metric, index) => {
              const Icon = metric.icon;
          return (
                <div key={index} className="bg-white rounded-lg p-4 text-center">
                  <Icon className={`w-6 h-6 text-${metric.color}-600 mx-auto mb-2`} />
                  <div className={`text-lg font-bold text-${metric.color}-600`}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              );
            })}
                </div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-purple-800 mb-3">🚀 Recommended Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickActions.slice(0, isExpanded ? 4 : 2).map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onRecommendationClick(action)}
                    className="flex items-start space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      action.priority === 'high' ? 'bg-red-500' : 
                      action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{action.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                      {action.estimatedTime && (
                        <div className="text-xs text-purple-600 mt-1">
                          ⏱️ {action.estimatedTime}
              </div>
              )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          );
        })}
      </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Organization Health Score */}
            {stellaAnalysis.analysis.organizationHealth && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">📊 Organization Health</h4>
          <div className="space-y-2">
                  {Object.entries(stellaAnalysis.analysis.organizationHealth).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`text-sm font-medium ${
                        value === 'high' || value === 'excellent' ? 'text-green-600' :
                        value === 'moderate' || value === 'good' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {value?.toString().toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Start Actions */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">⚡ Quick Start</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center space-x-2 p-2 text-left bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Create Event</span>
                </button>
                <button className="flex items-center space-x-2 p-2 text-left bg-green-50 rounded hover:bg-green-100 transition-colors">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Budget Plan</span>
                </button>
                <button className="flex items-center space-x-2 p-2 text-left bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700">Send Message</span>
                </button>
                <button className="flex items-center space-x-2 p-2 text-left bg-orange-50 rounded hover:bg-orange-100 transition-colors">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700">Start Fundraiser</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-purple-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-sm">Stella is analyzing your data...</span>
        </div>
      )}
    </div>
  );
  };

  const StellaFullDashboard = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Stella AI Assistant</h2>
            <p className="text-gray-600">Your intelligent PTO planning partner</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <StellaInsightsPanel />
      </div>
    </div>
  );

  // Render based on mode
  switch (mode) {
    case 'full':
      return <StellaFullDashboard />;
    
    case 'dashboard':
      return (
        <div>
          <StellaToggle />
          <StellaInsightsPanel />
        </div>
      );
    
    case 'toggle':
    default:
      return <StellaToggle />;
  }
};

export default AIAssistanceToggle;