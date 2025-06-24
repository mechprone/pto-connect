import React, { useState } from 'react';
import { 
  Calendar, Plus, Search, Filter, Grid, List, 
  Sparkles, User, Clock, DollarSign, Users,
  ArrowRight, Eye, Edit, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIAssistanceToggle from '../../../components/common/AIAssistanceToggle';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const EventsDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [creationMode, setCreationMode] = useState('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Button handlers
  const handleCreateManually = () => {
    navigate('/events/create');
  };

  const handleCreateWithStella = () => {
    navigate('/events/create-enhanced');
  };

  const handleGenerateFullWorkflow = () => {
    navigate('/events/create-enhanced');
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      console.log('Deleting event:', eventId);
      // Add delete logic here
    }
  };

  const handleCreateFirstEvent = () => {
    navigate('/events/create');
  };

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
      type: 'stella-generated',
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

  // Mini calendar events format
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.name,
    start: new Date(event.date),
    end: new Date(event.date),
    allDay: true,
  }));

  // Get next three upcoming events
  const upcomingEvents = [...events]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  // Handler for mini calendar click
  const handleMiniCalendarClick = () => {
    navigate('/events/calendar');
  };

  // Handler for clicking an event in the mini calendar
  const handleSelectEvent = (event) => {
    navigate(`/events/${event.id}`);
  };

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
              {event.type === 'stella-generated' && (
                <Sparkles className="w-4 h-4 text-purple-500" title="Stella Generated" />
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
          <button 
            onClick={() => handleViewEvent(event.id)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </button>
          <button 
            onClick={() => handleEditEvent(event.id)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
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
              {event.type === 'stella-generated' && (
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
          <button 
            onClick={() => handleViewEvent(event.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleEditEvent(event.id)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeleteEvent(event.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
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
          <button 
            onClick={handleCreateManually}
            className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Create Manually
          </button>
        </div>

        {/* Stella Assisted */}
        <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors bg-purple-50">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-900">Stella Assisted</h3>
              <p className="text-sm text-purple-700">Stella's suggestions with your control</p>
            </div>
          </div>
          <ul className="text-sm text-purple-700 space-y-2 mb-4">
            <li>• Stella-generated suggestions</li>
            <li>• Smart template recommendations</li>
            <li>• Automated task suggestions</li>
            <li>• Budget estimation help</li>
          </ul>
          <button 
            onClick={handleCreateWithStella}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create with Stella's Help
          </button>
        </div>

        {/* Stella Automated */}
        <div className="border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition-colors bg-pink-50">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-pink-600" />
            <div>
              <h3 className="font-semibold text-pink-900">Stella Automated</h3>
              <p className="text-sm text-pink-700">Complete workflow generation</p>
            </div>
          </div>
          <ul className="text-sm text-pink-700 space-y-2 mb-4">
            <li>• Complete workflow creation</li>
            <li>• Automated timeline & tasks</li>
            <li>• Budget & profit projections</li>
            <li>• Communication campaigns</li>
          </ul>
          <button 
            onClick={handleGenerateFullWorkflow}
            className="w-full py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Generate Full Workflow
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Events Dashboard</h1>
        <button
          onClick={handleCreateManually}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow min-w-[160px]"
        >
          + Create Event
        </button>
      </div>
      {/* Upcoming Events Preview */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <div
                key={event.id}
                className="bg-white border border-blue-100 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition min-h-[170px] flex flex-col justify-between"
                onClick={() => handleViewEvent(event.id)}
                tabIndex={0}
                aria-label={`View details for ${event.name}`}
                onKeyDown={e => { if (e.key === 'Enter') handleViewEvent(event.id); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-700 text-lg">{event.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>{event.status}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1 font-medium">{new Date(event.date).toLocaleDateString()}</div>
                <div className="mb-2 text-xs text-gray-500 flex-1">{event.description}</div>
                <div className="flex items-center gap-2 text-xs mt-2">
                  <span>Progress:</span>
                  <span className="font-semibold text-gray-800">{event.progress}%</span>
                  {event.progress < 100 && <span className="text-red-500 ml-2">Action Needed</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 col-span-full py-8 text-center text-base">No upcoming events. <button onClick={handleCreateManually} className="text-blue-600 underline ml-2">Create one now</button></div>
          )}
        </div>
      </div>
      {/* Mini Calendar - below cards on laptop/desktop */}
      <div className="w-full max-w-xl mx-auto mt-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Calendar</h2>
            <button
              onClick={handleMiniCalendarClick}
              className="text-blue-600 hover:underline text-sm"
            >
              View Full Calendar
            </button>
          </div>
          <div className="cursor-pointer" onClick={handleMiniCalendarClick}>
            <BigCalendar
              localizer={localizer}
              events={calendarEvents.map(ev => ({ ...ev, 
                // Add a color for event dots
                resource: { dotColor: '#2563eb' } 
              }))}
              startAccessor="start"
              endAccessor="end"
              views={['month']}
              style={{ height: 300 }}
              toolbar={false}
              selectable={false}
              popup={false}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: 'transparent',
                  color: '#2563eb',
                  border: 'none',
                  position: 'relative',
                },
                className: 'calendar-event-dot',
              })}
              components={{
                event: ({ event }) => (
                  <span style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: event.resource?.dotColor || '#2563eb',
                    margin: 2,
                  }} />
                )
              }}
            />
          </div>
        </div>
      </div>
      {/* Event Grid/List (existing code) */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8' : 'space-y-4 mt-8'}>
        {events.map(event => (
          viewMode === 'grid' ? 
            <EventCard key={event.id} event={event} /> : 
            <EventRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventsDashboard;
