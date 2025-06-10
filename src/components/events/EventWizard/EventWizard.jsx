import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar, Users, DollarSign, Eye } from 'lucide-react';
import BasicInfoStep from './BasicInfoStep';
import SchedulingStep from './SchedulingStep';
import VolunteerStep from './VolunteerStep';
import BudgetStep from './BudgetStep';
import ReviewStep from './ReviewStep';
import { generateUniqueEventId, generateRSVPUrl } from '../../../utils/eventUtils';

const EventWizard = ({ onComplete, onCancel, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [eventData, setEventData] = useState({
    // Basic Info
    title: '',
    description: '',
    category: '',
    school_level: 'elementary',
    location: '',
    visibility: 'public',
    share_public: false,
    
    // Scheduling
    event_date: '',
    start_time: '',
    end_time: '',
    recurring: false,
    recurring_pattern: 'weekly',
    recurring_end_date: '',
    
    // Volunteers
    volunteer_opportunities: [],
    volunteer_coordinator: '',
    volunteer_requirements: '',
    
    // Budget
    estimated_budget: '',
    budget_categories: [],
    fundraising_goal: '',
    
    ...initialData
  });

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      icon: Calendar,
      component: BasicInfoStep,
      description: 'Event details and description'
    },
    {
      id: 'scheduling',
      title: 'Scheduling',
      icon: Calendar,
      component: SchedulingStep,
      description: 'Date, time, and recurring options'
    },
    {
      id: 'volunteers',
      title: 'Volunteers',
      icon: Users,
      component: VolunteerStep,
      description: 'Volunteer opportunities and coordination'
    },
    {
      id: 'budget',
      title: 'Budget',
      icon: DollarSign,
      component: BudgetStep,
      description: 'Financial planning and goals'
    },
    {
      id: 'review',
      title: 'Review',
      icon: Eye,
      component: ReviewStep,
      description: 'Review and publish event'
    }
  ];

  const updateEventData = (stepData) => {
    setEventData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const handleComplete = async () => {
    try {
      // Generate unique event ID with collision checking
      // In production, this would check against existing events in the database
      const existingEventIds = []; // This would come from API call in real implementation
      const uniqueEventId = await generateUniqueEventId(existingEventIds);
      
      // Create complete event data with unique identifiers
      const completeEventData = {
        ...eventData,
        id: uniqueEventId,
        rsvpUrl: generateRSVPUrl(uniqueEventId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onComplete(completeEventData);
    } catch (error) {
      console.error('Error generating unique event ID:', error);
      // Fallback to basic completion if ID generation fails
      onComplete(eventData);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Follow the steps below to create your event</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isAccessible = index <= currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => isAccessible && goToStep(index)}
                    disabled={!isAccessible}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : isCompleted 
                          ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                      ${isAccessible && !isActive ? 'hover:bg-blue-500 hover:text-white cursor-pointer' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>

                  {/* Progress Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                        style={{ width: index < currentStep ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          <CurrentStepComponent
            data={eventData}
            onUpdate={updateEventData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={isFirstStep ? onCancel : prevStep}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            {isFirstStep ? 'Cancel' : 'Previous'}
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
            
            {isLastStep ? (
              <button
                onClick={handleComplete}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-5 h-5 mr-2" />
                Publish Event
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventWizard;
