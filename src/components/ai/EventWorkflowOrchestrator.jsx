import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Users, DollarSign, MessageSquare, 
  CheckCircle, Clock, ArrowRight, Zap, Target, 
  BarChart3, Settings, Play, Pause, Edit3
} from 'lucide-react';

const EventWorkflowOrchestrator = () => {
  const [eventIdea, setEventIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState('draft');

  // AI Event Ideas
  const eventSuggestions = [
    'Fall Festival', 'Spring Carnival', 'Book Fair', 'Science Night',
    'Art Show', 'Movie Night', 'Bingo Night', 'Talent Show',
    'Holiday Bazaar', 'Teacher Appreciation Week', 'Fundraising Gala',
    'Family Fun Run', 'Outdoor Movie Night', 'Game Night'
  ];

  // Generate Complete Event Workflow
  const generateEventWorkflow = async (eventType) => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const workflow = createCompleteWorkflow(eventType);
      setGeneratedWorkflow(workflow);
      setIsGenerating(false);
    }, 3000);
  };

  const createCompleteWorkflow = (eventType) => {
    const baseWorkflows = {
      'Fall Festival': {
        eventDetails: {
          name: 'Fall Festival 2024',
          description: 'A community celebration featuring games, food, and family fun',
          duration: '4 hours',
          expectedAttendance: 300,
          complexity: 'High',
          season: 'Fall'
        },
        timeline: {
          totalWeeks: 8,
          phases: [
            { name: 'Planning', weeks: 3, color: '#3b82f6' },
            { name: 'Promotion', weeks: 3, color: '#10b981' },
            { name: 'Execution', weeks: 2, color: '#f59e0b' }
          ]
        },
        projectManagement: {
          tasks: [
            {
              id: 1,
              task: 'Secure venue booking',
              assignee: 'Event Coordinator',
              deadline: 'Week 1',
              priority: 'High',
              status: 'pending',
              dependencies: []
            },
            {
              id: 2,
              task: 'Contact food vendors',
              assignee: 'Event Coordinator',
              deadline: 'Week 2',
              priority: 'High',
              status: 'pending',
              dependencies: [1]
            },
            {
              id: 3,
              task: 'Design promotional materials',
              assignee: 'Communications Lead',
              deadline: 'Week 4',
              priority: 'Medium',
              status: 'pending',
              dependencies: []
            },
            {
              id: 4,
              task: 'Launch volunteer recruitment',
              assignee: 'Volunteer Manager',
              deadline: 'Week 5',
              priority: 'High',
              status: 'pending',
              dependencies: [3]
            },
            {
              id: 5,
              task: 'Setup event logistics',
              assignee: 'Setup Crew',
              deadline: 'Week 8',
              priority: 'Critical',
              status: 'pending',
              dependencies: [1, 2, 4]
            }
          ],
          milestones: [
            { name: 'Venue Confirmed', week: 1 },
            { name: 'Vendors Booked', week: 3 },
            { name: 'Promotion Launch', week: 4 },
            { name: 'Volunteers Recruited', week: 6 },
            { name: 'Event Day', week: 8 }
          ]
        },
        budget: {
          totalBudget: 3000,
          expenses: [
            { category: 'Venue', amount: 500, description: 'Gymnasium rental' },
            { category: 'Entertainment', amount: 800, description: 'DJ and activities' },
            { category: 'Food & Beverages', amount: 1200, description: 'Concessions' },
            { category: 'Decorations', amount: 300, description: 'Fall themed decor' },
            { category: 'Supplies', amount: 200, description: 'Tables, chairs, misc' }
          ],
          revenue: [
            { source: 'Ticket Sales', projected: 1500, description: '$5 per family' },
            { source: 'Food Sales', projected: 2000, description: 'Concession profits' },
            { source: 'Game Tickets', projected: 800, description: 'Activity tickets' },
            { source: 'Sponsorships', projected: 500, description: 'Local businesses' }
          ],
          netProjection: 1800
        },
        communications: {
          campaigns: [
            {
              name: 'Save the Date',
              type: 'email',
              sendDate: '6 weeks before',
              audience: 'all_families',
              template: 'fall_festival_save_date',
              status: 'scheduled'
            },
            {
              name: 'Volunteer Recruitment',
              type: 'email',
              sendDate: '4 weeks before',
              audience: 'active_volunteers',
              template: 'volunteer_call_to_action',
              status: 'scheduled'
            },
            {
              name: 'Final Details',
              type: 'email',
              sendDate: '1 week before',
              audience: 'all_families',
              template: 'event_final_details',
              status: 'scheduled'
            }
          ],
          socialMedia: [
            {
              platform: 'Facebook',
              posts: 8,
              schedule: 'Weekly leading up to event',
              content: 'Fall Festival countdown posts'
            },
            {
              platform: 'Instagram',
              posts: 12,
              schedule: 'Bi-weekly with stories',
              content: 'Behind-the-scenes preparation'
            }
          ],
          printMaterials: [
            {
              type: 'Flyer',
              quantity: 500,
              distribution: 'Backpack mail',
              design: 'Fall themed with event details'
            },
            {
              type: 'Poster',
              quantity: 20,
              distribution: 'School hallways',
              design: 'Eye-catching fall festival poster'
            }
          ]
        },
        volunteers: {
          roles: [
            {
              role: 'Setup Crew',
              needed: 8,
              timeCommitment: '2 hours before event',
              skills: 'Physical setup, organization'
            },
            {
              role: 'Game Coordinators',
              needed: 6,
              timeCommitment: 'During event',
              skills: 'Working with children, enthusiasm'
            },
            {
              role: 'Food Service',
              needed: 10,
              timeCommitment: 'During event',
              skills: 'Food handling, customer service'
            },
            {
              role: 'Cleanup Crew',
              needed: 6,
              timeCommitment: '2 hours after event',
              skills: 'Organization, teamwork'
            }
          ],
          totalNeeded: 30,
          currentSignups: 0
        },
        resources: {
          venue: {
            name: 'School Gymnasium',
            capacity: 400,
            amenities: ['Tables', 'Chairs', 'Sound System', 'Kitchen Access']
          },
          equipment: [
            'Sound system for announcements',
            'Tables for games and food',
            'Chairs for seating areas',
            'Extension cords and power strips',
            'Trash bins and recycling'
          ],
          supplies: [
            'Fall decorations (leaves, pumpkins)',
            'Game materials and prizes',
            'Food service supplies',
            'Signage and banners',
            'First aid kit'
          ]
        }
      }
    };

    return baseWorkflows[eventType] || baseWorkflows['Fall Festival'];
  };

  const WorkflowOverview = ({ workflow }) => {
    const completionPercentage = 15; // Simulated progress

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{workflow.eventDetails.name}</h2>
            <p className="text-gray-600">{workflow.eventDetails.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray={`${completionPercentage}, 100`}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Timeline</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{workflow.timeline.totalWeeks} weeks</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Net Profit</span>
            </div>
            <div className="text-2xl font-bold text-green-600">${workflow.budget.netProjection}</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Volunteers</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{workflow.volunteers.totalNeeded}</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Communications</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{workflow.communications.campaigns.length}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Timeline</h3>
          <div className="flex space-x-2">
            {workflow.timeline.phases.map((phase, index) => (
              <div key={index} className="flex-1">
                <div 
                  className="h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: phase.color }}
                >
                  {phase.name} ({phase.weeks}w)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button 
            onClick={() => setWorkflowStatus('active')}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-5 h-5 mr-2" />
            Activate Workflow
          </button>
          <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Edit3 className="w-5 h-5 mr-2" />
            Customize
          </button>
          <button className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </button>
        </div>
      </div>
    );
  };

  const WorkflowModules = ({ workflow }) => {
    const modules = [
      {
        title: 'Project Management',
        icon: Target,
        color: 'blue',
        data: workflow.projectManagement,
        description: `${workflow.projectManagement.tasks.length} tasks across ${workflow.timeline.totalWeeks} weeks`
      },
      {
        title: 'Budget Planning',
        icon: DollarSign,
        color: 'green',
        data: workflow.budget,
        description: `$${workflow.budget.totalBudget} budget with $${workflow.budget.netProjection} projected profit`
      },
      {
        title: 'Communications',
        icon: MessageSquare,
        color: 'purple',
        data: workflow.communications,
        description: `${workflow.communications.campaigns.length} email campaigns + social media`
      },
      {
        title: 'Volunteer Management',
        icon: Users,
        color: 'orange',
        data: workflow.volunteers,
        description: `${workflow.volunteers.totalNeeded} volunteers needed across ${workflow.volunteers.roles.length} roles`
      }
    ];

    return (
      <div className="grid grid-cols-2 gap-6 mt-6">
        {modules.map((module, index) => {
          const Icon = module.icon;
          const colorClasses = {
            blue: 'bg-blue-50 border-blue-200 text-blue-900',
            green: 'bg-green-50 border-green-200 text-green-900',
            purple: 'bg-purple-50 border-purple-200 text-purple-900',
            orange: 'bg-orange-50 border-orange-200 text-orange-900'
          };

          return (
            <div key={index} className={`border-2 rounded-lg p-6 ${colorClasses[module.color]}`}>
              <div className="flex items-center space-x-3 mb-4">
                <Icon className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">{module.title}</h3>
                  <p className="text-sm opacity-75">{module.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {module.title === 'Project Management' && (
                  <div>
                    <div className="text-sm font-medium mb-2">Upcoming Tasks:</div>
                    {module.data.tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>{task.task}</span>
                        <span className="text-xs opacity-75">({task.deadline})</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {module.title === 'Budget Planning' && (
                  <div>
                    <div className="text-sm font-medium mb-2">Budget Breakdown:</div>
                    <div className="text-sm">
                      <div>Total Expenses: ${module.data.expenses.reduce((sum, exp) => sum + exp.amount, 0)}</div>
                      <div>Projected Revenue: ${module.data.revenue.reduce((sum, rev) => sum + rev.projected, 0)}</div>
                      <div className="font-semibold">Net Profit: ${module.data.netProjection}</div>
                    </div>
                  </div>
                )}
                
                {module.title === 'Communications' && (
                  <div>
                    <div className="text-sm font-medium mb-2">Scheduled Campaigns:</div>
                    {module.data.campaigns.map((campaign, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{campaign.name}</span>
                        <span className="text-xs opacity-75">({campaign.sendDate})</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {module.title === 'Volunteer Management' && (
                  <div>
                    <div className="text-sm font-medium mb-2">Volunteer Roles:</div>
                    {module.data.roles.slice(0, 3).map((role, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{role.role}</span>
                        <span className="text-xs opacity-75">({role.needed} needed)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="mt-4 w-full py-2 bg-white bg-opacity-50 rounded-lg text-sm font-medium hover:bg-opacity-75 transition-colors">
                View Details
              </button>
            </div>
          );
        })}
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
            Hi! I'm Stella, your PTO planning assistant. I can generate complete event workflows with integrated project management, budgeting, communications, and volunteer coordination - or help with just the parts you need!
          </p>
        </div>

        {!generatedWorkflow ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Let Stella Create Your Event Workflow</h2>
            
            {/* Event Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What type of event would you like Stella to help you create?
              </label>
              <input
                type="text"
                value={eventIdea}
                onChange={(e) => setEventIdea(e.target.value)}
                placeholder="e.g., Fall Festival, Book Fair, Science Night..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Event Suggestions */}
            <div className="mb-8">
              <div className="text-sm font-medium text-gray-700 mb-3">Popular Event Ideas:</div>
              <div className="flex flex-wrap gap-2">
                {eventSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setEventIdea(suggestion)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => generateEventWorkflow(eventIdea)}
              disabled={!eventIdea.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Stella is creating your workflow...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Let Stella Generate Your Event Workflow</span>
                </div>
              )}
            </button>

            {isGenerating && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <div className="text-center">
                  <div className="text-purple-900 font-medium mb-2">Stella is creating your complete event workflow...</div>
                  <div className="text-sm text-purple-700">
                    ✨ Stella is analyzing event requirements<br/>
                    📅 Creating your project timeline<br/>
                    💰 Generating budget projections<br/>
                    📧 Designing communication campaigns<br/>
                    👥 Planning volunteer coordination<br/>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <WorkflowOverview workflow={generatedWorkflow} />
            <WorkflowModules workflow={generatedWorkflow} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventWorkflowOrchestrator;
