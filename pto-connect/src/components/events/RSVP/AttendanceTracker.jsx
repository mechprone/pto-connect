import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, Search, Filter, Clock, 
  CheckCircle, XCircle, AlertCircle, Download, 
  QrCode, Smartphone, User, Mail, Phone, Calendar
} from 'lucide-react';

const AttendanceTracker = ({ event, attendees, onAttendanceUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, checked-in, not-checked-in, no-show
  const [checkInMode, setCheckInMode] = useState('manual'); // manual, qr-code
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Sample attendees data
  const sampleAttendees = attendees || [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      rsvpStatus: 'yes',
      guestCount: 2,
      guestNames: ['Mike Johnson', 'Emma Johnson'],
      checkInTime: '2024-10-15T10:15:00Z',
      checkInStatus: 'checked-in',
      volunteerRoles: ['Setup Crew'],
      dietaryRestrictions: 'Vegetarian',
      contactPreference: 'email'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 234-5678',
      rsvpStatus: 'yes',
      guestCount: 1,
      guestNames: ['Lisa Chen'],
      checkInTime: null,
      checkInStatus: 'not-checked-in',
      volunteerRoles: ['Food Service', 'Cleanup Crew'],
      dietaryRestrictions: '',
      contactPreference: 'sms'
    },
    {
      id: 3,
      name: 'Jennifer Davis',
      email: 'jennifer.davis@email.com',
      phone: '(555) 345-6789',
      rsvpStatus: 'maybe',
      guestCount: 0,
      guestNames: [],
      checkInTime: '2024-10-15T10:45:00Z',
      checkInStatus: 'checked-in',
      volunteerRoles: [],
      dietaryRestrictions: 'Gluten-free',
      contactPreference: 'email'
    },
    {
      id: 4,
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      phone: '(555) 456-7890',
      rsvpStatus: 'yes',
      guestCount: 3,
      guestNames: ['Mary Wilson', 'Tom Wilson', 'Amy Wilson'],
      checkInTime: null,
      checkInStatus: 'no-show',
      volunteerRoles: ['Games Coordinator'],
      dietaryRestrictions: '',
      contactPreference: 'phone'
    },
    {
      id: 5,
      name: 'Amanda Rodriguez',
      email: 'amanda.rodriguez@email.com',
      phone: '(555) 567-8901',
      rsvpStatus: 'yes',
      guestCount: 1,
      guestNames: ['Carlos Rodriguez'],
      checkInTime: '2024-10-15T11:20:00Z',
      checkInStatus: 'checked-in',
      volunteerRoles: ['Setup Crew', 'Cleanup Crew'],
      dietaryRestrictions: 'Nut allergy',
      contactPreference: 'sms'
    }
  ];

  const eventData = event || {
    id: 1,
    title: 'Fall Festival 2024',
    date: '2024-10-15',
    time: '10:00 AM - 4:00 PM',
    location: 'School Gymnasium'
  };

  const filteredAttendees = sampleAttendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || attendee.checkInStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getAttendanceStats = () => {
    const total = sampleAttendees.length;
    const checkedIn = sampleAttendees.filter(a => a.checkInStatus === 'checked-in').length;
    const notCheckedIn = sampleAttendees.filter(a => a.checkInStatus === 'not-checked-in').length;
    const noShow = sampleAttendees.filter(a => a.checkInStatus === 'no-show').length;
    const totalGuests = sampleAttendees.reduce((sum, a) => sum + a.guestCount, 0);
    const checkedInGuests = sampleAttendees
      .filter(a => a.checkInStatus === 'checked-in')
      .reduce((sum, a) => sum + a.guestCount, 0);

    return { total, checkedIn, notCheckedIn, noShow, totalGuests, checkedInGuests };
  };

  const handleCheckIn = (attendeeId, status = 'checked-in') => {
    const updatedAttendees = sampleAttendees.map(attendee => {
      if (attendee.id === attendeeId) {
        return {
          ...attendee,
          checkInStatus: status,
          checkInTime: status === 'checked-in' ? new Date().toISOString() : null
        };
      }
      return attendee;
    });

    if (onAttendanceUpdate) {
      onAttendanceUpdate(updatedAttendees);
    }
  };

  const handleBulkCheckIn = (status) => {
    selectedAttendees.forEach(attendeeId => {
      handleCheckIn(attendeeId, status);
    });
    setSelectedAttendees([]);
    setShowBulkActions(false);
  };

  const handleSelectAttendee = (attendeeId) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId)
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not checked in';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'checked-in': 'bg-green-100 text-green-800 border-green-200',
      'not-checked-in': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'no-show': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors['not-checked-in'];
  };

  const getStatusIcon = (status) => {
    const icons = {
      'checked-in': <CheckCircle className="w-4 h-4 text-green-600" />,
      'not-checked-in': <Clock className="w-4 h-4 text-yellow-600" />,
      'no-show': <XCircle className="w-4 h-4 text-red-600" />
    };
    return icons[status] || icons['not-checked-in'];
  };

  const stats = getAttendanceStats();

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Attendance Tracker</h1>
            <p className="text-blue-100">{eventData.title}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-blue-100">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(eventData.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{eventData.time}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-sm text-blue-100">Check-in Rate</div>
              <div className="text-3xl font-bold">
                {Math.round((stats.checkedIn / stats.total) * 100)}%
              </div>
              <div className="text-xs text-blue-200">
                {stats.checkedIn} of {stats.total} families
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total RSVPs</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Checked In</div>
                <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.notCheckedIn}</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">No Shows</div>
                <div className="text-2xl font-bold text-red-600">{stats.noShow}</div>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Guests</div>
                <div className="text-2xl font-bold text-purple-600">{stats.checkedInGuests}/{stats.totalGuests}</div>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="not-checked-in">Not Checked In</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          {/* Check-in Mode Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Check-in mode:</span>
              <button
                onClick={() => setCheckInMode('manual')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  checkInMode === 'manual' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-1" />
                Manual
              </button>
              <button
                onClick={() => setCheckInMode('qr-code')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  checkInMode === 'qr-code' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <QrCode className="w-4 h-4 inline mr-1" />
                QR Code
              </button>
            </div>

            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAttendees.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedAttendees.length} attendee{selectedAttendees.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkCheckIn('checked-in')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Check In All
                </button>
                <button
                  onClick={() => handleBulkCheckIn('no-show')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Mark No Show
                </button>
                <button
                  onClick={() => setSelectedAttendees([])}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Scanner (when in QR mode) */}
      {checkInMode === 'qr-code' && (
        <div className="p-6 bg-blue-50 border-b">
          <div className="text-center">
            <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">QR Code Check-in</h3>
            <p className="text-blue-700 mb-4">
              Use your device's camera to scan attendee QR codes for quick check-in
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Smartphone className="w-5 h-5 inline mr-2" />
              Start Camera Scanner
            </button>
          </div>
        </div>
      )}

      {/* Attendees List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredAttendees.map((attendee) => (
            <div key={attendee.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedAttendees.includes(attendee.id)}
                    onChange={() => handleSelectAttendee(attendee.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(attendee.checkInStatus)}`}>
                        {getStatusIcon(attendee.checkInStatus)}
                        <span className="ml-1 capitalize">{attendee.checkInStatus.replace('-', ' ')}</span>
                      </span>
                      {attendee.volunteerRoles.length > 0 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Volunteer
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{attendee.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{attendee.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{attendee.guestCount + 1} total ({attendee.guestCount} guests)</span>
                      </div>
                    </div>

                    {attendee.guestNames.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Guests: </span>
                        {attendee.guestNames.join(', ')}
                      </div>
                    )}

                    {attendee.volunteerRoles.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Volunteer roles: </span>
                        {attendee.volunteerRoles.join(', ')}
                      </div>
                    )}

                    {attendee.dietaryRestrictions && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Dietary restrictions: </span>
                        {attendee.dietaryRestrictions}
                      </div>
                    )}

                    {attendee.checkInTime && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Check-in time: </span>
                        {formatTime(attendee.checkInTime)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {attendee.checkInStatus === 'not-checked-in' && (
                    <button
                      onClick={() => handleCheckIn(attendee.id, 'checked-in')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Check In</span>
                    </button>
                  )}
                  
                  {attendee.checkInStatus === 'checked-in' && (
                    <button
                      onClick={() => handleCheckIn(attendee.id, 'not-checked-in')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Undo</span>
                    </button>
                  )}
                  
                  {attendee.checkInStatus !== 'no-show' && (
                    <button
                      onClick={() => handleCheckIn(attendee.id, 'no-show')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>No Show</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No one has RSVP\'d for this event yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
