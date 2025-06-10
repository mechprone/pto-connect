import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, Clock } from 'lucide-react';
import RSVPInterface from '../../../components/events/RSVP/RSVPInterface';
import AttendanceTracker from '../../../components/events/RSVP/AttendanceTracker';
import WaitlistManager from '../../../components/events/RSVP/WaitlistManager';

const RSVPTestPage = () => {
  const [activeTab, setActiveTab] = useState('rsvp');
  const [eventData, setEventData] = useState({
    id: 1,
    title: 'Fall Festival 2024',
    date: '2024-10-15',
    time: '10:00 AM - 4:00 PM',
    location: 'School Gymnasium',
    description: 'Join us for a fun-filled day of games, food, and community spirit! This annual event brings our school community together for an unforgettable celebration.',
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
  });

  const [currentUser] = useState({
    id: 1,
    name: 'Test User',
    email: 'test@example.com'
  });

  const handleRSVPUpdate = (rsvpData) => {
    console.log('RSVP Updated:', rsvpData);
    // In a real app, this would update the backend
  };

  const handleAttendanceUpdate = (attendanceData) => {
    console.log('Attendance Updated:', attendanceData);
    // In a real app, this would update the backend
  };

  const handleWaitlistUpdate = (waitlistData) => {
    console.log('Waitlist Updated:', waitlistData);
    // In a real app, this would update the backend
  };

  const tabs = [
    { id: 'rsvp', label: 'RSVP Interface', icon: Users },
    { id: 'attendance', label: 'Attendance Tracker', icon: Calendar },
    { id: 'waitlist', label: 'Waitlist Manager', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Events
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RSVP System Demo</h1>
                <p className="text-gray-600">Comprehensive event RSVP and attendance management</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Test Environment</div>
              <div className="text-lg font-semibold text-blue-600">Phase 3 Development</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Descriptions */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          {activeTab === 'rsvp' && (
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">RSVP Interface</h3>
              <p className="text-blue-800">
                This is the interface that event attendees see when they want to RSVP for an event. 
                It includes guest management, volunteer signup, dietary restrictions, and contact preferences.
              </p>
              <div className="mt-3 text-sm text-blue-700">
                <strong>Features:</strong> Guest management, volunteer opportunities, dietary restrictions, 
                contact preferences, real-time capacity tracking, waitlist integration.
              </div>
            </div>
          )}
          
          {activeTab === 'attendance' && (
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Attendance Tracker</h3>
              <p className="text-blue-800">
                This is the tool that event organizers use during the event to track who has arrived. 
                It supports both manual check-in and QR code scanning for quick processing.
              </p>
              <div className="mt-3 text-sm text-blue-700">
                <strong>Features:</strong> Real-time check-in, bulk operations, QR code support, 
                attendance analytics, guest tracking, volunteer identification.
              </div>
            </div>
          )}
          
          {activeTab === 'waitlist' && (
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Waitlist Manager</h3>
              <p className="text-blue-800">
                This tool helps organizers manage the event waitlist when capacity is reached. 
                It includes priority management, position control, and automated notifications.
              </p>
              <div className="mt-3 text-sm text-blue-700">
                <strong>Features:</strong> Priority management, position reordering, bulk promotions, 
                notification system, likelihood estimation, volunteer tracking.
              </div>
            </div>
          )}
        </div>

        {/* Component Display */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'rsvp' && (
            <RSVPInterface
              event={eventData}
              currentUser={currentUser}
              onRSVPUpdate={handleRSVPUpdate}
            />
          )}
          
          {activeTab === 'attendance' && (
            <AttendanceTracker
              event={eventData}
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          )}
          
          {activeTab === 'waitlist' && (
            <WaitlistManager
              event={eventData}
              onWaitlistUpdate={handleWaitlistUpdate}
            />
          )}
        </div>
      </div>

      {/* Development Notes */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-gray-100 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Development Notes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Completed Features</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Comprehensive RSVP interface with guest management</li>
                <li>• Real-time attendance tracking with check-in/out</li>
                <li>• Waitlist management with priority system</li>
                <li>• Volunteer opportunity integration</li>
                <li>• Mobile-responsive design</li>
                <li>• Bulk operations and notifications</li>
                <li>• QR code check-in support (UI ready)</li>
                <li>• Dietary restrictions and accessibility</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔄 Next Steps</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Backend API integration</li>
                <li>• Real-time WebSocket updates</li>
                <li>• Email/SMS notification system</li>
                <li>• QR code generation and scanning</li>
                <li>• Data export functionality</li>
                <li>• Analytics and reporting</li>
                <li>• Integration with calendar systems</li>
                <li>• Automated reminder system</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Technical Implementation</h4>
            <p className="text-sm text-blue-800">
              All components are built with React 18, use Tailwind CSS for styling, and include 
              comprehensive state management. They're designed to work seamlessly with the existing 
              PTO Connect architecture and can be easily integrated with backend APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVPTestPage;
