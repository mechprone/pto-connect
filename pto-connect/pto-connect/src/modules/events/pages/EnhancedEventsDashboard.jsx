import React, { useState } from 'react';
import { 
  Calendar, Plus, Search, Filter, Grid, List, 
  Sparkles, User, Clock, DollarSign, Users,
  ArrowRight, Eye, Edit, Trash2
} from 'lucide-react';
import AIAssistanceToggle from '../../../components/common/AIAssistanceToggle';

const EnhancedEventsDashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [creationMode, setCreationMode] = useState('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample events data
  const events = [
    {
      id: 1,
      name: 'Fall Festival 2024',
      date: '2024-10-15',
      status: 'planning',
      attendees: 300,
      budget: 3000,
      profit: 1800,
      progress: 65,
      type: 'ai-generated',
      description: 'Community celebration with games, food, and family fun'
    },
    {
      id: 2,
      name: 'Book Fair',
      date: '2024-11-20',
      status: 'active',
      attendees: 150,
      budget: 1500,
      profit: 800,
      progress: 85,
      type: 'manual',
      description: 'Annual book fair to promote reading'
    },
    {
      id: 3,
      name: 'Science Night',
      date: '2024-12-05',
      status: 'draft',
      attendees: 200,
      budget: 2000,
      profit: 1200,
      progress: 25,
      type: 'manual',
      description: 'Interactive science demonstrations and experiments'
    }
  ];

  const handleCreationModeChange = (mode, settings) => {
    setCreationMode(mode);
    console.log('Creation mode changed:', mode, settings);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      planning: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const EventCard = ({ event }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
              {event.type === 'ai-generated' && (
                <Sparkles className="w-4 h-4 text-purple-500" title="AI Generated" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{event.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{event.attendees} expected</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{event.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${event.progress}%` }}
            />
          </div>
        </div>

        {/* Budget Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Budget</div>
            <div className="text-lg font-semibold text-gray-900">${event.budget}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600">Projected Profit</div>
            <div className="text-lg font-semibold text-green-700">${event.profit}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Eye className="w-4 h-4 mr-2" />
            View
          </button>
          <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );

  const EventRow = ({ event }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{event.name}</h3>
              {event.type === 'ai-generated' && (
                <Sparkles className="w-4 h-4 text-purple-500" />
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Date</div>
            <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Attendees</div>
            <div className="font-medium">{event.attendees}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Budget</div>
            <div className="font-medium">${event.budget}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="font-medium">{event.progress}%</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const CreateEventOptions = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Event</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Creation */}
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-8 h-8 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Manual Creation</h3>
              <p className="text-sm text-gray-600">Full control over every detail</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            <li>• Step-by-step event setup</li>
            <li>• Custom timeline creation</li>
            <li>• Manual budget planning</li>
            <li>• Individual task assignment</li>
          </ul>
          <button className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Create Manually
          </button>
        </div>

        {/* AI Assisted */}
        <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors bg-blue-50">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">AI Assisted</h3>
              <p className="text-sm text-blue-700">AI suggestions with manual control</p>
            </div>
          </div>
          <ul className="text-sm text-blue-700 space-y-2 mb-4">
            <li>• AI-generated suggestions</li>
            <li>• Smart template recommendations</li>
            <li>• Automated task suggestions</li>
            <li>• Budget estimation help</li>
          </ul>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create with AI Help
          </button>
        </div>

        {/* Full AI Automation */}
        <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors bg-purple-50">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-900">AI Automated</h3>
              <p className="text-sm text-purple-700">Complete workflow generation</p>
            </div>
          </div>
          <ul className="text-sm text-purple-700 space-y-2 mb-4">
            <li>• Complete workflow creation</li>
            <li>• Automated timeline & tasks</li>
            <li>• Budget & profit projections</li>
            <li>• Communication campaigns</li>
          </ul>
          <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Generate Full Workflow
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Dashboard</h1>
            <p className="text-gray-600">Manage your PTO events with manual control or AI assistance</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Create Event Options */}
        <CreateEventOptions />

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {events.map(event => (
            viewMode === 'grid' ? 
              <EventCard key={event.id} event={event} /> : 
              <EventRow key={event.id} event={event} />
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first event</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Your First Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedEventsDashboard;
