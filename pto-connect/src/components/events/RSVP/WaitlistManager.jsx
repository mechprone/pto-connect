import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Mail, Phone, MessageCircle, 
  ArrowUp, ArrowDown, Check, X, AlertCircle,
  Send, UserPlus, Calendar, MapPin, Star
} from 'lucide-react';

const WaitlistManager = ({ event, waitlistEntries, onWaitlistUpdate }) => {
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationMethod, setNotificationMethod] = useState('email');

  // Sample waitlist data
  const sampleWaitlist = waitlistEntries || [
    {
      id: 1,
      name: 'David Thompson',
      email: 'david.thompson@email.com',
      phone: '(555) 111-2222',
      guestCount: 2,
      guestNames: ['Sarah Thompson', 'Jake Thompson'],
      joinedWaitlistAt: '2024-10-10T14:30:00Z',
      position: 1,
      priority: 'high',
      contactPreference: 'email',
      notes: 'Willing to volunteer for setup',
      volunteerInterest: ['Setup Crew', 'Cleanup Crew'],
      dietaryRestrictions: 'None'
    },
    {
      id: 2,
      name: 'Lisa Martinez',
      email: 'lisa.martinez@email.com',
      phone: '(555) 222-3333',
      guestCount: 1,
      guestNames: ['Alex Martinez'],
      joinedWaitlistAt: '2024-10-11T09:15:00Z',
      position: 2,
      priority: 'normal',
      contactPreference: 'sms',
      notes: 'First time attending PTO event',
      volunteerInterest: [],
      dietaryRestrictions: 'Vegetarian'
    },
    {
      id: 3,
      name: 'James Wilson',
      email: 'james.wilson@email.com',
      phone: '(555) 333-4444',
      guestCount: 3,
      guestNames: ['Karen Wilson', 'Tim Wilson', 'Sophie Wilson'],
      joinedWaitlistAt: '2024-10-12T16:45:00Z',
      position: 3,
      priority: 'normal',
      contactPreference: 'email',
      notes: 'Board member family',
      volunteerInterest: ['Food Service'],
      dietaryRestrictions: 'Nut allergy (Sophie)'
    },
    {
      id: 4,
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '(555) 444-5555',
      guestCount: 0,
      guestNames: [],
      joinedWaitlistAt: '2024-10-13T11:20:00Z',
      position: 4,
      priority: 'low',
      contactPreference: 'phone',
      notes: 'Teacher - flexible schedule',
      volunteerInterest: ['Games Coordinator'],
      dietaryRestrictions: 'Gluten-free'
    }
  ];

  const eventData = event || {
    id: 1,
    title: 'Fall Festival 2024',
    date: '2024-10-15',
    time: '10:00 AM - 4:00 PM',
    location: 'School Gymnasium',
    maxAttendees: 300,
    currentAttendees: 295,
    availableSpots: 5
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority] || colors.normal;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: <Star className="w-3 h-3 text-red-600" />,
      normal: <Clock className="w-3 h-3 text-blue-600" />,
      low: <Clock className="w-3 h-3 text-gray-600" />
    };
    return icons[priority] || icons.normal;
  };

  const handleSelectEntry = (entryId) => {
    setSelectedEntries(prev => 
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleMovePosition = (entryId, direction) => {
    const entry = sampleWaitlist.find(e => e.id === entryId);
    if (!entry) return;

    const newPosition = direction === 'up' ? entry.position - 1 : entry.position + 1;
    
    if (newPosition < 1 || newPosition > sampleWaitlist.length) return;

    // Update positions
    const updatedWaitlist = sampleWaitlist.map(e => {
      if (e.id === entryId) {
        return { ...e, position: newPosition };
      }
      if (e.position === newPosition) {
        return { ...e, position: entry.position };
      }
      return e;
    });

    if (onWaitlistUpdate) {
      onWaitlistUpdate(updatedWaitlist);
    }
  };

  const handlePromoteToRSVP = (entryIds) => {
    const entriesToPromote = sampleWaitlist.filter(e => entryIds.includes(e.id));
    
    // Check if there are enough spots
    const totalGuestsNeeded = entriesToPromote.reduce((sum, entry) => sum + entry.guestCount + 1, 0);
    
    if (totalGuestsNeeded > eventData.availableSpots) {
      alert(`Not enough spots available. Need ${totalGuestsNeeded} spots, but only ${eventData.availableSpots} available.`);
      return;
    }

    // Promote entries
    const promotedEntries = entriesToPromote.map(entry => ({
      ...entry,
      status: 'promoted',
      promotedAt: new Date().toISOString()
    }));

    console.log('Promoting waitlist entries to RSVP:', promotedEntries);
    
    if (onWaitlistUpdate) {
      const remainingWaitlist = sampleWaitlist.filter(e => !entryIds.includes(e.id));
      onWaitlistUpdate(remainingWaitlist);
    }

    setSelectedEntries([]);
    setShowPromoteModal(false);
  };

  const handleSendNotification = () => {
    const selectedWaitlistEntries = sampleWaitlist.filter(e => selectedEntries.includes(e.id));
    
    const notificationData = {
      method: notificationMethod,
      message: notificationMessage,
      recipients: selectedWaitlistEntries.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        contactPreference: e.contactPreference
      })),
      sentAt: new Date().toISOString()
    };

    console.log('Sending waitlist notification:', notificationData);
    
    setShowNotificationModal(false);
    setNotificationMessage('');
    setSelectedEntries([]);
  };

  const getEstimatedWaitTime = (position) => {
    // Simple estimation based on position and typical no-show rate
    const averageNoShowRate = 0.15; // 15% no-show rate
    const daysUntilEvent = Math.ceil((new Date(eventData.date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (position <= eventData.availableSpots) {
      return 'Very likely to get in';
    } else if (position <= eventData.availableSpots + (eventData.currentAttendees * averageNoShowRate)) {
      return 'Good chance if there are cancellations';
    } else {
      return 'Unlikely unless many cancellations';
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Waitlist Manager</h1>
            <p className="text-orange-100">{eventData.title}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-orange-100">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(eventData.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{eventData.location}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-sm text-orange-100">Available Spots</div>
              <div className="text-3xl font-bold">{eventData.availableSpots}</div>
              <div className="text-xs text-orange-200">
                {eventData.currentAttendees}/{eventData.maxAttendees} filled
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Waitlist</div>
                <div className="text-2xl font-bold text-gray-900">{sampleWaitlist.length}</div>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">High Priority</div>
                <div className="text-2xl font-bold text-red-600">
                  {sampleWaitlist.filter(e => e.priority === 'high').length}
                </div>
              </div>
              <Star className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Guests</div>
                <div className="text-2xl font-bold text-blue-600">
                  {sampleWaitlist.reduce((sum, e) => sum + e.guestCount, 0)}
                </div>
              </div>
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Volunteers</div>
                <div className="text-2xl font-bold text-green-600">
                  {sampleWaitlist.filter(e => e.volunteerInterest.length > 0).length}
                </div>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedEntries.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedEntries.length} selected
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedEntries.length > 0 && (
              <>
                <button
                  onClick={() => setShowPromoteModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>Promote to RSVP</span>
                </button>
                
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Notification</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Waitlist Entries */}
      <div className="p-6">
        <div className="space-y-4">
          {sampleWaitlist
            .sort((a, b) => a.position - b.position)
            .map((entry) => (
            <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedEntries.includes(entry.id)}
                    onChange={() => handleSelectEntry(entry.id)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-800 rounded-full font-bold text-sm">
                    #{entry.position}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(entry.priority)}`}>
                        {getPriorityIcon(entry.priority)}
                        <span className="ml-1 capitalize">{entry.priority} Priority</span>
                      </span>
                      {entry.volunteerInterest.length > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Volunteer
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{entry.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{entry.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{entry.guestCount + 1} total ({entry.guestCount} guests)</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Joined waitlist: </span>
                      {formatDate(entry.joinedWaitlistAt)}
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Likelihood: </span>
                      <span className={`${
                        getEstimatedWaitTime(entry.position).includes('Very likely') ? 'text-green-600' :
                        getEstimatedWaitTime(entry.position).includes('Good chance') ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getEstimatedWaitTime(entry.position)}
                      </span>
                    </div>

                    {entry.guestNames.length > 0 && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Guests: </span>
                        {entry.guestNames.join(', ')}
                      </div>
                    )}

                    {entry.volunteerInterest.length > 0 && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Volunteer interest: </span>
                        {entry.volunteerInterest.join(', ')}
                      </div>
                    )}

                    {entry.dietaryRestrictions && entry.dietaryRestrictions !== 'None' && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Dietary restrictions: </span>
                        {entry.dietaryRestrictions}
                      </div>
                    )}

                    {entry.notes && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Notes: </span>
                        {entry.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Position Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMovePosition(entry.id, 'up')}
                    disabled={entry.position === 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up in waitlist"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleMovePosition(entry.id, 'down')}
                    disabled={entry.position === sampleWaitlist.length}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down in waitlist"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sampleWaitlist.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No one on the waitlist</h3>
            <p className="text-gray-600">
              The waitlist is empty. People will be added here when the event reaches capacity.
            </p>
          </div>
        )}
      </div>

      {/* Promote Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promote to RSVP</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to promote {selectedEntries.length} waitlist {selectedEntries.length === 1 ? 'entry' : 'entries'} to confirmed RSVP status?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This will send them a confirmation email and remove them from the waitlist.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handlePromoteToRSVP(selectedEntries)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Promote
              </button>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Notification</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Method
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="email"
                    checked={notificationMethod === 'email'}
                    onChange={(e) => setNotificationMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 ml-2 mr-1 text-gray-600" />
                  <span className="text-sm text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="sms"
                    checked={notificationMethod === 'sms'}
                    onChange={(e) => setNotificationMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <MessageCircle className="w-4 h-4 ml-2 mr-1 text-gray-600" />
                  <span className="text-sm text-gray-700">SMS</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter your message to waitlist members..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSendNotification}
                disabled={!notificationMessage.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send to {selectedEntries.length} {selectedEntries.length === 1 ? 'person' : 'people'}
              </button>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistManager;
