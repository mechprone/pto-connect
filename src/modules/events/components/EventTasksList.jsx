import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Select, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common';
import { Plus, Filter, Search, Edit, Trash2, MessageSquare, Paperclip, Calendar, User, Flag } from 'lucide-react';
import { eventsAPI } from '@/utils/api';
import TaskDetailModal from './TaskDetailModal';
import AddTaskModal from './AddTaskModal';

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
      const response = await eventsAPI.getEventTasks(eventId);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
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
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
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

  const filteredTasks = tasks.filter(task => {
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
        <h2 className="text-2xl font-bold">Tasks ({tasks.length})</h2>
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
          <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </Select>
          <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
            <option value="all">All Categories</option>
            <option value="marketing">Marketing</option>
            <option value="volunteers">Volunteers</option>
            <option value="budget">Budget</option>
            <option value="logistics">Logistics</option>
            <option value="venue">Venue</option>
            <option value="supplies">Supplies</option>
            <option value="other">Other</option>
          </Select>
          <Select value={filters.assigned} onValueChange={(value) => setFilters({...filters, assigned: value})}>
            <option value="all">All Assignments</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </Select>
        </div>
      </Card>

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </Select>
        </div>
        <span className="text-sm text-gray-600">
          {filteredTasks.length} of {tasks.length} tasks
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