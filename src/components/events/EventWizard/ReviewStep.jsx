import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, Eye, EyeOff, Share2, Repeat, AlertCircle, CheckCircle, QrCode } from 'lucide-react';
import EventQRCode from '../QRCode/EventQRCode';
import { generateEventId, formatDisplayUrl } from '../../../utils/eventUtils';

const ReviewStep = ({ data }) => {
  const [eventId, setEventId] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // Generate unique event ID when component mounts
  useEffect(() => {
    if (!eventId) {
      const newEventId = generateEventId();
      setEventId(newEventId);
    }
  }, [eventId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateBudgetTotals = () => {
    const categories = data.budget_categories || [];
    const expenses = categories
      .filter(cat => cat.type === 'expense')
      .reduce((sum, cat) => sum + (parseFloat(cat.estimated_cost) || 0), 0);
    const revenue = categories
      .filter(cat => cat.type === 'revenue')
      .reduce((sum, cat) => sum + (parseFloat(cat.estimated_cost) || 0), 0);
    
    return { expenses, revenue, profit: revenue - expenses };
  };

  const getTotalVolunteersNeeded = () => {
    const opportunities = data.volunteer_opportunities || [];
    return opportunities.reduce((total, opp) => total + (parseInt(opp.slots_needed) || 0), 0);
  };

  const getValidationIssues = () => {
    const issues = [];
    
    if (!data.title?.trim()) issues.push('Event title is required');
    if (!data.event_date) issues.push('Event date is required');
    if (!data.category) issues.push('Event category is required');
    
    if (data.recurring && !data.recurring_end_date && !data.recurring_count) {
      issues.push('Recurring events need an end date or occurrence count');
    }
    
    if (data.start_time && data.end_time && data.start_time >= data.end_time) {
      issues.push('End time must be after start time');
    }

    return issues;
  };

  const { expenses, revenue, profit } = calculateBudgetTotals();
  const totalVolunteers = getTotalVolunteersNeeded();
  const validationIssues = getValidationIssues();
  const canPublish = validationIssues.length === 0;

  const getCategoryIcon = (category) => {
    const icons = {
      fundraiser: '💰',
      educational: '📚',
      social: '🎉',
      community: '🏘️',
      performance: '🎭',
      sports: '⚽',
      meeting: '👥',
      volunteer: '🤝'
    };
    return icons[category] || '📅';
  };

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      {validationIssues.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="font-medium text-red-800">Please fix the following issues:</h3>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {validationIssues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-medium text-green-800">Event is ready to publish!</h3>
          </div>
        </div>
      )}

      {/* Event Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title || 'Untitled Event'}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-lg mr-2">{getCategoryIcon(data.category)}</span>
                <span className="capitalize">{data.category || 'No category'}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span className="capitalize">{data.visibility || 'public'}</span>
              </div>
              {data.share_public && (
                <div className="flex items-center">
                  <Share2 className="w-4 h-4 mr-1" />
                  <span>Shared to library</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Target Audience</div>
            <div className="font-medium capitalize">{data.school_level?.replace('_', ' ') || 'Not specified'}</div>
          </div>
        </div>

        {data.description && (
          <p className="text-gray-700 mb-4">{data.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <div className="text-sm text-blue-600 font-medium">Date</div>
              <div className="text-sm text-gray-900">{formatDate(data.event_date)}</div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <div className="text-sm text-purple-600 font-medium">Time</div>
              <div className="text-sm text-gray-900">
                {data.start_time && data.end_time 
                  ? `${formatTime(data.start_time)} - ${formatTime(data.end_time)}`
                  : 'Not set'
                }
              </div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <div className="text-sm text-green-600 font-medium">Location</div>
              <div className="text-sm text-gray-900">{data.location || 'Not specified'}</div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-orange-50 rounded-lg">
            <Users className="w-5 h-5 text-orange-600 mr-3" />
            <div>
              <div className="text-sm text-orange-600 font-medium">Volunteers</div>
              <div className="text-sm text-gray-900">{totalVolunteers} needed</div>
            </div>
          </div>
        </div>

        {/* Recurring Event Info */}
        {data.recurring && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Repeat className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Recurring Event</span>
            </div>
            <div className="text-sm text-blue-700">
              Pattern: {data.recurring_pattern?.replace('_', ' ') || 'Not specified'}
              {data.recurring_end_date && (
                <span> • Ends: {formatDate(data.recurring_end_date)}</span>
              )}
              {data.recurring_count && (
                <span> • {data.recurring_count} occurrences</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RSVP URL & QR Code */}
      {eventId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              RSVP Link & QR Code
            </h3>
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Share this link for RSVPs:</p>
            <div className="bg-gray-50 rounded-lg p-3 border">
              <code className="text-sm text-blue-600 break-all">
                {formatDisplayUrl(eventId)}
              </code>
            </div>
          </div>

          {showQRCode && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EventQRCode 
                eventId={eventId} 
                eventTitle={data.title}
                className="lg:col-span-2"
              />
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📱 How to Share</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Copy the URL and paste it in emails or messages</li>
              <li>• Download the QR code for flyers and posters</li>
              <li>• Parents can scan the QR code with their phone camera</li>
              <li>• The link works on any device - no app required</li>
            </ul>
          </div>
        </div>
      )}

      {/* Budget Summary */}
      {data.budget_categories && data.budget_categories.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Budget Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-red-600 font-medium">Total Expenses</div>
              <div className="text-xl font-bold text-red-700">${expenses.toFixed(2)}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Expected Revenue</div>
              <div className="text-xl font-bold text-green-700">${revenue.toFixed(2)}</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${profit >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
              <div className={`text-sm font-medium ${profit >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                Projected {profit >= 0 ? 'Profit' : 'Loss'}
              </div>
              <div className={`text-xl font-bold ${profit >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>
                ${Math.abs(profit).toFixed(2)}
              </div>
            </div>
          </div>

          {data.fundraising_goal && (
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Fundraising Goal Progress:</span>
                <span className="text-sm font-medium">
                  ${profit > 0 ? profit.toFixed(2) : '0.00'} / ${parseFloat(data.fundraising_goal).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(profit > 0 ? (profit / parseFloat(data.fundraising_goal)) * 100 : 0, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Budget Breakdown:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.budget_categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      category.type === 'expense' ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    {category.name}
                  </span>
                  <span className="font-medium">
                    ${parseFloat(category.estimated_cost || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Opportunities */}
      {data.volunteer_opportunities && data.volunteer_opportunities.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Volunteer Opportunities ({data.volunteer_opportunities.length})
          </h3>
          
          {data.volunteer_coordinator && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Volunteer Coordinator</div>
              <div className="text-sm text-gray-900">{data.volunteer_coordinator}</div>
            </div>
          )}

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {data.volunteer_opportunities.map((opportunity) => (
              <div key={opportunity.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {opportunity.slots_needed} needed
                  </span>
                </div>
                
                {opportunity.description && (
                  <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                )}
                
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {opportunity.time_commitment && (
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {opportunity.time_commitment}
                    </div>
                  )}
                  {opportunity.skills_required && opportunity.skills_required.length > 0 && (
                    <div className="flex items-center">
                      <span className="mr-1">Skills:</span>
                      <span>{opportunity.skills_required.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {data.volunteer_requirements && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm text-yellow-600 font-medium">Special Requirements</div>
              <div className="text-sm text-gray-900">{data.volunteer_requirements}</div>
            </div>
          )}
        </div>
      )}

      {/* Publication Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens when you publish?</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <span>Event will be visible to {data.visibility === 'private' ? 'board members only' : 'all PTO members'}</span>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <span>Members can RSVP and sign up for volunteer opportunities</span>
          </div>
          
          {data.recurring && (
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <span>All recurring event instances will be created automatically</span>
            </div>
          )}
          
          <div className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <span>Automatic reminder emails will be sent to RSVPs</span>
          </div>
          
          {data.share_public && (
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <span>Event template will be shared with the PTO Connect community</span>
            </div>
          )}
          
          <div className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <span>You can edit or cancel the event anytime after publishing</span>
          </div>
        </div>
      </div>

      {/* Final Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📝 Next Steps After Publishing</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Share the event link with your community</li>
          <li>• Monitor RSVP responses and volunteer signups</li>
          <li>• Send updates and reminders as the event approaches</li>
          <li>• Track actual expenses against your budget</li>
          <li>• Follow up with volunteers 1 week before the event</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewStep;
