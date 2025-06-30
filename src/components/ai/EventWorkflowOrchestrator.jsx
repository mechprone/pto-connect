import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Calendar, DollarSign, Users, MessageSquare, 
  CheckCircle, Clock, TrendingUp, Target, Zap, ArrowRight,
  BarChart3, PieChart, Activity, AlertCircle, Star,
  PlayCircle, Settings, Eye, Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '@/utils/api';
import { supabase } from '@/utils/supabaseClient';

const EventWorkflowOrchestrator = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [orgContext, setOrgContext] = useState(null);
  const [stellaAnalysis, setStellaAnalysis] = useState(null);
  const [workflowGeneration, setWorkflowGeneration] = useState({
    isGenerating: false,
    currentStep: '',
    progress: 0
  });
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [eventIdea, setEventIdea] = useState('');
  const [workflowMode, setWorkflowMode] = useState('assisted'); // manual, assisted, automated

  // Get current user and org context
  useEffect(() => {
    const fetchUserContext = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setCurrentUser(profile);
          
          if (profile?.org_id) {
            const analysis = await aiAPI.analyzeContext(profile.org_id, 'general');
            setStellaAnalysis(analysis);
            setOrgContext(analysis.context);
          }
        }
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    };

    fetchUserContext();
  }, []);

  const generateCompleteWorkflow = async () => {
    if (!eventIdea.trim()) {
      toast.error('Please enter an event idea first');
      return;
    }

    if (!currentUser?.org_id) {
      toast.error('Organization context required');
      return;
    }

    setWorkflowGeneration({ isGenerating: true, currentStep: 'Initializing Stella...', progress: 10 });

    try {
      // Step 1: Generate event details
      setWorkflowGeneration({ isGenerating: true, currentStep: 'Stella is analyzing your event idea...', progress: 25 });
      await new Promise(resolve => setTimeout(resolve, 1500));

      const eventData = {
        title: eventIdea,
        category: 'Event',
        estimated_budget: 2000,
        expected_attendance: 100,
        description: `${eventIdea} for our school community`
      };

      // Step 2: Analyze workflow complexity
      setWorkflowGeneration({ isGenerating: true, currentStep: 'Calculating event complexity and requirements...', progress: 50 });
      
      const workflowAnalysis = await aiAPI.analyzeEventWorkflow(eventData, currentUser.org_id);
      
      // Step 3: Generate comprehensive workflow
      setWorkflowGeneration({ isGenerating: true, currentStep: 'Creating your complete event workflow...', progress: 75 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Generate AI recommendations
      setWorkflowGeneration({ isGenerating: true, currentStep: 'Adding Stella\'s intelligent recommendations...', progress: 90 });
      
      const recommendations = await aiAPI.generateContent(
        'content', 
        `Event planning recommendations for ${eventIdea}`, 
        { orgId: currentUser.org_id, mode: 'recommendations' },
        true
      );

      setWorkflowGeneration({ isGenerating: true, currentStep: 'Finalizing your workflow...', progress: 100 });
      await new Promise(resolve => setTimeout(resolve, 1000));

      const completeWorkflow = {
        event: eventData,
        complexity: workflowAnalysis.eventComplexity,
        workflow: workflowAnalysis.workflowPlan,
        recommendations: recommendations.recommendations || [],
        orgInsights: workflowAnalysis.orgContext,
        createdAt: new Date().toISOString(),
        createdBy: 'Stella AI Assistant'
      };

      setGeneratedWorkflow(completeWorkflow);
      setWorkflowGeneration({ isGenerating: false, currentStep: '', progress: 0 });
      
      toast.success('✨ Stella has created your complete event workflow!');

    } catch (error) {
      console.error('Workflow generation error:', error);
      toast.error('Stella encountered an issue creating your workflow. Please try again.');
      setWorkflowGeneration({ isGenerating: false, currentStep: '', progress: 0 });
    }
  };

  const WorkflowModeSelector = () => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Workflow Experience</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            mode: 'manual',
            title: 'Manual Control',
            description: 'I prefer to plan everything myself',
            icon: Settings,
            color: 'gray'
          },
          {
            mode: 'assisted',
            title: 'Stella Assisted',
            description: 'I want Stella\'s help with suggestions',
            icon: Sparkles,
            color: 'purple'
          },
          {
            mode: 'automated',
            title: 'Fully Automated',
            description: 'Let Stella create the complete workflow',
            icon: Zap,
            color: 'blue'
          }
        ].map((option) => {
          const Icon = option.icon;
          const isSelected = workflowMode === option.mode;
          
          return (
            <button
              key={option.mode}
              onClick={() => setWorkflowMode(option.mode)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? `border-${option.color}-500 bg-${option.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                isSelected ? `text-${option.color}-600` : 'text-gray-400'
              }`} />
              <h4 className="font-medium text-gray-900 mb-1">{option.title}</h4>
              <p className="text-sm text-gray-600">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const StellaInsights = () => {
    if (!stellaAnalysis) return null;

    const { analysis } = stellaAnalysis;
    const health = analysis.organizationHealth;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Stella's Organization Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{analysis.keyMetrics.totalMembers}</div>
            <div className="text-sm text-gray-600">Active Members</div>
            <div className={`text-xs mt-1 ${
              health.memberEngagement === 'high' ? 'text-green-600' : 
              health.memberEngagement === 'moderate' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {health.memberEngagement.toUpperCase()} Engagement
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{analysis.keyMetrics.activeEvents}</div>
            <div className="text-sm text-gray-600">Active Events</div>
            <div className={`text-xs mt-1 ${
              health.eventActivity === 'high' ? 'text-green-600' : 
              health.eventActivity === 'moderate' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {health.eventActivity.toUpperCase()} Activity
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">${analysis.keyMetrics.totalBudget.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Budget</div>
            <div className={`text-xs mt-1 ${
              health.financialHealth === 'excellent' ? 'text-green-600' : 
              health.financialHealth === 'good' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {health.financialHealth.toUpperCase()}
            </div>
          </div>
        </div>

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🌟 Stella's Top Recommendations</h4>
            <div className="space-y-2">
              {analysis.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-500' : 
                    rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{rec.title}</div>
                    <div className="text-xs text-gray-600">{rec.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const WorkflowProgress = () => {
    if (!workflowGeneration.isGenerating) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <h3 className="text-lg font-semibold text-purple-900">Stella is Working on Your Workflow</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{workflowGeneration.currentStep}</span>
            <span>{workflowGeneration.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${workflowGeneration.progress}%` }}
            />
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Stella is analyzing your organization's context, past events, and best practices to create 
          the perfect workflow for your event.
        </div>
      </div>
    );
  };

  const GeneratedWorkflowDisplay = () => {
    if (!generatedWorkflow) return null;

    const { event, complexity, workflow, recommendations, orgInsights } = generatedWorkflow;

    return (
      <div className="space-y-6">
        {/* Event Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
            <div className={`px-3 py-1 rounded-full text-sm ${
              complexity.complexity === 'complex' ? 'bg-red-100 text-red-800' :
              complexity.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {complexity.complexity.toUpperCase()} Event
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-medium">Timeline</div>
              <div className="text-xs text-gray-600">{workflow?.recommendedTimeline || '6-8 weeks'}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-medium">Budget</div>
              <div className="text-xs text-gray-600">${workflow?.budgetRecommendations?.suggestedBudget || event.estimated_budget}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-medium">Volunteers</div>
              <div className="text-xs text-gray-600">{workflow?.volunteerNeeds?.totalVolunteers || 8}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <div className="text-sm font-medium">Complexity</div>
              <div className="text-xs text-gray-600">Score: {complexity.score}/10</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🚀 Next Steps</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/events/create')}
              className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>Create Event</span>
            </button>
            <button
              onClick={() => navigate('/budget')}
              className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              <span>Setup Budget</span>
            </button>
            <button
              onClick={() => navigate('/communications/compose?ai=auto')}
              className="flex items-center justify-center space-x-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Start Communications</span>
            </button>
            <button
              onClick={() => toast.info('Project management coming in Phase 2!')}
              className="flex items-center justify-center space-x-2 p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Target className="w-5 h-5" />
              <span>Manage Tasks</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Meet Stella - Your AI Event Assistant</h1>
          </div>
          <p className="text-lg text-gray-600">
            Hi! I'm Stella, your PTO planning assistant. I can generate complete event workflows with integrated 
            project management, budgeting, communications, and volunteer coordination - or help with just the parts you need!
          </p>
        </div>

        {/* Stella's Insights */}
        <StellaInsights />

        {/* Workflow Mode Selection */}
        <WorkflowModeSelector />

        {/* Workflow Progress */}
        <WorkflowProgress />

        {/* Generated Workflow Display */}
        {generatedWorkflow ? (
          <GeneratedWorkflowDisplay />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Let Stella Create Your Event Workflow</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What type of event would you like Stella to help you create?
              </label>
              <input
                type="text"
                value={eventIdea}
                onChange={(e) => setEventIdea(e.target.value)}
                placeholder="e.g., Fall Festival, Book Fair, Science Night, Teacher Appreciation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={generateCompleteWorkflow}
                disabled={!eventIdea.trim() || workflowGeneration.isGenerating}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Sparkles className="w-6 h-6" />
                <span className="text-lg font-medium">
                  {workflowGeneration.isGenerating ? 'Stella is Working...' : 'Generate Complete Workflow'}
                </span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            {workflowMode === 'automated' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Fully Automated Mode</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Stella will create a complete workflow with project timeline, budget planning, 
                      communication campaigns, and volunteer coordination. You can review and adjust everything.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventWorkflowOrchestrator; 