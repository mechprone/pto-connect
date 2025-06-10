import React, { useState } from 'react';
import { Calendar, Clock, Repeat, AlertCircle, Plus, X } from 'lucide-react';

const SchedulingStep = ({ data, onUpdate }) => {
  const [showRecurring, setShowRecurring] = useState(data.recurring || false);

  const recurringPatterns = [
    { value: 'daily', label: 'Daily', description: 'Every day' },
    { value: 'weekly', label: 'Weekly', description: 'Every week on the same day' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
    { value: 'monthly', label: 'Monthly', description: 'Same date each month' },
    { value: 'monthly_weekday', label: 'Monthly (Weekday)', description: 'Same weekday each month (e.g., 2nd Tuesday)' },
    { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
    { value: 'yearly', label: 'Yearly', description: 'Same date each year' },
    { value: 'custom', label: 'Custom', description: 'Define custom pattern' }
  ];

  const handleInputChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const handleRecurringToggle = (enabled) => {
    setShowRecurring(enabled);
    onUpdate({ recurring: enabled });
    if (!enabled) {
      onUpdate({
        recurring_pattern: 'weekly',
        recurring_end_date: '',
        recurring_count: '',
        recurring_days: []
      });
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinEndDate = () => {
    if (!data.event_date) return getMinDate();
    return data.event_date;
  };

  const validateTimes = () => {
    if (!data.start_time || !data.end_time) return true;
    return data.start_time < data.end_time;
  };

  const getEventDayOfWeek = () => {
    if (!data.event_date) return '';
    const date = new Date(data.event_date);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getEventDateOrdinal = () => {
    if (!data.event_date) return '';
    const date = new Date(data.event_date);
    const dayOfMonth = date.getDate();
    const weekOfMonth = Math.ceil(dayOfMonth / 7);
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th'];
    return `${ordinals[weekOfMonth]} ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Basic Date and Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Date */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Event Date *
            </label>
            <input
              type="date"
              value={formatDateForInput(data.event_date)}
              onChange={(e) => handleInputChange('event_date', e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {data.event_date && (
              <p className="text-sm text-gray-500 mt-1">
                {new Date(data.event_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>

          {/* Duration Preset Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '1 Hour', start: '18:00', end: '19:00' },
                { label: '2 Hours', start: '18:00', end: '20:00' },
                { label: '3 Hours', start: '17:00', end: '20:00' },
                { label: 'All Day', start: '09:00', end: '21:00' }
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    handleInputChange('start_time', preset.start);
                    handleInputChange('end_time', preset.end);
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Time */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time
              </label>
              <input
                type="time"
                value={data.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={data.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {!validateTimes() && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              End time must be after start time
            </div>
          )}

          {data.start_time && data.end_time && validateTimes() && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Duration:</strong> {
                (() => {
                  const start = new Date(`2000-01-01T${data.start_time}`);
                  const end = new Date(`2000-01-01T${data.end_time}`);
                  const diff = (end - start) / (1000 * 60 * 60);
                  return `${diff} hour${diff !== 1 ? 's' : ''}`;
                })()
              }
            </div>
          )}
        </div>
      </div>

      {/* Recurring Events */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Repeat className="w-5 h-5 mr-2" />
              Recurring Event
            </h3>
            <p className="text-sm text-gray-600">Create multiple instances of this event</p>
          </div>
          <button
            onClick={() => handleRecurringToggle(!showRecurring)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${showRecurring ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${showRecurring ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {showRecurring && (
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            {/* Recurring Pattern */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat Pattern
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recurringPatterns.map((pattern) => (
                  <div
                    key={pattern.value}
                    onClick={() => handleInputChange('recurring_pattern', pattern.value)}
                    className={`
                      p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${data.recurring_pattern === pattern.value
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="font-medium text-sm">{pattern.label}</div>
                    <div className="text-xs text-gray-600">{pattern.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern-specific information */}
            {data.recurring_pattern && data.event_date && (
              <div className="bg-white p-3 rounded border">
                <div className="text-sm">
                  <strong>This event will repeat:</strong>
                  <div className="mt-1 text-gray-600">
                    {data.recurring_pattern === 'weekly' && `Every ${getEventDayOfWeek()}`}
                    {data.recurring_pattern === 'biweekly' && `Every other ${getEventDayOfWeek()}`}
                    {data.recurring_pattern === 'monthly' && `On the ${new Date(data.event_date).getDate()}${
                      ['th', 'st', 'nd', 'rd'][((new Date(data.event_date).getDate() % 100) - 20) % 10] || 
                      ['th', 'st', 'nd', 'rd'][new Date(data.event_date).getDate() % 100] || 'th'
                    } of each month`}
                    {data.recurring_pattern === 'monthly_weekday' && `On the ${getEventDateOrdinal()} of each month`}
                    {data.recurring_pattern === 'yearly' && `Every year on ${new Date(data.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                  </div>
                </div>
              </div>
            )}

            {/* End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Recurring On
                </label>
                <input
                  type="date"
                  value={formatDateForInput(data.recurring_end_date)}
                  onChange={(e) => handleInputChange('recurring_end_date', e.target.value)}
                  min={getMinEndDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or After # Occurrences
                </label>
                <input
                  type="number"
                  value={data.recurring_count || ''}
                  onChange={(e) => handleInputChange('recurring_count', e.target.value)}
                  placeholder="e.g., 10"
                  min="1"
                  max="52"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Preview of upcoming dates */}
            {data.event_date && data.recurring_pattern && (
              <div className="bg-white p-3 rounded border">
                <div className="text-sm font-medium text-gray-700 mb-2">Preview of upcoming dates:</div>
                <div className="text-xs text-gray-600 space-y-1">
                  {/* This would be calculated based on the pattern */}
                  <div>• {new Date(data.event_date).toLocaleDateString()}</div>
                  <div>• Next occurrence will be calculated based on pattern</div>
                  <div className="text-blue-600 mt-2">
                    ℹ️ Full schedule will be generated when event is created
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Messages */}
      <div className="space-y-2">
        {!data.event_date && (
          <div className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Event date is required to continue
          </div>
        )}
        {showRecurring && !data.recurring_end_date && !data.recurring_count && (
          <div className="text-sm text-amber-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Please specify when the recurring event should end
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulingStep;
