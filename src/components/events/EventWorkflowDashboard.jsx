import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, DollarSign, Users, MessageSquare, Clock, 
  CheckCircle, Sparkles, ArrowRight, Target, TrendingUp,
  BarChart3, PieChart, Activity, AlertCircle, Star,
  PlayCircle, Settings, Eye, Download, Edit, Plus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI, eventsAPI, budgetAPI, communicationsAPI } from '@/utils/api';
import { supabase } from '@/utils/supabaseClient';

const EventWorkflowDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventAndWorkflow = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setCurrentUser(profile);
          
          // Fetch event details
          const eventResult = await eventsAPI.getEvent(eventId);
          if (eventResult.data) {
            setEvent(eventResult.data);
            
            // Generate workflow analysis if not exists
            const workflowAnalysis = await aiAPI.analyzeEventWorkflow(eventResult.data, profile.org_id);
            setWorkflow(workflowAnalysis);
          }
        }
      } catch (error) {
        console.error('Error fetching event and workflow:', error);
        toast.error('Failed to load event workflow');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventAndWorkflow();
    }
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!event || !workflow) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
        <p className="text-gray-600 mb-4">The event workflow could not be loaded.</p>
        <button
          onClick={() => navigate('/events')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const EventOverview = () => (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{event.expected_attendance || 'TBD'} expected</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>${event.estimated_budget || 0} budget</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Stella Workflow</span>
          </div>
        </div>
      </div>

      {/* Workflow Complexity Analysis */}
      {workflow.eventComplexity && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Complexity Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${
                workflow.eventComplexity.complexity === 'complex' ? 'text-red-600' :
                workflow.eventComplexity.complexity === 'moderate' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {workflow.eventComplexity.complexity.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Complexity Level</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {workflow.eventComplexity.score}/10
              </div>
              <div className="text-sm text-gray-600">Complexity Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {workflow.workflowPlan?.recommendedTimeline || '6-8 weeks'} Timeline
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-gray-900">
            {workflow.workflowPlan?.keyMilestones?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Milestones</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-gray-900">
            {workflow.workflowPlan?.volunteerNeeds?.totalVolunteers || 0}
          </div>
          <div className="text-sm text-gray-600">Volunteers Needed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-gray-900">
            {Object.keys(workflow.workflowPlan?.communicationPlan || {}).length}
          </div>
          <div className="text-sm text-gray-600">Communication Phases</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-lg font-semibold text-gray-900">
            ${workflow.workflowPlan?.budgetRecommendations?.suggestedBudget || event.estimated_budget || 0}
          </div>
          <div className="text-sm text-gray-600">Recommended Budget</div>
        </div>
      </div>
    </div>
  );

  const TimelineView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {workflow.workflowPlan?.keyMilestones ? (
        <div className="space-y-4">
          {workflow.workflowPlan.keyMilestones.map((milestone, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {milestone.week}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{milestone.milestone}</h4>
                    <p className="text-sm text-gray-600 mb-3">Week {milestone.week} milestone</p>
                    {milestone.tasks && (
                      <ul className="space-y-1">
                        {milestone.tasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No timeline generated yet</p>
        </div>
      )}
    </div>
  );

  const BudgetView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Budget Planning</h3>
        <button 
          onClick={() => navigate('/budget/create')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {workflow.workflowPlan?.budgetRecommendations ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Recommended Budget</h4>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${workflow.workflowPlan.budgetRecommendations.suggestedBudget}
            </div>
            <p className="text-sm text-gray-600">Total recommended amount</p>
          </div>

          {workflow.workflowPlan.budgetRecommendations.breakdown && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Budget Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(workflow.workflowPlan.budgetRecommendations.breakdown).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">{category}</span>
                    <span className="font-medium text-gray-900">${amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No budget recommendations generated yet</p>
        </div>
      )}
    </div>
  );

  const CommunicationsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Communication Campaign</h3>
        <button 
          onClick={() => navigate('/communications/compose')}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {workflow.workflowPlan?.communicationPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(workflow.workflowPlan.communicationPlan).map(([phase, timing]) => (
            <div key={phase} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900 capitalize">{phase.replace(/([A-Z])/g, ' $1')}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">{timing}</p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200">
                  Create Email
                </button>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200">
                  Schedule SMS
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No communication plan generated yet</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Workflow</h1>
          <p className="text-gray-600 mt-1">Comprehensive event management powered by Stella AI</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(`/events/${eventId}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            View Event
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Workflow</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <EventOverview />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'budget' && <BudgetView />}
        {activeTab === 'communications' && <CommunicationsView />}
      </div>
    </div>
  );
};

export default EventWorkflowDashboard;