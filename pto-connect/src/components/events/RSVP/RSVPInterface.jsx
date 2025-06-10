import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, UserMinus, Clock, MapPin, Calendar,
  Check, X, AlertCircle, Heart, Star, Gift, Coffee,
  MessageCircle, Phone, Mail, Plus, Minus
} from 'lucide-react';

const RSVPInterface = ({ event, currentUser, onRSVPUpdate }) => {
  const [rsvpStatus, setRSVPStatus] = useState('pending'); // pending, yes, no, maybe
  const [guestCount, setGuestCount] = useState(0);
  const [guestNames, setGuestNames] = useState(['']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [volunteerInterest, setVolunteerInterest] = useState([]);
  const [comments, setComments] = useState('');
  const [contactPreference, setContactPreference] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestDetails, setShowGuestDetails] = useState(false);

  // Sample event data structure
  const eventData = event || {
    id: 1,
    title: 'Fall Festival 2024',
    date: '2024-10-15',
    time: '10:00 AM - 4:00 PM',
    location: 'School Gymnasium',
    description: 'Join us for a fun-filled day of games, food, and community spirit!',
    maxAttendees: 300,
    currentAttendees: 187,
    requiresRSVP: true,
    allowGuests: true,
    maxGuestsPerFamily: 4,
    hasWaitlist: true,
    volunteerOpportunities: [
      { id: 1, title: 'Setup Crew', slotsNeeded: 5, slotsAvailable: 2 },
      { id: 2, title: 'Food Service', slotsNeeded: 8, slotsAvailable: 3 },
      { id: 3, title: 'Games Coordinator', slotsNeeded: 4, slotsAvailable: 1 },
      { id: 4, title: 'Cleanup Crew', slotsNeeded: 6, slotsAvailable: 4 }
    ]
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRSVPChange = (status) => {
    setRSVPStatus(status);
    if (status === 'no') {
      setGuestCount(0);
      setGuestNames(['']);
      setVolunteerInterest([]);
    }
  };

  const handleGuestCountChange = (change) => {
    const newCount = Math.max(0, Math.min(eventData.maxGuestsPerFamily, guestCount + change));
    setGuestCount(newCount);
    
    // Adjust guest names array
    const newGuestNames = [...guestNames];
    if (newCount > guestNames.length) {
      // Add empty strings for new guests
      while (newGuestNames.length < newCount) {
        newGuestNames.push('');
      }
    } else {
      // Remove excess guest names
      newGuestNames.splice(newCount);
    }
    setGuestNames(newGuestNames);
  };

  const handleGuestNameChange = (index, name) => {
    const newGuestNames = [...guestNames];
    newGuestNames[index] = name;
    setGuestNames(newGuestNames);
  };

  const handleVolunteerToggle = (opportunityId) => {
    setVolunteerInterest(prev => 
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const handleSubmitRSVP = async () => {
    setIsSubmitting(true);
    
    const rsvpData = {
      eventId: eventData.id,
      userId: currentUser?.id,
      status: rsvpStatus,
      guestCount: rsvpStatus === 'yes' ? guestCount : 0,
      guestNames: rsvpStatus === 'yes' ? guestNames.filter(name => name.trim()) : [],
      dietaryRestrictions,
      volunteerInterest,
      comments,
      contactPreference,
      submittedAt: new Date().toISOString()
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onRSVPUpdate) {
        onRSVPUpdate(rsvpData);
      }
      
      console.log('RSVP submitted:', rsvpData);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttendancePercentage = () => {
    return Math.round((eventData.currentAttendees / eventData.maxAttendees) * 100);
  };

  const isEventFull = () => {
    return eventData.currentAttendees >= eventData.maxAttendees;
  };

  const getRSVPButtonStyle = (status) => {
    const baseStyle = "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2";
    
    if (rsvpStatus === status) {
      const activeStyles = {
        yes: "bg-green-600 text-white shadow-lg",
        no: "bg-red-600 text-white shadow-lg",
        maybe: "bg-yellow-600 text-white shadow-lg"
      };
      return `${baseStyle} ${activeStyles[status]}`;
    }
    
    return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Event Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{eventData.title}</h1>
            <div className="space-y-2 text-blue-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(eventData.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{eventData.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{eventData.location}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm text-blue-100">Attendance</div>
              <div className="text-xl font-bold">{eventData.currentAttendees}/{eventData.maxAttendees}</div>
              <div className="text-xs text-blue-200">{getAttendancePercentage()}% full</div>
            </div>
          </div>
        </div>
        
        {eventData.description && (
          <p className="mt-4 text-blue-100">{eventData.description}</p>
        )}
      </div>

      {/* Attendance Progress */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Event Capacity</span>
          <span className="font-medium text-gray-900">
            {eventData.currentAttendees} of {eventData.maxAttendees} spots filled
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              getAttendancePercentage() > 90 ? 'bg-red-500' : 
              getAttendancePercentage() > 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${getAttendancePercentage()}%` }}
          />
        </div>
        {isEventFull() && eventData.hasWaitlist && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Event is full, but you can join the waitlist!
          </div>
        )}
      </div>

      <div className="p-6">
        {/* RSVP Status Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Will you be attending?</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRSVPChange('yes')}
              className={getRSVPButtonStyle('yes')}
              disabled={isEventFull() && !eventData.hasWaitlist}
            >
              <Check className="w-5 h-5" />
              <span>Yes, I'll be there!</span>
            </button>
            <button
              onClick={() => handleRSVPChange('maybe')}
              className={getRSVPButtonStyle('maybe')}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Maybe</span>
            </button>
            <button
              onClick={() => handleRSVPChange('no')}
              className={getRSVPButtonStyle('no')}
            >
              <X className="w-5 h-5" />
              <span>Can't make it</span>
            </button>
          </div>
        </div>

        {/* Guest Management - Only show if RSVP is Yes and guests are allowed */}
        {rsvpStatus === 'yes' && eventData.allowGuests && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Guest Information</h4>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-800">Number of guests:</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleGuestCountChange(-1)}
                  disabled={guestCount === 0}
                  className="p-1 rounded bg-blue-200 text-blue-800 hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-medium text-blue-900 min-w-[2rem] text-center">{guestCount}</span>
                <button
                  onClick={() => handleGuestCountChange(1)}
                  disabled={guestCount >= eventData.maxGuestsPerFamily}
                  className="p-1 rounded bg-blue-200 text-blue-800 hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {guestCount > 0 && (
              <div>
                <button
                  onClick={() => setShowGuestDetails(!showGuestDetails)}
                  className="text-sm text-blue-600 hover:text-blue-800 mb-3"
                >
                  {showGuestDetails ? 'Hide' : 'Add'} guest names (optional)
                </button>
                
                {showGuestDetails && (
                  <div className="space-y-2">
                    {guestNames.map((name, index) => (
                      <input
                        key={index}
                        type="text"
                        placeholder={`Guest ${index + 1} name`}
                        value={name}
                        onChange={(e) => handleGuestNameChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="text-xs text-blue-600 mt-2">
              Maximum {eventData.maxGuestsPerFamily} guests per family
            </div>
          </div>
        )}

        {/* Volunteer Opportunities - Only show if RSVP is Yes or Maybe */}
        {(rsvpStatus === 'yes' || rsvpStatus === 'maybe') && eventData.volunteerOpportunities.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-3 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Volunteer Opportunities
            </h4>
            <p className="text-sm text-green-700 mb-4">
              Help make this event amazing! Select any volunteer opportunities you're interested in.
            </p>
            
            <div className="space-y-3">
              {eventData.volunteerOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`volunteer-${opportunity.id}`}
                      checked={volunteerInterest.includes(opportunity.id)}
                      onChange={() => handleVolunteerToggle(opportunity.id)}
                      className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor={`volunteer-${opportunity.id}`} className="font-medium text-gray-900">
                      {opportunity.title}
                    </label>
                  </div>
                  <div className="text-sm text-gray-600">
                    {opportunity.slotsAvailable} of {opportunity.slotsNeeded} spots available
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information - Only show if RSVP is Yes or Maybe */}
        {(rsvpStatus === 'yes' || rsvpStatus === 'maybe') && (
          <div className="mb-6 space-y-4">
            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary restrictions or allergies (optional)
              </label>
              <textarea
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="Please let us know about any dietary restrictions, allergies, or special accommodations needed..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Contact Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred contact method for event updates
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="email"
                    checked={contactPreference === 'email'}
                    onChange={(e) => setContactPreference(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 ml-2 mr-1 text-gray-600" />
                  <span className="text-sm text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="sms"
                    checked={contactPreference === 'sms'}
                    onChange={(e) => setContactPreference(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <MessageCircle className="w-4 h-4 ml-2 mr-1 text-gray-600" />
                  <span className="text-sm text-gray-700">Text/SMS</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="phone"
                    checked={contactPreference === 'phone'}
                    onChange={(e) => setContactPreference(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Phone className="w-4 h-4 ml-2 mr-1 text-gray-600" />
                  <span className="text-sm text-gray-700">Phone</span>
                </label>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional comments or questions (optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Any questions, suggestions, or additional information you'd like to share..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {rsvpStatus === 'pending' ? 'Please select your attendance status' : 
             rsvpStatus === 'yes' ? `You and ${guestCount} guest${guestCount !== 1 ? 's' : ''} will attend` :
             rsvpStatus === 'maybe' ? 'You might attend this event' :
             'You will not attend this event'}
          </div>
          
          <button
            onClick={handleSubmitRSVP}
            disabled={rsvpStatus === 'pending' || isSubmitting}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              rsvpStatus === 'pending' || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit RSVP'
            )}
          </button>
        </div>
      </div>

      {/* Footer Information */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span>Questions? Contact the event organizer</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>You can change your RSVP anytime before the event</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVPInterface;
