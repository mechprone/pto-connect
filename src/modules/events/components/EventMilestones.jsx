import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Progress, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common';
import { Plus, Calendar, CheckCircle, Clock, AlertTriangle, Edit, Trash2, Flag } from 'lucide-react';
import { eventsAPI } from '@/utils/api';
import AddMilestoneModal from './AddMilestoneModal';

const EventMilestones = ({ eventId, onMilestoneUpdated }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    loadMilestones();
  }, [eventId]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.getEventMilestones(eventId);
      // Ensure we always set an array, even if response.data is null/undefined
      setMilestones(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load milestones');
      setMilestones([]); // Reset to empty array on error
      console.error('Error loading milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
  };

  const handleMilestoneUpdated = () => {
    setShowAddMilestone(false);
    loadMilestones();
    if (onMilestoneUpdated) onMilestoneUpdated();
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    
    try {
      await eventsAPI.deleteMilestone(eventId, milestoneId);
      loadMilestones();
      if (onMilestoneUpdated) onMilestoneUpdated();
    } catch (err) {
      console.error('Error deleting milestone:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'upcoming': return <Calendar className="h-5 w-5 text-gray-600" />;
      case 'overdue': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  // Defensive check to ensure milestones is always an array
  const safeMilestones = Array.isArray(milestones) ? milestones : [];
  
  const sortedMilestones = [...safeMilestones].sort((a, b) => {
    if (!a.target_date && !b.target_date) return 0;
    if (!a.target_date) return 1;
    if (!b.target_date) return -1;
    return new Date(a.target_date) - new Date(b.target_date);
  });

  const completedMilestones = safeMilestones.filter(m => m.status === 'completed').length;
  const totalMilestones = safeMilestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

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
        <Button onClick={loadMilestones} variant="outline" className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Milestones ({safeMilestones.length})</h2>
        <Button onClick={() => setShowAddMilestone(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <span className="text-sm text-gray-600">
            {completedMilestones} of {totalMilestones} completed
          </span>
        </div>
        <Progress value={progressPercentage} className="mb-2" />
        <p className="text-sm text-gray-600">
          {progressPercentage.toFixed(1)}% complete
        </p>
      </Card>

      {/* Milestones Timeline */}
      <div className="space-y-4">
        {sortedMilestones.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No milestones created yet.</p>
            <Button onClick={() => setShowAddMilestone(true)} variant="outline">
              Add First Milestone
            </Button>
          </Card>
        ) : (
          sortedMilestones.map((milestone, index) => (
            <Card key={milestone.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Timeline Connector */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  {index < sortedMilestones.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                  )}
                </div>

                {/* Milestone Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(milestone.status)}
                      <h3 className="font-semibold text-lg">{milestone.title}</h3>
                      <Badge className={getStatusColor(milestone.status)}>
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMilestoneClick(milestone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {milestone.description && (
                    <p className="text-gray-600 mb-3">{milestone.description}</p>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    {milestone.target_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Target: {new Date(milestone.target_date).toLocaleDateString()}
                      </div>
                    )}
                    {milestone.completed_date && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed: {new Date(milestone.completed_date).toLocaleDateString()}
                      </div>
                    )}
                    {milestone.estimated_hours && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {milestone.estimated_hours}h estimated
                      </div>
                    )}
                    {milestone.estimated_cost && (
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        {milestone.estimated_cost} estimated
                      </div>
                    )}
                  </div>

                  {/* Associated Tasks */}
                  {milestone.associated_tasks && milestone.associated_tasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Associated Tasks:</p>
                      <div className="space-y-1">
                        {milestone.associated_tasks.map((task) => (
                          <div key={task.id} className="flex items-center space-x-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span className={task.status === 'completed' ? 'line-through text-gray-500' : ''}>
                              {task.title}
                            </span>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <Dialog open={true} onOpenChange={() => setSelectedMilestone(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                {getStatusIcon(selectedMilestone.status)}
                <span>Milestone Details</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedMilestone.title}</h3>
                <Badge className={getStatusColor(selectedMilestone.status)}>
                  {selectedMilestone.status.replace('_', ' ')}
                </Badge>
              </div>

              {selectedMilestone.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedMilestone.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedMilestone.target_date && (
                  <div>
                    <h4 className="font-medium mb-1">Target Date</h4>
                    <p className="text-gray-600">
                      {new Date(selectedMilestone.target_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedMilestone.completed_date && (
                  <div>
                    <h4 className="font-medium mb-1">Completed Date</h4>
                    <p className="text-gray-600">
                      {new Date(selectedMilestone.completed_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedMilestone.estimated_hours && (
                  <div>
                    <h4 className="font-medium mb-1">Estimated Hours</h4>
                    <p className="text-gray-600">{selectedMilestone.estimated_hours}h</p>
                  </div>
                )}
                {selectedMilestone.estimated_cost && (
                  <div>
                    <h4 className="font-medium mb-1">Estimated Cost</h4>
                    <p className="text-gray-600">${selectedMilestone.estimated_cost}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <AddMilestoneModal
          eventId={eventId}
          onClose={() => setShowAddMilestone(false)}
          onMilestoneAdded={handleMilestoneUpdated}
        />
      )}
    </div>
  );
};

export default EventMilestones; 