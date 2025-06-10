import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabaseClient';
import EventWizard from '@/components/events/EventWizard/EventWizard';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleEventSubmit = async (eventData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError('Authentication error. Please log in again.');
        return;
      }

      // Prepare the event data for submission
      const submissionData = {
        // Basic Info
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        school_level: eventData.school_level,
        visibility: eventData.visibility,
        share_public: eventData.share_public,
        
        // Scheduling
        event_date: eventData.event_date,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location,
        recurring: eventData.recurring,
        recurring_pattern: eventData.recurring_pattern,
        recurring_end_date: eventData.recurring_end_date,
        recurring_count: eventData.recurring_count,
        
        // Budget
        estimated_budget: eventData.estimated_budget,
        fundraising_goal: eventData.fundraising_goal,
        budget_categories: eventData.budget_categories,
        
        // Volunteers
        volunteer_coordinator: eventData.volunteer_coordinator,
        volunteer_requirements: eventData.volunteer_requirements,
        volunteer_opportunities: eventData.volunteer_opportunities
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(submissionData)
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to create event');
        return;
      }

      // Success! Navigate back to events dashboard
      navigate('/events', { 
        state: { 
          message: 'Event created successfully!',
          eventId: result.id 
        }
      });

    } catch (err) {
      setError('Failed to connect to server.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/events')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Events
              </button>
            </div>
            
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Create New Event</h1>
            </div>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Event Wizard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EventWizard 
            onSubmit={handleEventSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Event Planning Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Before You Start:</h4>
              <ul className="space-y-1">
                <li>• Check your school calendar for conflicts</li>
                <li>• Confirm venue availability</li>
                <li>• Review your PTO's budget guidelines</li>
                <li>• Consider seasonal factors and weather</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Best Results:</h4>
              <ul className="space-y-1">
                <li>• Plan events 4-6 weeks in advance</li>
                <li>• Include detailed volunteer descriptions</li>
                <li>• Set realistic budget expectations</li>
                <li>• Consider accessibility for all families</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate('/events/calendar')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            📅 View Calendar
          </button>
          <button
            onClick={() => navigate('/shared-library')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            💡 Browse Event Ideas
          </button>
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            📋 View All Events
          </button>
        </div>
      </div>
    </div>
  );
}
