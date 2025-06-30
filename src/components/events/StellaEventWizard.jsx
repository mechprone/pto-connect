import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Calendar, DollarSign, Users, MessageSquare, 
  CheckCircle, Clock, TrendingUp, Target, Zap, ArrowRight,
  Settings, Eye, Download, Plus, AlertCircle, Activity,
  PlayCircle, BarChart3, Edit, RotateCcw, PartyPopper
} from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '@/utils/api';

// --- Helper Components (Defined outside the main component for stability) ---

const EventDetailsStep = ({ eventData, setEventData }) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Stella About Your Event</h2>
        <p className="text-gray-600">Provide basic information about the event you want to create</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
          <input type="text" value={eventData.title} onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Fall Festival 2025" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
          <input type="date" value={eventData.event_date} onChange={(e) => setEventData(prev => ({ ...prev, event_date: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendance</label>
          <input type="number" value={eventData.expected_attendance} onChange={(e) => setEventData(prev => ({ ...prev, expected_attendance: parseInt(e.target.value, 10) || 0 }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget</label>
          <input type="number" value={eventData.estimated_budget} onChange={(e) => setEventData(prev => ({ ...prev, estimated_budget: parseInt(e.target.value, 10) || 0 }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea value={eventData.description} onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))} rows="3" placeholder="Brief description of your event..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
      </div>
    </div>
);

const ContextStep = ({ stellaContext, handleStellaContextChange, handleAdditionalGoalsChange, handleResourcesChange, handleConstraintsChange }) => {
  const eventTypes = ['Fall Festival', 'Spring Carnival', 'Book Fair', 'Science Night', 'Art Show', 'Talent Show', 'Movie Night', 'Game Night', 'Teacher Appreciation', 'Volunteer Recognition', 'Board Meeting', 'Fundraiser', 'Auction', 'Walk-a-thon', 'Bake Sale'];
  const primaryGoals = ['Community Building', 'Fundraising', 'Educational Enhancement', 'Volunteer Appreciation', 'Student Recognition', 'Family Engagement', 'School Support', 'Cultural Celebration'];
  const targetAudiences = ['All Families', 'Parents Only', 'Students & Families', 'Community Members', 'Teachers & Staff', 'Volunteers', 'Board Members', 'Local Businesses'];
  const additionalGoalOptions = ['Raise funds for specific programs', 'Showcase student work', 'Build community relationships', 'Recruit new volunteers', 'Celebrate achievements', 'Educate about school programs', 'Support teachers and staff', 'Create lasting memories'];
  const availableResourceOptions = ['Dedicated parent volunteers', 'School facilities access', 'Local business partnerships', 'Previous event materials', 'Social media presence', 'Email communication list', 'Equipment and supplies', 'Budget for materials'];
  const constraintOptions = ['Limited budget', 'Time constraints', 'Venue limitations', 'Weather dependent', 'Need school approval', 'Limited volunteers', 'Scheduling conflicts', 'Safety requirements'];

  return (
    <div className="space-y-6">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Help Stella Understand Your Goals</h2>
            <p className="text-gray-600">This information helps Stella create the perfect workflow for your event</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select value={stellaContext.eventType} onChange={(e) => handleStellaContextChange('eventType', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    {eventTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
                <select value={stellaContext.primaryGoal} onChange={(e) => handleStellaContextChange('primaryGoal', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    {primaryGoals.map(goal => (<option key={goal} value={goal}>{goal}</option>))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <select value={stellaContext.targetAudience} onChange={(e) => handleStellaContextChange('targetAudience', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    {targetAudiences.map(audience => (<option key={audience} value={audience}>{audience}</option>))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Goals</label>
                <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                    {additionalGoalOptions.map(goal => (<label key={goal} className="flex items-center space-x-2"><input type="checkbox" checked={stellaContext.additionalGoals.includes(goal)} onChange={(e) => handleAdditionalGoalsChange(goal, e.target.checked)} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" /><span className="text-sm text-gray-700">{goal}</span></label>))}
                </div>
            </div>
             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Resources</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                        {availableResourceOptions.map(resource => (<label key={resource} className="flex items-center space-x-2"><input type="checkbox" checked={stellaContext.availableResources.includes(resource)} onChange={(e) => handleResourcesChange(resource, e.target.checked)} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" /><span className="text-sm text-gray-700">{resource}</span></label>))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Constraints</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                        {constraintOptions.map(constraint => (<label key={constraint} className="flex items-center space-x-2"><input type="checkbox" checked={stellaContext.constraints.includes(constraint)} onChange={(e) => handleConstraintsChange(constraint, e.target.checked)} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" /><span className="text-sm text-gray-700">{constraint}</span></label>))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const GenerationProgress = ({ progressUpdates }) => (
    <div className="text-center py-16">
        <div className="inline-block relative">
            <Sparkles className="text-purple-500 w-24 h-24 animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full animate-ping"></div>
            </div>
        </div>
        <h2 className="text-2xl font-bold mt-8">Stella is working her magic...</h2>
        <p className="text-gray-600 mt-2">Generating your comprehensive event workflow.</p>
        <div className="mt-8 w-full max-w-md mx-auto">
            {progressUpdates.map((update, index) => (
                <div key={index} className="flex items-center space-x-4 p-2">
                    <update.icon className={`w-5 h-5 ${update.status === 'complete' ? 'text-green-500' : 'text-gray-400 animate-pulse'}`} />
                    <span className={`text-sm ${update.status === 'complete' ? 'text-gray-800' : 'text-gray-500'}`}>{update.text}</span>
                </div>
            ))}
        </div>
    </div>
);

const WorkflowResultsStep = ({ workflowData }) => {
    if (!workflowData) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="mx-auto w-12 h-12 text-red-500" />
                <h2 className="mt-4 text-xl font-bold">Failed to Generate Workflow</h2>
                <p className="mt-2 text-gray-600">There was an issue generating the workflow. Please try again.</p>
                 <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Back</button>
            </div>
        );
    }
    const eventTitle = workflowData.event?.title || 'Your Event';
    const components = workflowData.components_created || {};
    const integratedModules = Object.values(components).filter(Boolean).length;
    return (
        <div className="p-4 sm:p-6 bg-white">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Your Workflow is Ready!</h2>
                <p className="mt-2 text-lg text-gray-600">Stella has created a comprehensive plan for "{eventTitle}".</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
                <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /><p className="font-bold text-xl">{integratedModules}</p><p className="text-sm text-gray-600">Modules Integrated</p></div>
                <div className="bg-blue-50 p-4 rounded-lg"><Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" /><p className="font-bold text-xl">Active</p><p className="text-sm text-gray-600">Workflow Status</p></div>
                <div className="bg-indigo-50 p-4 rounded-lg"><Users className="w-8 h-8 text-indigo-500 mx-auto mb-2" /><p className="font-bold text-xl">{workflowData.event?.expected_attendance || 'N/A'}</p><p className="text-sm text-gray-600">Expected Guests</p></div>
                <div className="bg-pink-50 p-4 rounded-lg"><DollarSign className="w-8 h-8 text-pink-500 mx-auto mb-2" /><p className="font-bold text-xl">${workflowData.event?.estimated_budget || '0'}</p><p className="text-sm text-gray-600">Est. Budget</p></div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center"><Zap className="w-6 h-6 mr-2 text-yellow-500" />Next Steps</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li>Review the generated budget and adjust line items as needed.</li>
                    <li>Confirm volunteer roles and begin recruitment.</li>
                    <li>Schedule communication campaigns for optimal timing.</li>
                    <li>Set up project milestones and task assignments.</li>
                    <li>Begin vendor outreach and facility reservations.</li>
                </ol>
            </div>
        </div>
    );
};

// --- Main Wizard Component ---

const StellaEventWizard = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [workflowData, setWorkflowData] = useState(null);
    const [progressUpdates, setProgressUpdates] = useState([]);
    const navigate = useNavigate();

    const [eventData, setEventData] = useState({
        title: 'Teacher appreciation - backend test',
        description: 'Teacher appreciation event honoring the teachers each day for 5 days with small tokens like a coffee bar day or lunch catered , etc',
        event_date: '2025-07-07',
        start_time: '09:00',
        end_time: '15:00',
        location: 'School Campus',
        expected_attendance: 100,
        estimated_budget: 2000,
        category: 'celebration'
    });

    const [stellaContext, setStellaContext] = useState({
        eventType: 'Teacher Appreciation',
        primaryGoal: 'School Support',
        targetAudience: 'Teachers & Staff',
        additionalGoals: ['Build community relationships'],
        availableResources: ['Dedicated parent volunteers', 'Local business partnerships', 'Previous event materials'],
        constraints: ['Time constraints'],
        pastEventExperiences: 'Previous TA experience'
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
    
    const handleStellaContextChange = (field, value) => setStellaContext(prev => ({ ...prev, [field]: value }));
    
    const handleCheckboxChange = (stateKey, value, checked) => {
        setStellaContext(prev => {
            const currentValues = prev[stateKey] || [];
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter(item => item !== value);
            return { ...prev, [stateKey]: newValues };
        });
    };
    
    const handleAdditionalGoalsChange = (goal, checked) => handleCheckboxChange('additionalGoals', goal, checked);
    const handleResourcesChange = (resource, checked) => handleCheckboxChange('availableResources', resource, checked);
    const handleConstraintsChange = (constraint, checked) => handleCheckboxChange('constraints', constraint, checked);

    const generateWorkflow = async () => {
        setIsLoading(true);
        setCurrentStep(2);
        setProgressUpdates([{ text: 'Initializing workflow generation...', status: 'in-progress', icon: Activity }]);
    
        try {
            console.log("Submitting to API:", { eventData, stellaContext, moduleIntegrations });
            const response = await aiAPI.generateComprehensiveWorkflow(
                eventData,
                stellaContext,
                moduleIntegrations
            );
    
            if (response && response.data && response.data.success) {
                setWorkflowData(response.data);
                const components = response.data.components_created || {};
                const statusUpdates = [
                    { text: 'Event created', status: 'complete', icon: CheckCircle },
                    { text: 'Timeline generation', status: components.timeline ? 'complete' : 'skipped', icon: components.timeline ? CheckCircle : Edit },
                    { text: 'Budget planning', status: components.budget ? 'complete' : 'skipped', icon: components.budget ? CheckCircle : Edit },
                    { text: 'Communications setup', status: components.communications ? 'complete' : 'skipped', icon: components.communications ? CheckCircle : Edit },
                    { text: 'Volunteer roles', status: components.volunteers ? 'complete' : 'skipped', icon: components.volunteers ? CheckCircle : Edit },
                    { text: 'Materials & Resources', status: components.materials ? 'complete' : 'skipped', icon: components.materials ? CheckCircle : Edit },
                    { text: 'Reminders & Notifications', status: components.reminders ? 'complete' : 'skipped', icon: components.reminders ? CheckCircle : Edit },
                    { text: 'Workflow ready!', status: 'complete', icon: PartyPopper }
                ];
                setProgressUpdates(statusUpdates);
                setCurrentStep(3);
                toast.success('🎉 Comprehensive workflow created successfully!');
            } else {
                const errorMessage = response?.error || 'Workflow generation failed: An unknown error occurred.';
                toast.error(errorMessage);
                setWorkflowData(null);
                setCurrentStep(3);
            }
        } catch (error) {
            const errorMessage = error.message || 'An unexpected error occurred.';
            toast.error(`Error: ${errorMessage}`);
            setWorkflowData(null);
            setCurrentStep(3);
        } finally {
            setIsLoading(false);
        }
    };
    
    const steps = [
      { name: 'Event Details', component: <EventDetailsStep eventData={eventData} setEventData={setEventData} /> },
      { name: 'Stella Context', component: <ContextStep {...{ stellaContext, handleStellaContextChange, handleAdditionalGoalsChange, handleResourcesChange, handleConstraintsChange }} /> },
      { name: 'Generation', component: <GenerationProgress progressUpdates={progressUpdates} /> },
      { name: 'Results', component: <WorkflowResultsStep workflowData={workflowData} /> }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 space-y-8">
                {/* Stepper Navigation */}
                <nav aria-label="Progress">
                    <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                        {steps.slice(0, 2).map((step, stepIdx) => (
                        <li key={step.name} className="md:flex-1">
                            {currentStep > stepIdx ? (
                            <a href="#" className="group flex w-full flex-col border-l-4 border-purple-600 py-2 pl-4 transition-colors hover:border-purple-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-purple-600 transition-colors group-hover:text-purple-800">{`Step ${stepIdx + 1}`}</span>
                                <span className="text-sm font-medium">{step.name}</span>
                            </a>
                            ) : currentStep === stepIdx ? (
                            <a href="#" className="flex w-full flex-col border-l-4 border-purple-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                                <span className="text-sm font-medium text-purple-600">{`Step ${stepIdx + 1}`}</span>
                                <span className="text-sm font-medium">{step.name}</span>
                            </a>
                            ) : (
                            <a href="#" className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-gray-500 transition-colors group-hover:text-gray-700">{`Step ${stepIdx + 1}`}</span>
                                <span className="text-sm font-medium">{step.name}</span>
                            </a>
                            )}
                        </li>
                        ))}
                    </ol>
                </nav>

                <div>{steps[currentStep].component}</div>
                
                <div className="flex justify-between pt-4 border-t">
                    <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0 || isLoading || currentStep > 1} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                        Back
                    </button>
                    {currentStep < 1 && (
                        <button onClick={() => setCurrentStep(s => s + 1)} className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
                            Next
                        </button>
                    )}
                    {currentStep === 1 && (
                        <button onClick={generateWorkflow} disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center">
                            {isLoading ? 'Generating...' : 'Create Workflow'}
                            {!isLoading && <Sparkles className="w-4 h-4 ml-2" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StellaEventWizard;