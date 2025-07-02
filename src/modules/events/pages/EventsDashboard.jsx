import React, { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '@/utils/supabaseClient';
import Button from '@/components/common/Button';
import { useGlobalCache } from '@/utils/globalCache';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Pastel color palette
const pastelBg = 'bg-gradient-to-br from-pink-100 via-purple-100 to-teal-100';
const pastelBox = 'bg-white bg-opacity-80 rounded-2xl shadow-lg border border-purple-100';

const stellaTipsFallback = [
  'Leverage student leadership: Assign older students as event ambassadors to boost peer engagement and reduce adult volunteer burnout.',
  'Use QR codes at events for instant feedback or sign-ups—capture data while excitement is high.',
  'Partner with local media or school journalism clubs to document and promote your event, increasing community reach.',
  'Schedule a "debrief" meeting after each event to document what worked, what didn\'t, and ideas for next year—build institutional memory.',
  'Offer tiered volunteer roles (short shifts, behind-the-scenes, remote tasks) to include parents with limited availability.',
  'Create a "Volunteer Wall of Fame" at school or online to recognize and celebrate contributors—public recognition increases future engagement.',
  'Bundle events with other school activities (e.g., parent-teacher conferences) to maximize turnout and convenience.',
  'Use a digital sign-up tool with automatic reminders to reduce no-shows and last-minute cancellations.',
  'Survey families after each event to gather actionable feedback and new ideas—share results at PTO meetings.',
  'Develop a sponsorship package and approach local businesses for recurring annual support, not just one-off donations.'
];

const EventsDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [creationMode, setCreationMode] = useState('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stellaTips, setStellaTips] = useState([]);
  const [stellaLoading, setStellaLoading] = useState(true);
  const [stellaError, setStellaError] = useState(null);

  // Memoize fetch events data function for global cache to prevent infinite re-renders
  const fetchEventsData = useCallback(async () => {
    // Get current user/org context
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id;
    if (!orgId) {
      throw new Error('Missing org_id in user metadata.');
    }
    const { data, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('org_id', orgId)
      .order('event_date', { ascending: true });
    if (eventsError) {
      throw new Error('Error loading events: ' + eventsError.message);
    }
    return data || [];
  }, []); // Empty dependency array since supabase calls are stable

  // Use global cache with 8 minute expiration for events dashboard
  const { data: cachedEvents, loading: cacheLoading, error: cacheError, refresh } = useGlobalCache(
    'events_dashboard', 
    fetchEventsData, 
    8 * 60 * 1000 // 8 minutes
  );

  // Update local state when cached data changes
  useEffect(() => {
    if (cachedEvents) {
      setEvents(cachedEvents);
    }
    setLoading(cacheLoading);
    setError(cacheError);
  }, [cachedEvents, cacheLoading, cacheError]);

  // Fetch Stella Insights (placeholder for backend call)
  useEffect(() => {
    async function fetchStellaTips() {
      setStellaLoading(true);
      setStellaError(null);
      try {
        // TODO: Replace with backend orchestrator call
        // const response = await fetch('/api/ai/stella-insights?...');
        // const data = await response.json();
        // setStellaTips(data.tips || stellaTipsFallback);
        setStellaTips(stellaTipsFallback.sort(() => 0.5 - Math.random()).slice(0, 3));
      } catch (err) {
        setStellaError('Could not load Stella Insights.');
        setStellaTips(stellaTipsFallback.slice(0, 3));
      } finally {
        setStellaLoading(false);
      }
    }
    fetchStellaTips();
  }, []);

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
    navigate(`/events/detail/${eventId}`);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/edit/${eventId}`);
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

  // Mini calendar events format
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.event_date),
    end: new Date(event.event_date),
    allDay: true,
  }));

  // Get next three upcoming events
  const now = new Date();
  const upcomingEvents = [...events]
    .filter(e => new Date(e.event_date) >= now)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 3);

  // Handler for mini calendar click
  const handleMiniCalendarClick = () => {
    navigate('/events/calendar');
  };

  // Handler for clicking an event in the mini calendar
  const handleSelectEvent = (event) => {
    navigate(`/events/detail/${event.id}`);
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
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              {event.type === 'stella-generated' && (
                <Sparkles className="w-4 h-4 text-purple-500" title="Stella Generated" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{event.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
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
            <div className="text-lg font-semibold text-gray-900">${event.estimated_budget || 'N/A'}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600">Projected Profit</div>
            <div className="text-lg font-semibold text-green-700">${event.profit}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex gap-2">
            <Button
              onClick={() => handleViewEvent(event.id)}
              className="flex-1 flex items-center justify-center rounded-lg"
              variant="default"
            >
              <Eye className="w-6 h-6 mr-2" />
              View
            </Button>
            <Button
              onClick={() => handleEditEvent(event.id)}
              className="flex-1 flex items-center justify-center rounded-lg"
              variant="outline"
            >
              <Edit className="w-6 h-6 mr-2" />
              Edit
            </Button>
          </div>
          <Button
            onClick={() => navigate(`/events/${event.id}/event-management`)}
            className="mt-2 flex items-center justify-center rounded-lg text-lg font-semibold bg-purple-600 hover:bg-purple-700"
            fullWidth
          >
            <Users className="w-7 h-7 mr-3" />
            Event Management
          </Button>
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
              <h3 className="font-medium text-gray-900">{event.title}</h3>
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
            <div className="font-medium">{new Date(event.event_date).toLocaleDateString()}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Attendees</div>
            <div className="font-medium">{event.attendees}</div>
              </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Budget</div>
            <div className="font-medium">${event.estimated_budget || 'N/A'}</div>
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

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      {/* Top Row: Stella Insights + Create Event (left), Mini Calendar (right) */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Insights + Create Event */}
        <div className="flex flex-col gap-4 md:w-1/2 max-w-md">
          <div className={`${pastelBox} p-6 min-h-[320px] flex flex-col justify-between`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-600 text-xl">✨</span>
              <span className="font-bold text-lg text-purple-700">Stella's Event Insights</span>
            </div>
            {stellaLoading ? (
              <div className="text-gray-500">Loading tips...</div>
            ) : stellaError ? (
              <div className="text-red-500">{stellaError}</div>
            ) : (
              <ul className="list-disc pl-5 text-purple-900 space-y-2">
                {stellaTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-xs text-purple-400">Tips powered by Stella AI</div>
          </div>
          <button
            onClick={handleCreateManually}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-400 via-purple-400 to-teal-400 shadow hover:from-pink-500 hover:to-teal-500 transition"
          >
            + Create Event
          </button>
        </div>
        {/* Right: Mini Calendar */}
        <div className="flex-1">
          <div className={`${pastelBox} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-purple-700">Calendar</h2>
              <button
                onClick={handleMiniCalendarClick}
                className="text-purple-600 hover:underline text-sm"
              >
                View Full Calendar
              </button>
            </div>
            <div className="cursor-pointer" onClick={handleMiniCalendarClick}>
              <BigCalendar
                localizer={localizer}
                events={calendarEvents.map(ev => ({ ...ev, resource: { dotColor: '#a78bfa' } }))}
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
                    color: '#a78bfa',
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
                      backgroundColor: event.resource?.dotColor || '#a78bfa',
                      margin: 2,
                    }} />
                  )
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Event Grid/List (existing code) */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8' : 'space-y-4 mt-8'}>
        {loading ? (
          <div className="text-gray-500 py-8 text-center text-base col-span-full">Loading events...</div>
        ) : error ? (
          <div className="text-red-500 py-8 text-center text-base col-span-full">{error}</div>
        ) : (
          events.map(event => (
            viewMode === 'grid' ? 
              <EventCard key={event.id} event={event} /> : 
              <EventRow key={event.id} event={event} />
          ))
        )}
            </div>
    </div>
  );
};

export default EventsDashboard;
