import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, DollarSign, Clock, 
  Sparkles, CheckCircle, ArrowRight, ArrowLeft, 
  X, User, MessageSquare, Wallet, FileText,
  Target, Lightbulb, Settings, Zap
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import toast from 'react-hot-toast';

const StellaEventWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState(0);

  // Event Data State
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    category: 'Fundraiser',
    school_level: 'elementary',
    expected_attendance: 100,
    estimated_budget: 1000
  });

  // Stella Context Data
  const [stellaContext, setStellaContext] = useState({
    eventType: '',
    primaryGoal: '',
    targetAudience: 'families',
    additionalGoals: [],
    specialConsiderations: '',
    pastEventExperiences: '',
    availableResources: [],
    constraints: []
  });

  // Module Integration Checkboxes
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

  const handleInputChange = (field, value, isStella = false) => {
    if (isStella) {
      setStellaContext(prev => ({ ...prev, [field]: value }));
    } else {
      setEventData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayInputChange = (field, value, isStella = false) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    if (isStella) {
      setStellaContext(prev => ({ ...prev, [field]: arrayValue }));
    } else {
      setEventData(prev => ({ ...prev, [field]: arrayValue }));
    }
  };

  const handleModuleToggle = (module) => {
    setModuleIntegrations(prev => ({ ...prev, [module]: !prev[module] }));
  };

  // Wizard Steps
  const steps = [
    { number: 1, title: 'Event Basics', description: 'Tell Stella about your event', color: 'blue' },
    { number: 2, title: 'Context & Goals', description: 'Help Stella understand your vision', color: 'purple' },
    { number: 3, title: 'Planning Details', description: 'Provide event specifications', color: 'pink' },
    { number: 4, title: 'Module Integration', description: 'Choose what Stella should create', color: 'green' },
    { number: 5, title: 'Review & Generate', description: 'Finalize and create your workflow', color: 'amber' }
  ];

  // Step Components
  const EventBasicsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Event Basics</h2>
        <p className="text-gray-600">Let's start with the fundamental details about your event</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Fall Festival 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
          <input
            type="date"
            value={eventData.event_date}
            onChange={(e) => handleInputChange('event_date', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <input
            type="text"
            value={eventData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., School Gymnasium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
          <input
            type="time"
            value={eventData.start_time}
            onChange={(e) => handleInputChange('start_time', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
          <input
            type="time"
            value={eventData.end_time}
            onChange={(e) => handleInputChange('end_time', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Category</label>
          <select
            value={eventData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Fundraiser">Fundraiser</option>
            <option value="Meeting">Meeting</option>
            <option value="Celebration">Celebration</option>
            <option value="Educational">Educational</option>
            <option value="Social">Social</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">School Level</label>
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Brief Description</label>
          <textarea
            value={eventData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your event in a few sentences..."
          />
        </div>
      </div>
    </div>
  );

  const ContextGoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Context & Goals</h2>
        <p className="text-gray-600">Help Stella understand your vision and create the perfect plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What type of event is this? *</label>
          <input
            type="text"
            value={stellaContext.eventType}
            onChange={(e) => handleInputChange('eventType', e.target.value, true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Community Festival, Fundraising Dinner, Science Fair"
          />
          <p className="text-xs text-gray-500 mt-1">Be specific - this helps Stella understand the format</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal *</label>
          <input
            type="text"
            value={stellaContext.primaryGoal}
            onChange={(e) => handleInputChange('primaryGoal', e.target.value, true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Raise $5000 for new playground equipment"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
          <select
            value={stellaContext.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value, true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="families">Families with children</option>
            <option value="students">Students primarily</option>
            <option value="parents">Parents and guardians</option>
            <option value="teachers">Teachers and staff</option>
            <option value="community">Broader community</option>
            <option value="mixed">Mixed audience</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendance</label>
          <input
            type="number"
            value={eventData.expected_attendance}
            onChange={(e) => handleInputChange('expected_attendance', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Goals (comma separated)</label>
          <input
            type="text"
            value={stellaContext.additionalGoals.join(', ')}
            onChange={(e) => handleArrayInputChange('additionalGoals', e.target.value, true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Build community spirit, Showcase student work, Recruit volunteers"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Considerations</label>
          <textarea
            value={stellaContext.specialConsiderations}
            onChange={(e) => handleInputChange('specialConsiderations', e.target.value, true)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Any accessibility needs, dietary restrictions, weather contingencies, etc."
          />
        </div>
      </div>
    </div>
  );

  const PlanningDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Settings className="w-12 h-12 text-pink-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Planning Details</h2>
        <p className="text-gray-600">Provide specific details so Stella can create accurate plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget ($)</label>
          <input
            type="number"
            value={eventData.estimated_budget}
            onChange={(e) => handleInputChange('estimated_budget', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="1000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Resources (comma separated)</label>
          <input
            type="text"
            value={stellaContext.availableResources.join(', ')}
            onChange={(e) => handleArrayInputChange('availableResources', e.target.value, true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="e.g., Sound system, Tables, Chairs, Kitchen access, Parking lot"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Past Event Experience</label>
          <textarea
            value={stellaContext.pastEventExperiences}
            onChange={(e) => handleInputChange('pastEventExperiences', e.target.value, true)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Tell Stella about similar events you've done before - what worked well, what didn't?"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Constraints or Limitations</label>
          <textarea
            value={stellaContext.constraints.join(', ')}
            onChange={(e) => handleArrayInputChange('constraints', e.target.value, true)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="e.g., Limited storage space, No outdoor space if raining, Must end by 9 PM"
          />
        </div>
      </div>
    </div>
  );

  const ModuleIntegrationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Module Integration</h2>
        <p className="text-gray-600">Choose what Stella should create and integrate across PTO Connect</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'createBudget', title: 'Create Event Budget', description: 'Generate detailed budget with line items and projections', icon: Wallet, color: 'green' },
          { key: 'generateTimeline', title: 'Generate Project Timeline', description: 'Create 6-8 week timeline with milestones and deadlines', icon: Calendar, color: 'blue' },
          { key: 'setupCommunications', title: 'Setup Communication Campaign', description: 'Create email, SMS, and social media campaigns', icon: MessageSquare, color: 'purple' },
          { key: 'createVolunteerRoles', title: 'Create Volunteer Roles', description: 'Define volunteer positions and responsibilities', icon: User, color: 'pink' },
          { key: 'planMaterials', title: 'Plan Materials & Supplies', description: 'Generate shopping lists and material requirements', icon: FileText, color: 'yellow' },
          { key: 'scheduleReminders', title: 'Schedule Automated Reminders', description: 'Set up reminders for key milestones and deadlines', icon: Clock, color: 'indigo' },
          { key: 'trackProgress', title: 'Enable Progress Tracking', description: 'Monitor completion status and task progress', icon: CheckCircle, color: 'teal' },
          { key: 'generateReports', title: 'Generate Success Reports', description: 'Create post-event analysis and success metrics', icon: FileText, color: 'orange' }
        ].map((module) => {
          const Icon = module.icon;
          const isSelected = moduleIntegrations[module.key];
          
          return (
            <button
              key={module.key}
              onClick={() => handleModuleToggle(module.key)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-green-500' : 'bg-gray-200'}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                      {module.title}
                    </h3>
                    {isSelected && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className={`text-sm ${isSelected ? 'text-green-700' : 'text-gray-600'} mt-1`}>
                    {module.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Stella's Recommendation</h4>
            <p className="text-sm text-blue-700 mt-1">
              For most events, I recommend enabling all modules for the most comprehensive workflow. 
              You can always adjust these later, and each module works better when integrated with the others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ReviewGenerateStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="w-12 h-12 text-amber-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Review & Generate</h2>
        <p className="text-gray-600">Review your details and let Stella create your comprehensive event workflow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-4">Event Summary</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Title:</strong> {eventData.title || 'Not specified'}</div>
            <div><strong>Date:</strong> {eventData.event_date || 'Not specified'}</div>
            <div><strong>Location:</strong> {eventData.location || 'Not specified'}</div>
            <div><strong>Category:</strong> {eventData.category}</div>
            <div><strong>Expected Attendance:</strong> {eventData.expected_attendance}</div>
            <div><strong>Budget:</strong> ${eventData.estimated_budget}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-4">Stella's Context</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Type:</strong> {stellaContext.eventType || 'Not specified'}</div>
            <div><strong>Primary Goal:</strong> {stellaContext.primaryGoal || 'Not specified'}</div>
            <div><strong>Audience:</strong> {stellaContext.targetAudience}</div>
            <div><strong>Resources:</strong> {stellaContext.availableResources.length} items</div>
            <div><strong>Additional Goals:</strong> {stellaContext.additionalGoals.length} items</div>
          </div>
        </div>

        <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-4">Selected Integrations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(moduleIntegrations)
              .filter(([_, selected]) => selected)
              .map(([key, _]) => (
                <div key={key} className="flex items-center space-x-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {!isGenerating && (
        <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-6 h-6 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Ready to Generate!</h4>
              <p className="text-sm text-amber-700 mt-1">
                Stella will now create your comprehensive event workflow including timeline, budget, 
                communications, and all selected integrations. This may take a moment.
              </p>
            </div>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent" />
            <div>
              <h4 className="font-medium text-purple-900">Stella is working her magic...</h4>
              <p className="text-sm text-purple-700 mt-1">
                Creating your comprehensive event workflow ({workflowProgress}% complete)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const nextStep = () => {
    if (currentStep < 5) {
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return eventData.title && eventData.event_date && eventData.location;
      case 2:
        return stellaContext.eventType && stellaContext.primaryGoal;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const createEventAndWorkflow = async () => {
    if (!eventData.title || !eventData.event_date || !eventData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setWorkflowProgress(10);

    try {
      // Simulate Stella's workflow creation
      setWorkflowProgress(30);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWorkflowProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWorkflowProgress(90);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWorkflowProgress(100);
      
      toast.success(`✨ Event "${eventData.title}" created successfully! Stella has generated your comprehensive workflow.`);
      
      // Navigate back to events
      setTimeout(() => {
        navigate('/events');
      }, 2000);

    } catch (error) {
      console.error('Event creation error:', error);
      toast.error('Failed to create event and workflow. Please try again.');
      setIsGenerating(false);
      setWorkflowProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/events')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Events</span>
            </button>
            
            <button
              onClick={() => navigate('/events')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Stella Event Wizard
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let Stella help you create a comprehensive event workflow with timeline, budget, 
            communications, and everything you need for success
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.number
                    ? 'border-purple-500 bg-purple-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-all ${
                    currentStep > step.number ? 'bg-purple-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg border p-8 mb-8">
          {currentStep === 1 && <EventBasicsStep />}
          {currentStep === 2 && <ContextGoalsStep />}
          {currentStep === 3 && <PlanningDetailsStep />}
          {currentStep === 4 && <ModuleIntegrationStep />}
          {currentStep === 5 && <ReviewGenerateStep />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>

          <button
            onClick={nextStep}
            disabled={!canProceed() || isGenerating}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Creating Workflow... {workflowProgress}%</span>
              </>
            ) : (
              <>
                <span>{currentStep === 5 ? 'Generate Workflow' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StellaEventWizard; 