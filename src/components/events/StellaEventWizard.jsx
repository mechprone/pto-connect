import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Calendar, DollarSign, Users, MessageSquare, 
  CheckCircle, Clock, TrendingUp, Target, Zap, ArrowRight,
  Settings, Eye, Download, Plus, AlertCircle, Activity,
  PlayCircle, BarChart3, Edit
} from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '@/utils/api';
import { supabase } from '@/utils/supabaseClient';

const StellaEventWizard = () => {
  const navigate = useNavigate();
  
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowMode, setWorkflowMode] = useState('assisted');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);

  // Form data
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_date: '',
    expected_attendance: 100,
    estimated_budget: 2000,
    category: 'Celebration'
  });

  const [stellaContext, setStellaContext] = useState({
    eventType: 'School Event',
    primaryGoal: 'Community Building',
    targetAudience: 'Families',
    additionalGoals: [],
    availableResources: [],
    constraints: [],
    specialConsiderations: '',
    pastEventExperiences: 'This is our first event'
  });

  const [moduleIntegrations, setModuleIntegrations] = useState({
    createBudget: true,
    generateTimeline: true,
    setupCommunications: true,
    createVolunteerRoles: true,
    planMaterials: true,
    scheduleReminders: true,
    trackProgress: true,
    generateReports: true
  });

  // Initialize user context
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
        }
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    };

    fetchUserContext();
  }, []);

  // Event type options
  const eventTypes = [
    'Fall Festival', 'Spring Carnival', 'Book Fair', 'Science Night',
    'Art Show', 'Talent Show', 'Movie Night', 'Game Night',
    'Teacher Appreciation', 'Volunteer Recognition', 'Board Meeting',
    'Fundraiser', 'Auction', 'Walk-a-thon', 'Bake Sale'
  ];

  const primaryGoals = [
    'Community Building', 'Fundraising', 'Educational Enhancement',
    'Volunteer Appreciation', 'Student Recognition', 'Family Engagement',
    'School Support', 'Cultural Celebration'
  ];

  const targetAudiences = [
    'All Families', 'Parents Only', 'Students & Families', 'Community Members',
    'Teachers & Staff', 'Volunteers', 'Board Members', 'Local Businesses'
  ];

  const additionalGoalOptions = [
    'Raise funds for specific programs', 'Showcase student work',
    'Build community relationships', 'Recruit new volunteers',
    'Celebrate achievements', 'Educate about school programs',
    'Support teachers and staff', 'Create lasting memories'
  ];

  const availableResourceOptions = [
    'Dedicated parent volunteers', 'School facilities access',
    'Local business partnerships', 'Previous event materials',
    'Social media presence', 'Email communication list',
    'Equipment and supplies', 'Budget for materials'
  ];

  const constraintOptions = [
    'Limited budget', 'Time constraints', 'Venue limitations',
    'Weather dependent', 'Need school approval', 'Limited volunteers',
    'Scheduling conflicts', 'Safety requirements'
  ];

  // Generate comprehensive workflow
  const generateWorkflow = async () => {
    if (!eventData.title.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    if (!currentUser?.org_id) {
      toast.error('Organization context required');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep('Initializing Stella AI...');

    try {
      // Simulate progress updates
      const progressSteps = [
        { step: 'Analyzing your event concept...', progress: 15 },
        { step: 'Researching best practices...', progress: 30 },
        { step: 'Creating project timeline...', progress: 45 },
        { step: 'Generating budget recommendations...', progress: 60 },
        { step: 'Planning communication strategy...', progress: 75 },
        { step: 'Organizing volunteer roles...', progress: 90 },
        { step: 'Finalizing your workflow...', progress: 100 }
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        setGenerationStep(progressSteps[i].step);
        setGenerationProgress(progressSteps[i].progress);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Call the actual API
      const result = await aiAPI.generateComprehensiveWorkflow(
        eventData,
        stellaContext,
        moduleIntegrations
      );

      if (result.error) {
        throw new Error(result.error);
      }

      setGeneratedWorkflow(result.data);
      toast.success('🌟 Stella has created your comprehensive event workflow!');
      setCurrentStep(4);

    } catch (error) {
      console.error('Workflow generation error:', error);
      toast.error('Stella encountered an issue. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStep('');
    }
  };

  // Step 1: Event Details
  const EventDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Stella About Your Event</h2>
        <p className="text-gray-600">Provide basic information about the event you want to create</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => setEventData({...eventData, title: e.target.value})}
            placeholder="e.g., Fall Festival 2025"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
          <input
            type="date"
            value={eventData.event_date}
            onChange={(e) => setEventData({...eventData, event_date: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendance</label>
          <input
            type="number"
            value={eventData.expected_attendance}
            onChange={(e) => setEventData({...eventData, expected_attendance: parseInt(e.target.value)})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget</label>
          <input
            type="number"
            value={eventData.estimated_budget}
            onChange={(e) => setEventData({...eventData, estimated_budget: parseInt(e.target.value)})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={eventData.description}
          onChange={(e) => setEventData({...eventData, description: e.target.value})}
          rows="3"
          placeholder="Brief description of your event..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  // Step 2: Context & Goals
  const ContextStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Help Stella Understand Your Goals</h2>
        <p className="text-gray-600">This information helps Stella create the perfect workflow for your event</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
          <select
            value={stellaContext.eventType}
            onChange={(e) => setStellaContext({...stellaContext, eventType: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
          <select
            value={stellaContext.primaryGoal}
            onChange={(e) => setStellaContext({...stellaContext, primaryGoal: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {primaryGoals.map(goal => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
          <select
            value={stellaContext.targetAudience}
            onChange={(e) => setStellaContext({...stellaContext, targetAudience: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {targetAudiences.map(audience => (
              <option key={audience} value={audience}>{audience}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Goals</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {additionalGoalOptions.map(goal => (
              <label key={goal} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={stellaContext.additionalGoals.includes(goal)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStellaContext({
                        ...stellaContext,
                        additionalGoals: [...stellaContext.additionalGoals, goal]
                      });
                    } else {
                      setStellaContext({
                        ...stellaContext,
                        additionalGoals: stellaContext.additionalGoals.filter(g => g !== goal)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Resources</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableResourceOptions.map(resource => (
              <label key={resource} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={stellaContext.availableResources.includes(resource)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStellaContext({
                        ...stellaContext,
                        availableResources: [...stellaContext.availableResources, resource]
                      });
                    } else {
                      setStellaContext({
                        ...stellaContext,
                        availableResources: stellaContext.availableResources.filter(r => r !== resource)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{resource}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Constraints</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {constraintOptions.map(constraint => (
              <label key={constraint} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={stellaContext.constraints.includes(constraint)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStellaContext({
                        ...stellaContext,
                        constraints: [...stellaContext.constraints, constraint]
                      });
                    } else {
                      setStellaContext({
                        ...stellaContext,
                        constraints: stellaContext.constraints.filter(c => c !== constraint)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{constraint}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Past Event Experience</label>
        <textarea
          value={stellaContext.pastEventExperiences}
          onChange={(e) => setStellaContext({...stellaContext, pastEventExperiences: e.target.value})}
          rows="3"
          placeholder="Tell Stella about similar events you've organized before..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  // Step 3: Module Selection
  const ModuleSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Workflow Components</h2>
        <p className="text-gray-600">Select which modules Stella should include in your comprehensive workflow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'createBudget', title: 'Budget Planning', icon: DollarSign, desc: 'Automated budget creation with line items' },
          { key: 'generateTimeline', title: 'Project Timeline', icon: Calendar, desc: 'Milestone-based project management' },
          { key: 'setupCommunications', title: 'Communications', icon: MessageSquare, desc: 'Multi-channel communication campaigns' },
          { key: 'createVolunteerRoles', title: 'Volunteer Roles', icon: Users, desc: 'Volunteer coordination and assignments' },
          { key: 'planMaterials', title: 'Materials Planning', icon: Target, desc: 'Equipment and supply management' },
          { key: 'scheduleReminders', title: 'Reminders', icon: Clock, desc: 'Automated reminder sequences' },
          { key: 'trackProgress', title: 'Progress Tracking', icon: TrendingUp, desc: 'Real-time progress monitoring' },
          { key: 'generateReports', title: 'Reporting', icon: BarChart3, desc: 'Comprehensive event analytics' }
        ].map(module => {
          const Icon = module.icon;
          return (
            <div key={module.key} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              moduleIntegrations[module.key] 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setModuleIntegrations({
              ...moduleIntegrations,
              [module.key]: !moduleIntegrations[module.key]
            })}>
              <div className="flex items-center space-x-3">
                <Icon className={`w-6 h-6 ${
                  moduleIntegrations[module.key] ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900">{module.title}</h4>
                  <p className="text-sm text-gray-600">{module.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Step 4: Workflow Results
  const WorkflowResultsStep = () => {
    if (!generatedWorkflow) return null;

    const workflow = generatedWorkflow.workflow;
    const selectedModules = Object.entries(moduleIntegrations)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Your Comprehensive Workflow is Ready!</h2>
          </div>
          <p className="text-gray-600">
            Stella has created a complete workflow with {workflow.components_created?.length || 0} integrated modules
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Workflow Created Successfully!</h3>
              <p className="text-green-700 mt-1">{workflow.message}</p>
            </div>
          </div>
        </div>

        {/* Workflow Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Workflow Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">{workflow.event_title}</div>
              <div className="text-sm text-gray-600">Event Created</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">{workflow.components_created?.length || 0}</div>
              <div className="text-sm text-gray-600">Modules Integrated</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">Active</div>
              <div className="text-sm text-gray-600">Workflow Status</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-orange-600">{selectedModules.length}</div>
              <div className="text-sm text-gray-600">Selected Modules</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Next Steps</h3>
          <div className="space-y-3">
            {workflow.next_steps?.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 text-sm font-medium px-2 py-1 rounded">
                  {index + 1}
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span>View Event Details</span>
          </button>
          <button
            onClick={() => navigate('/budget')}
            className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span>Review Budget</span>
          </button>
          <button
            onClick={() => navigate('/communications')}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Start Communications</span>
          </button>
        </div>
      </div>
    );
  };

  // Generation Progress
  const GenerationProgress = () => {
    if (!isGenerating) return null;

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <h2 className="text-2xl font-bold text-purple-900">Stella is Creating Your Workflow</h2>
          </div>
          <p className="text-gray-600">This may take a few moments as Stella analyzes your requirements</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{generationStep}</span>
              <span>{generationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 text-center">
            Stella is analyzing your organization's context, past events, and best practices to create 
            the perfect comprehensive workflow for your event.
          </div>
        </div>
      </div>
    );
  };

  // Navigation buttons
  const NavigationButtons = () => (
    <div className="flex justify-between pt-6">
      <button
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1 || isGenerating}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {currentStep < 3 ? (
        <button
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={isGenerating}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      ) : currentStep === 3 ? (
        <button
          onClick={generateWorkflow}
          disabled={isGenerating || !eventData.title.trim()}
          className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate Workflow</span>
          {!isGenerating && <ArrowRight className="w-5 h-5" />}
        </button>
      ) : (
        <button
          onClick={() => navigate('/events')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          View Events
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Stella Event Workflow Wizard</h1>
          </div>
          <p className="text-lg text-gray-600">
            Let Stella create a comprehensive workflow for your event with integrated project management, 
            budgeting, communications, and volunteer coordination.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            {[
              'Event Details',
              'Context & Goals', 
              'Module Selection',
              'Workflow Results'
            ].map((label, index) => (
              <div key={index} className={`text-sm ${
                currentStep >= index + 1 ? 'text-purple-600 font-medium' : 'text-gray-500'
              }`}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {isGenerating ? (
            <GenerationProgress />
          ) : (
            <>
              {currentStep === 1 && <EventDetailsStep />}
              {currentStep === 2 && <ContextStep />}
              {currentStep === 3 && <ModuleSelectionStep />}
              {currentStep === 4 && <WorkflowResultsStep />}
            </>
          )}
          
          {!isGenerating && <NavigationButtons />}
        </div>
      </div>
    </div>
  );
};

export default StellaEventWizard; 