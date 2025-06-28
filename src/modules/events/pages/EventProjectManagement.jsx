import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger, Input } from '@/components/common';
import { Calendar, CheckCircle, Clock, AlertTriangle, Users, FileText, MessageSquare, Paperclip, Edit2, Save, X, MapPin, DollarSign } from 'lucide-react';
import { eventsAPI } from '@/utils/api';
import EventTasksList from '../components/EventTasksList';
import EventMilestones from '../components/EventMilestones';
import EventIssues from '../components/EventIssues';
import EventSponsorships from '../components/EventSponsorships';
import TaskProgressChart from '../components/TaskProgressChart';
import AddTaskModal from '../components/AddTaskModal';
import AddMilestoneModal from '../components/AddMilestoneModal';

const EventProjectManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  // Get initial tab from localStorage or default to 'overview' - use lazy initial state
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(`eventManagement_${eventId}_activeTab`);
    return savedTab || 'overview';
  });
  const [event, setEvent] = useState(null);
  const [eventSummary, setEventSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventId && !event) {
      loadEventData();
    }
  }, [eventId]);

  // Prevent data reload on window focus if we already have data
  useEffect(() => {
    const handleFocus = () => {
      // Only reload if the data is stale (more than 5 minutes old)
      const lastLoad = localStorage.getItem(`eventManagement_${eventId}_lastLoad`);
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      if (!lastLoad || parseInt(lastLoad) < fiveMinutesAgo) {
        console.log('🔄 Reloading stale event data on window focus');
        loadEventData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [eventId]);

  // Save tab state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`eventManagement_${eventId}_activeTab`, activeTab);
  }, [activeTab, eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventResponse, summaryResponse] = await Promise.all([
        eventsAPI.getEvent(eventId),
        eventsAPI.getEventSummary(eventId)
      ]);

      setEvent(eventResponse.data);
      setEventSummary(summaryResponse.data);
      setEditedEvent(eventResponse.data); // Initialize edit state
      
      // Store timestamp to prevent unnecessary reloads
      localStorage.setItem(`eventManagement_${eventId}_lastLoad`, Date.now().toString());
    } catch (err) {
      setError('Failed to load event data');
      console.error('Error loading event data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedEvent({ ...event });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedEvent({ ...event });
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await eventsAPI.updateEvent(eventId, editedEvent);
      setEvent(editedEvent);
      setIsEditing(false);
      // Reload summary in case any changes affect it
      loadEventData();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleTaskAdded = () => {
    setShowAddTask(false);
    loadEventData();
  };

  const handleMilestoneAdded = () => {
    setShowAddMilestone(false);
    loadEventData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Event</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/events')} variant="outline">
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The requested event could not be found.</p>
          <Button onClick={() => navigate('/events')} variant="outline">
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentEvent = isEditing ? editedEvent : event;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header with Event Management Title */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <FileText className="h-7 w-7 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
            </div>
            {isEditing ? (
              <Input
                value={editedEvent.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="text-2xl font-semibold text-blue-700 border-2 border-blue-300 mb-2 bg-white"
                placeholder="Event Title"
              />
            ) : (
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">{currentEvent?.title || 'Loading event...'}</h2>
            )}
            {isEditing ? (
              <textarea
                value={editedEvent.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full text-gray-600 border border-gray-300 rounded-md p-2 resize-none bg-white"
                rows="2"
                placeholder="Event Description"
              />
            ) : (
              <p className="text-gray-600 text-lg">{currentEvent?.description || 'No description available'}</p>
            )}
          </div>
          <div className="flex items-center space-x-3 ml-6">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSaveEdit} 
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleCancelEdit} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            )}
            <Button onClick={() => setShowAddTask(true)} className="bg-blue-600 hover:bg-blue-700">
              Add Task
            </Button>
            <Button onClick={() => setShowAddMilestone(true)} variant="outline">
              Add Milestone
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Event Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Event Date</p>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedEvent.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  className="font-semibold"
                />
              ) : (
                <p className="font-semibold">
                  {currentEvent.event_date === 'Invalid Date' || !currentEvent.event_date 
                    ? 'Invalid Date' 
                    : new Date(currentEvent.event_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Start Time</p>
              {isEditing ? (
                <Input
                  type="time"
                  value={editedEvent.start_time || ''}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className="font-semibold"
                />
              ) : (
                <p className="font-semibold">{currentEvent.start_time || 'TBD'}</p>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-gray-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Location</p>
              {isEditing ? (
                <Input
                  value={editedEvent.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="font-semibold"
                  placeholder="Event Location"
                />
              ) : (
                <p className="font-semibold">{currentEvent.location || 'TBD'}</p>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-gray-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Status</p>
              {isEditing ? (
                <select
                  value={editedEvent.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="font-semibold border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                <Badge className={getStatusColor(currentEvent.status)}>
                  {currentEvent.status}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      {eventSummary && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Event Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
              <div className="flex items-center">
                <Progress value={eventSummary.progress_percentage} className="flex-1 mr-3" />
                <span className="text-lg font-semibold">{eventSummary.progress_percentage}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Tasks</p>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-green-600">{eventSummary.completed_tasks}</span>
                <span className="text-gray-400">/</span>
                <span className="text-2xl font-bold">{eventSummary.total_tasks}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Milestones</p>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-blue-600">{eventSummary.completed_milestones}</span>
                <span className="text-gray-400">/</span>
                <span className="text-2xl font-bold">{eventSummary.milestones_count}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Open Issues</p>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-red-600">{eventSummary.open_issues}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Tabs with State Persistence */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="sponsorships">Sponsorships</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Task Progress Chart</h3>
              <div className="min-h-[300px]">
                <TaskProgressChart eventId={eventId} />
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Task completed</p>
                    <p className="text-sm text-gray-600">"Set up venue" marked as complete</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Comment added</p>
                    <p className="text-sm text-gray-600">New comment on "Order supplies" task</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Issue reported</p>
                    <p className="text-sm text-gray-600">"Venue availability" issue opened</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="min-h-[400px]">
            <EventTasksList 
              eventId={eventId} 
              onTaskUpdated={loadEventData}
              key={`tasks-${eventId}`} 
            />
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <div className="min-h-[400px]">
            <EventMilestones 
              eventId={eventId} 
              onMilestoneUpdated={loadEventData}
              key={`milestones-${eventId}`}
            />
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <div className="min-h-[400px]">
            <EventIssues 
              eventId={eventId} 
              onIssueUpdated={loadEventData}
              key={`issues-${eventId}`}
            />
          </div>
        </TabsContent>

        <TabsContent value="sponsorships" className="space-y-6">
          <div className="min-h-[400px]">
            <EventSponsorships 
              eventId={eventId} 
              onSponsorshipUpdated={loadEventData}
              key={`sponsorships-${eventId}`}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showAddTask && (
        <AddTaskModal
          eventId={eventId}
          onClose={() => setShowAddTask(false)}
          onTaskAdded={handleTaskAdded}
        />
      )}

      {showAddMilestone && (
        <AddMilestoneModal
          eventId={eventId}
          onClose={() => setShowAddMilestone(false)}
          onMilestoneAdded={handleMilestoneAdded}
        />
      )}
    </div>
  );
};

export default EventProjectManagement; 