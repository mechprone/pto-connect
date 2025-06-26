import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common';
import { Calendar, CheckCircle, Clock, AlertTriangle, Users, FileText, MessageSquare, Paperclip } from 'lucide-react';
import { api } from '@/utils/api';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [event, setEvent] = useState(null);
  const [eventSummary, setEventSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventResponse, summaryResponse] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/summary`)
      ]);

      setEvent(eventResponse.data);
      setEventSummary(summaryResponse.data);
    } catch (err) {
      setError('Failed to load event data');
      console.error('Error loading event data:', err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-600 mt-2">{event.description}</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowAddTask(true)} className="bg-blue-600 hover:bg-blue-700">
              Add Task
            </Button>
            <Button onClick={() => setShowAddMilestone(true)} variant="outline">
              Add Milestone
            </Button>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Event Date</p>
                <p className="font-semibold">{new Date(event.event_date).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-semibold">{event.start_time || 'TBD'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Event Lead</p>
                <p className="font-semibold">{event.event_lead ? 'Assigned' : 'Unassigned'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
              <TaskProgressChart eventId={eventId} />
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

        <TabsContent value="tasks">
          <EventTasksList eventId={eventId} onTaskUpdated={loadEventData} />
        </TabsContent>

        <TabsContent value="milestones">
          <EventMilestones eventId={eventId} onMilestoneUpdated={loadEventData} />
        </TabsContent>

        <TabsContent value="issues">
          <EventIssues eventId={eventId} onIssueUpdated={loadEventData} />
        </TabsContent>

        <TabsContent value="sponsorships">
          <EventSponsorships eventId={eventId} onSponsorshipUpdated={loadEventData} />
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