import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Textarea, Select, Label } from '@/components/common';
import { X, Calendar, User, Clock, DollarSign, Flag } from 'lucide-react';
import { eventsAPI, profileAPI } from '@/utils/api';
import { toast } from 'react-toastify';

const AddTaskModal = ({ eventId, onClose, onTaskAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    assigned_to_external: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    category: 'other',
    estimated_hours: '',
    estimated_cost: '',
    parent_task_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [parentTasks, setParentTasks] = useState([]);

  useEffect(() => {
    loadUsers();
    loadParentTasks();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('🔍 [AddTaskModal] Loading users...');
      const response = await profileAPI.getUsers();
      console.log('📊 [AddTaskModal] Users response:', response);
      
      // Handle the response structure from /api/profiles endpoint
      const userList = Array.isArray(response.data?.profiles) ? response.data.profiles : 
                      Array.isArray(response.data) ? response.data : [];
      
      console.log('👥 [AddTaskModal] User list:', userList);
      
      // Sort alphabetically by name
      const sortedUsers = userList.sort((a, b) => {
        const nameA = a.full_name || (a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.email) || '';
        const nameB = b.full_name || (b.first_name && b.last_name ? `${b.first_name} ${b.last_name}` : b.email) || '';
        return nameA.localeCompare(nameB);
      });
      
      console.log('✅ [AddTaskModal] Sorted users:', sortedUsers);
      setUsers(sortedUsers);
    } catch (err) {
      console.error('❌ [AddTaskModal] Error loading users:', err);
      setUsers([]); // Set empty array on error to prevent crashes
    }
  };

  const loadParentTasks = async () => {
    try {
      const response = await eventsAPI.getEventTasks(eventId);
      // Ensure we have an array and filter out completed tasks
      const taskList = Array.isArray(response.data) ? response.data : [];
      setParentTasks(taskList.filter(task => task.status !== 'completed'));
    } catch (err) {
      console.error('Error loading parent tasks:', err);
      setParentTasks([]); // Set empty array on error to prevent crashes
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const taskData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        assigned_to: formData.assigned_to || null,
        parent_task_id: formData.parent_task_id || null
      };

      await eventsAPI.createTask(eventId, taskData);
      if (taskData.assigned_to) {
        toast.success(`Task assigned to ${taskData.assigned_to}`);
      }
      onTaskAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Add New Task</span>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="flex items-center">
                <span className="mr-2">Task Title *</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assigned_to" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Assign to Member
              </Label>
              <Select
                value={formData.assigned_to}
                onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                options={[
                  { value: '', label: 'Select a member...' },
                  ...users.map(user => ({
                    value: user.id,
                    label: user.full_name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email)
                  }))
                ]}
              />
            </div>

            <div>
              <Label htmlFor="assigned_to_external">External Assignment</Label>
              <Input
                id="assigned_to_external"
                value={formData.assigned_to_external}
                onChange={(e) => handleInputChange('assigned_to_external', e.target.value)}
                placeholder="e.g., Principal, Facilities Manager"
              />
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" className="flex items-center">
                <Flag className="h-4 w-4 mr-2" />
                Priority
              </Label>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'blocked', label: 'Blocked' }
                ]}
              />
            </div>
          </div>

          {/* Category and Parent Task */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={[
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'volunteers', label: 'Volunteers' },
                  { value: 'budget', label: 'Budget' },
                  { value: 'logistics', label: 'Logistics' },
                  { value: 'venue', label: 'Venue' },
                  { value: 'supplies', label: 'Supplies' },
                  { value: 'other', label: 'Other' }
                ]}
              />
            </div>

            <div>
              <Label htmlFor="parent_task_id">Parent Task (Optional)</Label>
              <Select
                value={formData.parent_task_id}
                onChange={(e) => handleInputChange('parent_task_id', e.target.value)}
                options={[
                  { value: '', label: 'No parent task' },
                  ...parentTasks.map(task => ({
                    value: task.id,
                    label: task.title
                  }))
                ]}
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="due_date" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Due Date
            </Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
            />
          </div>

          {/* Estimates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_hours" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Estimated Hours
              </Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div>
              <Label htmlFor="estimated_cost" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Estimated Cost
              </Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_cost}
                onChange={(e) => handleInputChange('estimated_cost', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal; 