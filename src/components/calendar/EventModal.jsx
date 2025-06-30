import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Textarea, Select, Label } from '@/components/common';
import { X, Calendar, Clock, MapPin, Repeat, Palette } from 'lucide-react';

const EVENT_TYPE_OPTIONS = [
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

const COLOR_OPTIONS = [
  { value: '#f59e42', label: 'Orange' },
  { value: '#2563eb', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#a78bfa', label: 'Purple' },
];

const RECURRENCE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const EventModal = ({ open, onClose, onSave, initialEventData }) => {
  const [form, setForm] = useState({
    title: '',
    type: 'other',
    start: '',
    end: '',
    allDay: true,
    location: '',
    description: '',
    color: '#a78bfa',
    recurrence: '',
    rrule: '',
    ...initialEventData
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      title: '',
      type: 'other',
      start: '',
      end: '',
      allDay: true,
      location: '',
      description: '',
      color: '#a78bfa',
      recurrence: '',
      rrule: '',
      ...initialEventData
    });
  }, [initialEventData, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRecurrenceChange = (value) => {
    handleChange('recurrence', value);
    if (!value) {
      handleChange('rrule', '');
      return;
    }
    // Simple rrule string for demo; production should use a builder
    let rrule = `FREQ=${value.toUpperCase()}`;
    if (form.start) {
      rrule += `;DTSTART=${form.start.replace(/[-:]/g, '').slice(0, 15)}`;
    }
    handleChange('rrule', rrule);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.start) {
      setError('Title and start date are required.');
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{form.id ? 'Edit Event' : 'Create Event'}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={form.title} onChange={e => handleChange('title', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" value={form.type} onChange={e => handleChange('type', e.target.value)} options={EVENT_TYPE_OPTIONS} />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select id="color" value={form.color} onChange={e => handleChange('color', e.target.value)} options={COLOR_OPTIONS} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Start Date</Label>
              <Input id="start" type="datetime-local" value={form.start} onChange={e => handleChange('start', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="end">End Date</Label>
              <Input id="end" type="datetime-local" value={form.end} onChange={e => handleChange('end', e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={e => handleChange('location', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select id="recurrence" value={form.recurrence} onChange={e => handleRecurrenceChange(e.target.value)} options={RECURRENCE_OPTIONS} />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{form.id ? 'Save Changes' : 'Create Event'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal; 