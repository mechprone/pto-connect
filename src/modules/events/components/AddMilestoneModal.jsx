import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Textarea, Label } from '@/components/common';
import { X, Calendar, Clock, DollarSign } from 'lucide-react';
import { api } from '@/utils/api';

const AddMilestoneModal = ({ eventId, onClose, onMilestoneAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    estimated_hours: '',
    estimated_cost: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Milestone title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const milestoneData = {
        ...formData,
        event_id: eventId,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null
      };

      await api.post('/milestones', milestoneData);
      onMilestoneAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create milestone');
      console.error('Error creating milestone:', err);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Add New Milestone</span>
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
              <Label htmlFor="title">Milestone Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter milestone title..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the milestone..."
                rows={3}
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <Label htmlFor="target_date" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Target Date
            </Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => handleInputChange('target_date', e.target.value)}
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
              {loading ? 'Creating...' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMilestoneModal; 