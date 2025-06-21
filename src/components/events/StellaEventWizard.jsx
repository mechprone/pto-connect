import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Calendar, DollarSign, Users, MessageSquare, 
  CheckCircle, Clock, TrendingUp, Target, Zap, ArrowRight,
  Settings, Eye, Download, Plus, AlertCircle, Activity,
  PlayCircle, BarChart3, Edit, RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '@/utils/api';
import { supabase } from '@/utils/supabaseClient';

// Event Details Step Component - moved outside to prevent re-creation
const EventDetailsStep = ({ eventData, setEventData }) => (
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
          onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Fall Festival 2025"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
        <input
          type="date"
          value={eventData.event_date}
          onChange={(e) => setEventData(prev => ({ ...prev, event_date: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendance</label>
        <input
          type="number"
          value={eventData.expected_attendance}
          onChange={(e) => setEventData(prev => ({ ...prev, expected_attendance: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget</label>
        <input
          type="number"
          value={eventData.estimated_budget}
          onChange={(e) => setEventData(prev => ({ ...prev, estimated_budget: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
      <textarea
        value={eventData.description}
        onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
        rows="3"
        placeholder="Brief description of your event..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
    </div>
  </div>
);

// Context Step Component - moved outside to prevent re-creation and add scroll preservation
const ContextStep = ({ stellaContext, setStellaContext, handleStellaContextChange, handleAdditionalGoalsChange, handleResourcesChange, handleConstraintsChange }) => {
  const additionalGoalsRef = useRef(null);
  const resourcesRef = useRef(null);
  const constraintsRef = useRef(null);

  // Preserve scroll positions
  const preserveScroll = (ref, callback) => {
    return (...args) => {
      const scrollTop = ref.current?.scrollTop || 0;
      callback(...args);
      // Restore scroll position after state update
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollTop = scrollTop;
        }
      }, 0);
    };
  };

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

  return (
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
            onChange={(e) => handleStellaContextChange('eventType', e.target.value)}
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
            onChange={(e) => handleStellaContextChange('primaryGoal', e.target.value)}
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
            onChange={(e) => handleStellaContextChange('targetAudience', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {targetAudiences.map(audience => (
              <option key={audience} value={audience}>{audience}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Goals</label>
          <div ref={additionalGoalsRef} className="space-y-2 max-h-32 overflow-y-auto">
            {additionalGoalOptions.map(goal => (
              <label key={goal} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={stellaContext.additionalGoals.includes(goal)}
                  onChange={preserveScroll(additionalGoalsRef, (e) => handleAdditionalGoalsChange(goal, e.target.checked))}
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
          <div ref={resourcesRef} className="space-y-2 max-h-32 overflow-y-auto">
            {availableResourceOptions.map(resource => (
              <label key={resource} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={stellaContext.availableResources.includes(resource)}
                  onChange={preserveScroll(resourcesRef, (e) => handleResourcesChange(resource, e.target.checked))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{resource}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Constraints</label>
          <div ref={constraintsRef} className="space-y-2 max-h-32 overflow-y-auto">
            {constraintOptions.map(constraint => (
              <label key={constraint} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={stellaContext.constraints.includes(constraint)}
                  onChange={preserveScroll(constraintsRef, (e) => handleConstraintsChange(constraint, e.target.checked))}
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
          onChange={(e) => handleStellaContextChange('pastEventExperiences', e.target.value)}
          rows="3"
          placeholder="Tell Stella about similar events you've organized before..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

const StellaEventWizard = () => {
  const navigate = useNavigate();
  
  // Storage keys for persistence
  const STORAGE_KEY = 'stella-event-wizard-state';
  
  // Load persisted state or use defaults
  const loadPersistedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }
    return null;
  };

  const persistedState = loadPersistedState();
  
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(persistedState?.currentStep || 1);
  const [workflowMode, setWorkflowMode] = useState(persistedState?.workflowMode || 'assisted');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState(persistedState?.generatedWorkflow || null);

  // Form data
  const [eventData, setEventData] = useState(persistedState?.eventData || {
    title: '',
    description: '',
    event_date: '',
    expected_attendance: '100',
    estimated_budget: '2000',
    category: 'Celebration'
  });

  const [stellaContext, setStellaContext] = useState(persistedState?.stellaContext || {
    eventType: 'Fall Festival',
    primaryGoal: 'Community Building',
    targetAudience: 'All Families',
    additionalGoals: [],
    availableResources: [],
    constraints: [],
    specialConsiderations: '',
    pastEventExperiences: ''
  });

  const [moduleIntegrations, setModuleIntegrations] = useState(persistedState?.moduleIntegrations || {
    createBudget: true,
    generateTimeline: true,
    setupCommunications: true,
    createVolunteerRoles: true,
    planMaterials: true,
    scheduleReminders: true,
    trackProgress: true,
    generateReports: true
  });

  // Memoized event handlers to prevent re-renders
  const handleEventDataChange = useCallback((field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleStellaContextChange = useCallback((field, value) => {
    setStellaContext(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleModuleToggle = useCallback((moduleKey) => {
    setModuleIntegrations(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  }, []);

  // Clear persisted state (for starting over)
  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted state:', error);
    }
  }, [STORAGE_KEY]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setWorkflowMode('assisted');
    setEventData({
      title: '',
      description: '',
      event_date: '',
      expected_attendance: '100',
      estimated_budget: '2000',
      category: 'Celebration'
    });
    setStellaContext({
      eventType: 'Fall Festival',
      primaryGoal: 'Community Building',
      targetAudience: 'All Families',
      additionalGoals: [],
      availableResources: [],
      constraints: [],
      specialConsiderations: '',
      pastEventExperiences: ''
    });
    setModuleIntegrations({
      createBudget: true,
      generateTimeline: true,
      setupCommunications: true,
      createVolunteerRoles: true,
      planMaterials: true,
      scheduleReminders: true,
      trackProgress: true,
      generateReports: true
    });
    setGeneratedWorkflow(null);
    clearPersistedState();
    toast.success('✨ Form cleared! Starting fresh.');
  }, [clearPersistedState]);

  const handleAdditionalGoalsChange = useCallback((goal, checked) => {
    setStellaContext(prev => ({
      ...prev,
      additionalGoals: checked 
        ? [...prev.additionalGoals, goal]
        : prev.additionalGoals.filter(g => g !== goal)
    }));
  }, []);

  const handleResourcesChange = useCallback((resource, checked) => {
    setStellaContext(prev => ({
      ...prev,
      availableResources: checked 
        ? [...prev.availableResources, resource]
        : prev.availableResources.filter(r => r !== resource)
    }));
  }, []);

  const handleConstraintsChange = useCallback((constraint, checked) => {
    setStellaContext(prev => ({
      ...prev,
      constraints: checked 
        ? [...prev.constraints, constraint]
        : prev.constraints.filter(c => c !== constraint)
    }));
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      currentStep,
      workflowMode,
      eventData,
      stellaContext,
      moduleIntegrations,
      generatedWorkflow
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }, [currentStep, workflowMode, eventData, stellaContext, moduleIntegrations, generatedWorkflow]);

  // Initialize user context and show restoration message
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

    // Show restoration message if data was loaded from localStorage
    if (persistedState && (persistedState.currentStep > 1 || persistedState.eventData.title)) {
      toast.info('🔄 Your previous work has been restored!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, []);



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
      const processedEventData = {
        ...eventData,
        expected_attendance: parseInt(eventData.expected_attendance) || 0,
        estimated_budget: parseInt(eventData.estimated_budget) || 0
      };
      
      console.log('🚀 Sending workflow generation request:', {
        eventData: processedEventData,
        stellaContext,
        moduleIntegrations
      });

      const result = await aiAPI.generateComprehensiveWorkflow(
        processedEventData,
        stellaContext,
        moduleIntegrations
      );

      console.log('📨 API Response:', result);

      if (result.error) {
        console.error('❌ API returned error:', result.error);
        throw new Error(result.error);
      }

      if (!result.data) {
        console.error('❌ No data in API response:', result);
        throw new Error('No workflow data received from Stella');
      }

      setGeneratedWorkflow(result.data);
      toast.success('🌟 Stella has created your comprehensive event workflow!');
      setCurrentStep(4);

    } catch (error) {
      console.error('❌ Workflow generation error:', error);
      
      // More detailed error messaging
      let errorMessage = 'Stella encountered an issue. Please try again.';
      
      if (error.message?.includes('ERR_SOCKET_NOT_CONNECTED')) {
        errorMessage = '🔌 Connection issue detected. Please check your internet connection and try again.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = '🌐 Network error. The backend service might be temporarily unavailable.';
      } else if (error.message?.includes('401')) {
        errorMessage = '🔐 Authentication error. Please refresh the page and try again.';
      } else if (error.message?.includes('500')) {
        errorMessage = '⚠️ Server error. Stella is having technical difficulties.';
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }
      
      toast.error(errorMessage, { autoClose: 5000 });
      
      // Show mock results when API fails (for testing the UI)
      console.log('🔧 API failed, using mock workflow data for UI testing');
      const mockWorkflow = {
        workflow: {
          event_title: eventData.title,
          message: `Stella has created a comprehensive workflow for "${eventData.title}" with integrated project management, budget planning, and communication strategies.`,
          components_created: Object.keys(moduleIntegrations).filter(key => moduleIntegrations[key]),
          next_steps: [
            'Review the generated budget and adjust line items as needed',
            'Confirm volunteer roles and begin recruitment',
            'Schedule communication campaigns for optimal timing',
            'Set up project milestones and task assignments',
            'Begin vendor outreach and facility reservations',
            'Set up volunteer coordination and role assignments',
            'Plan materials procurement and vendor relationships',
            'Schedule progress check-ins and milestone reviews'
          ],
          timeline: {
            total_weeks: 8,
            phases: ['Planning & Setup', 'Preparation & Outreach', 'Final Preparations', 'Event Execution', 'Follow-up & Analysis']
          },
          budget_summary: {
            estimated_total: eventData.estimated_budget,
            categories: ['Materials & Supplies', 'Marketing & Communications', 'Volunteer Appreciation', 'Equipment Rental', 'Contingency Fund']
          },
          recommendations: {
            timeline_start: '8 weeks before event date',
            key_milestones: ['Venue booking', 'Volunteer recruitment', 'Marketing launch', 'Final preparations'],
            success_factors: ['Early planning', 'Clear communication', 'Volunteer engagement', 'Budget monitoring']
          }
        }
      };
      
      setGeneratedWorkflow(mockWorkflow);
      setCurrentStep(4);
      toast.info('🔧 Backend temporarily unavailable - showing demo results', { autoClose: 3000 });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStep('');
    }
  };



  // Step 2: Context & Goals - now using external component with scroll preservation

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
            onClick={() => handleModuleToggle(module.key)}>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              clearPersistedState();
              navigate('/events');
            }}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span>View Event Details</span>
          </button>
          <button
            onClick={() => {
              clearPersistedState();
              navigate('/budget');
            }}
            className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span>Review Budget</span>
          </button>
          <button
            onClick={() => {
              clearPersistedState();
              navigate('/communications');
            }}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Start Communications</span>
          </button>
          <button
            onClick={resetForm}
            className="flex items-center justify-center space-x-2 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Create Another Event</span>
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
        <div className="text-center mb-8 relative">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Stella Event Workflow Wizard</h1>
          </div>
          <p className="text-lg text-gray-600">
            Let Stella create a comprehensive workflow for your event with integrated project management, 
            budgeting, communications, and volunteer coordination.
          </p>
          
          {/* Start Over Button - only show if not on step 1 or if there's form data */}
          {(currentStep > 1 || eventData.title || stellaContext.additionalGoals.length > 0) && (
            <button
              onClick={resetForm}
              className="absolute top-0 right-0 flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear all data and start over"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  <div className={`text-sm mt-4 whitespace-nowrap ${
                    currentStep >= step ? 'text-purple-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Event Details'}
                    {step === 2 && 'Context & Goals'}
                    {step === 3 && 'Module Selection'}
                    {step === 4 && 'Workflow Results'}
                  </div>
                </div>
                {step < 4 && (
                  <div className={`w-24 h-1 mx-6 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
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
              {currentStep === 1 && <EventDetailsStep eventData={eventData} setEventData={setEventData} />}
              {currentStep === 2 && (
          <ContextStep 
            stellaContext={stellaContext}
            setStellaContext={setStellaContext}
            handleStellaContextChange={handleStellaContextChange}
            handleAdditionalGoalsChange={handleAdditionalGoalsChange}
            handleResourcesChange={handleResourcesChange}
            handleConstraintsChange={handleConstraintsChange}
          />
        )}
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