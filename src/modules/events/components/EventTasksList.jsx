import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Select, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common';
import { Plus, Filter, Search, Edit, Trash2, MessageSquare, Paperclip, Calendar, User, Flag } from 'lucide-react';
import { eventsAPI } from '@/utils/api';
import TaskDetailModal from './TaskDetailModal';
import AddTaskModal from './AddTaskModal';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'react-toastify';

const EventTasksList = ({ eventId, onTaskUpdated }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assigned: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('due_date');
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [eventId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to refresh session before making API call
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 [DEBUG] Session check before API call:', {
        hasSession: !!session,
        hasToken: !!session?.access_token,
        tokenLength: session?.access_token?.length,
        sessionError
      });
      
      if (!session?.access_token) {
        console.warn('⚠️ [DEBUG] No valid session found, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        console.log('🔍 [DEBUG] Session refresh result:', {
          hasRefreshSession: !!refreshData?.session,
          refreshError
        });
      }
      
      const response = await eventsAPI.getEventTasks(eventId);
      // Ensure we always set an array, even if response.data is null/undefined
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('❌ [DEBUG] Full error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });
      setError('Failed to load tasks - Authentication issue. Please try refreshing the page.');
      setTasks([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskUpdated = () => {
    setShowTaskDetail(false);
    setShowAddTask(false);
    loadTasks();
    if (onTaskUpdated) onTaskUpdated();
    // Show notification if task was assigned
    if (selectedTask && selectedTask.assigned_to) {
      toast.success(`Task assigned to ${selectedTask.assigned_to}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await eventsAPI.deleteTask(eventId, taskId);
      loadTasks();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'marketing': return '📢';
      case 'volunteers': return '👥';
      case 'budget': return '💰';
      case 'logistics': return '📦';
      case 'venue': return '🏢';
      case 'supplies': return '📋';
      default: return '📝';
    }
  };

  // Defensive check to ensure tasks is always an array - MOVED TO TOP
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = safeTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesCategory = filters.category === 'all' || task.category === filters.category;
    const matchesAssigned = filters.assigned === 'all' || 
                           (filters.assigned === 'assigned' && task.assigned_to) ||
                           (filters.assigned === 'unassigned' && !task.assigned_to);

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssigned;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        const statusOrder = { pending: 1, in_progress: 2, completed: 3, blocked: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadTasks} variant="outline" className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks ({safeTasks.length})</h2>
        <Button onClick={() => setShowAddTask(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'blocked', label: 'Blocked' }
            ]}
          />
          <Select 
            value={filters.priority} 
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
          />
          <Select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'volunteers', label: 'Volunteers' },
              { value: 'budget', label: 'Budget' },
              { value: 'logistics', label: 'Logistics' },
              { value: 'venue', label: 'Venue' },
              { value: 'supplies', label: 'Supplies' },
              { value: 'other', label: 'Other' }
            ]}
          />
          <Select 
            value={filters.assigned} 
            onChange={(e) => setFilters({...filters, assigned: e.target.value})}
            options={[
              { value: 'all', label: 'All Assignments' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'unassigned', label: 'Unassigned' }
            ]}
          />
        </div>
      </Card>

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'due_date', label: 'Due Date' },
              { value: 'priority', label: 'Priority' },
              { value: 'status', label: 'Status' },
              { value: 'title', label: 'Title' }
            ]}
          />
        </div>
        <span className="text-sm text-gray-600">
          {filteredTasks.length} of {safeTasks.length} tasks
        </span>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No tasks found matching your criteria.</p>
            <Button onClick={() => setShowAddTask(true)} variant="outline" className="mt-4">
              Add First Task
            </Button>
          </Card>
        ) : (
          sortedTasks.map((task) => (
            <Card key={task.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{getCategoryIcon(task.category)}</span>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)}>
                      <Flag className="h-3 w-3 mr-1" />
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    {task.due_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                    {task.assigned_to && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Assigned
                      </div>
                    )}
                    {task.estimated_hours && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {task.estimated_hours}h
                      </div>
                    )}
                    {task.estimated_cost && (
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        {task.estimated_cost}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          eventId={eventId}
          onClose={() => setShowAddTask(false)}
          onTaskAdded={handleTaskUpdated}
        />
      )}
    </div>
  );
};

export default EventTasksList; 