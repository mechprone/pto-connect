import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, DollarSign, Users, MessageSquare, Clock, 
  CheckCircle, Sparkles, ArrowRight, Lightbulb,
  Target, Settings, Zap, PlayCircle, PieChart
} from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI, eventsAPI } from '@/utils/api';
import { supabase } from '@/utils/supabaseClient';

const EnhancedEventCreationWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [workflowMode, setWorkflowMode] = useState('assisted'); // manual, assisted, automated
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);

  // Event Form Data
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_time: '',
    location: '',
    category: 'Meeting',
    school_level: 'elementary',
    expected_attendance: 50,
    estimated_budget: 500,
    volunteer_roles: [],
    materials_needed: [],
    special_requirements: ''
  });

  // Stella Analysis State
  const [stellaAnalysis, setStellaAnalysis] = useState(null);

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

  const handleInputChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setEventData(prev => ({ ...prev, [field]: items }));
  };

  // Step 1: Basic Event Information
  const EventDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Details</h2>
        <p className="text-gray-600">Let's start with the basics about your event</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Fall Festival, Book Fair, Bake Sale"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={eventData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of your event..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date *
          </label>
          <input
            type="date"
            value={eventData.event_date}
            onChange={(e) => handleInputChange('event_date', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time
          </label>
          <input
            type="time"
            value={eventData.end_time}
            onChange={(e) => handleInputChange('end_time', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            value={eventData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="School gymnasium, cafeteria, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={eventData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Meeting">Meeting</option>
            <option value="Fundraiser">Fundraiser</option>
            <option value="Celebration">Celebration</option>
            <option value="Educational">Educational</option>
            <option value="Social">Social</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 2: Event Planning Details
  const EventPlanningStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Planning Details</h2>
        <p className="text-gray-600">Help Stella understand your event requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Attendance
          </label>
          <input
            type="number"
            value={eventData.expected_attendance}
            onChange={(e) => handleInputChange('expected_attendance', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Budget ($)
          </label>
          <input
            type="number"
            value={eventData.estimated_budget}
            onChange={(e) => handleInputChange('estimated_budget', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Level
          </label>
          <select
            value={eventData.school_level}
            onChange={(e) => handleInputChange('school_level', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="elementary">Elementary</option>
            <option value="upper_elementary">Upper Elementary</option>
            <option value="middle">Middle School</option>
            <option value="junior_high">Junior High</option>
            <option value="high">High School</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volunteer Roles Needed
          </label>
          <input
            type="text"
            value={eventData.volunteer_roles.join(', ')}
            onChange={(e) => handleArrayInputChange('volunteer_roles', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Setup crew, registration, cleanup (comma separated)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Materials Needed
          </label>
          <input
            type="text"
            value={eventData.materials_needed.join(', ')}
            onChange={(e) => handleArrayInputChange('materials_needed', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tables, chairs, decorations, sound system (comma separated)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requirements
          </label>
          <textarea
            value={eventData.special_requirements}
            onChange={(e) => handleInputChange('special_requirements', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any special considerations, dietary restrictions, accessibility needs, etc."
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Workflow Mode Selection
  const WorkflowModeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Workflow Experience</h2>
        </div>
        <p className="text-gray-600">How would you like Stella to help with your event planning?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            mode: 'manual',
            title: 'Manual Control',
            description: 'I prefer to plan everything myself with basic Stella suggestions',
            icon: Settings,
            color: 'gray',
            features: ['Event creation only', 'Optional AI suggestions', 'Full manual control', 'Basic reminders']
          },
          {
            mode: 'assisted',
            title: 'Stella Assisted',
            description: 'I want Stella\'s help with suggestions and recommendations',
            icon: Sparkles,
            color: 'purple',
            features: ['AI-powered suggestions', 'Smart recommendations', 'Timeline assistance', 'Communication templates']
          },
          {
            mode: 'automated',
            title: 'Fully Automated',
            description: 'Let Stella create the complete workflow for me',
            icon: Zap,
            color: 'blue',
            features: ['Complete workflow generation', 'Auto task creation', 'Budget planning', 'Communication campaigns']
          }
        ].map((option) => {
          const Icon = option.icon;
          const isSelected = workflowMode === option.mode;
          
          return (
            <button
              key={option.mode}
              onClick={() => setWorkflowMode(option.mode)}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg`
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <Icon className={`w-8 h-8 mb-4 ${
                isSelected ? `text-${option.color}-600` : 'text-gray-400'
              }`} />
              <h3 className="font-bold text-lg text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{option.description}</p>
              <ul className="space-y-1">
                {option.features.map((feature, index) => (
                  <li key={index} className={`text-xs flex items-center space-x-2 ${
                    isSelected ? `text-${option.color}-700` : 'text-gray-500'
                  }`}>
                    <CheckCircle className="w-3 h-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {workflowMode === 'automated' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Stella's Full Workflow Will Include:</h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• 6-8 week project timeline with key milestones</li>
                <li>• Detailed budget breakdown and expense tracking</li>
                <li>• Complete communication campaign (email, SMS, social media)</li>
                <li>• Volunteer coordination and task assignments</li>
                <li>• Automated reminders and follow-ups</li>
                <li>• Post-event analysis and reporting</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Create event and trigger workflow
  const createEventAndWorkflow = async () => {
    if (!eventData.title || !eventData.event_date || !eventData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!currentUser?.org_id) {
      toast.error('Organization context required');
      return;
    }

    setIsGeneratingWorkflow(true);
    setWorkflowProgress(10);

    try {
      // Step 1: Create the basic event
      setWorkflowProgress(20);
      const eventResult = await eventsAPI.createEvent({
        ...eventData,
        org_id: currentUser.org_id,
        created_by: currentUser.id
      });

      if (eventResult.error) {
        throw new Error(eventResult.error);
      }

      const newEvent = eventResult.data;
      setWorkflowProgress(40);

      // Step 2: Generate workflow based on selected mode
      if (workflowMode !== 'manual') {
        setWorkflowProgress(60);
        
        const workflowAnalysis = await aiAPI.analyzeEventWorkflow(eventData, currentUser.org_id);
        
        if (workflowMode === 'automated') {
          setWorkflowProgress(80);
          
          // Generate comprehensive workflow components
          const recommendations = await aiAPI.generateContent(
            'workflow', 
            `Complete event workflow for ${eventData.title}`, 
            { orgId: currentUser.org_id, eventData, mode: 'automated' },
            true
          );

          setGeneratedWorkflow({
            event: newEvent,
            analysis: workflowAnalysis,
            recommendations: recommendations.recommendations || [],
            timeline: workflowAnalysis.workflowPlan?.keyMilestones || [],
            budget: workflowAnalysis.workflowPlan?.budgetRecommendations || {},
            communications: workflowAnalysis.workflowPlan?.communicationPlan || {},
            volunteers: workflowAnalysis.workflowPlan?.volunteerNeeds || {}
          });
        } else {
          // Assisted mode - provide suggestions
          setGeneratedWorkflow({
            event: newEvent,
            analysis: workflowAnalysis,
            suggestions: workflowAnalysis.workflowPlan || {}
          });
        }

        setStellaAnalysis(workflowAnalysis);
      }

      setWorkflowProgress(100);
      
      toast.success(`✨ Event created successfully! ${workflowMode === 'automated' ? 'Stella has generated your complete workflow.' : workflowMode === 'assisted' ? 'Stella has prepared suggestions for you.' : ''}`);
      
      // Navigate to event details or workflow view
      setTimeout(() => {
        if (workflowMode === 'automated') {
          navigate(`/events/${newEvent.id}/workflow`);
        } else {
          navigate(`/events/${newEvent.id}`);
        }
      }, 2000);

    } catch (error) {
      console.error('Event creation error:', error);
      toast.error('Failed to create event and workflow. Please try again.');
      setIsGeneratingWorkflow(false);
      setWorkflowProgress(0);
    }
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      createEventAndWorkflow();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Step {currentStep} of 3</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        {currentStep === 1 && <EventDetailsStep />}
        {currentStep === 2 && <EventPlanningStep />}
        {currentStep === 3 && <WorkflowModeStep />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          onClick={nextStep}
          disabled={isGeneratingWorkflow}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isGeneratingWorkflow ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Creating Event & Workflow... {workflowProgress}%</span>  
            </>
          ) : (
            <>
              <span>{currentStep === 3 ? 'Create Event' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EnhancedEventCreationWizard; 