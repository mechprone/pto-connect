import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, ArrowLeft, Plus, Edit, Trash2, 
  Send, Eye, Filter, ChevronLeft, ChevronRight,
  Mail, MessageSquare, Megaphone, Smartphone
} from 'lucide-react';

const CommunicationSchedule = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [filterType, setFilterType] = useState('all');

  // Sample scheduled communications
  const scheduledCommunications = [
    {
      id: 1,
      title: 'Fall Festival Reminder',
      type: 'email',
      scheduledDate: '2024-10-15',
      scheduledTime: '10:00',
      audience: 'All Families',
      status: 'scheduled',
      description: 'Final reminder about the Fall Festival this weekend'
    },
    {
      id: 2,
      title: 'Volunteer Thank You',
      type: 'social',
      scheduledDate: '2024-10-16',
      scheduledTime: '14:30',
      audience: 'Facebook & Instagram',
      status: 'scheduled',
      description: 'Thank you post for Fall Festival volunteers'
    },
    {
      id: 3,
      title: 'Book Fair Opening',
      type: 'sms',
      scheduledDate: '2024-10-20',
      scheduledTime: '08:00',
      audience: 'Parent Contacts',
      status: 'scheduled',
      description: 'Book Fair starts today reminder'
    },
    {
      id: 4,
      title: 'Monthly Newsletter',
      type: 'email',
      scheduledDate: '2024-10-25',
      scheduledTime: '09:00',
      audience: 'All Subscribers',
      status: 'draft',
      description: 'October newsletter with updates and upcoming events'
    },
    {
      id: 5,
      title: 'Halloween Party Announcement',
      type: 'email',
      scheduledDate: '2024-10-28',
      scheduledTime: '16:00',
      audience: 'All Families',
      status: 'scheduled',
      description: 'Details about the Halloween party next week'
    }
  ];

  const getTypeIcon = (type) => {
    const icons = {
      email: Mail,
      sms: Smartphone,
      social: Megaphone,
      newsletter: Calendar
    };
    return icons[type] || Mail;
  };

  const getTypeColor = (type) => {
    const colors = {
      email: 'bg-blue-100 text-blue-800 border-blue-200',
      sms: 'bg-green-100 text-green-800 border-green-200',
      social: 'bg-purple-100 text-purple-800 border-purple-200',
      newsletter: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-green-100 text-green-800',
      sent: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const CommunicationCard = ({ communication }) => {
    const TypeIcon = getTypeIcon(communication.type);
    
    return (
      <div className={`border-l-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${getTypeColor(communication.type).split(' ')[2]}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTypeColor(communication.type)}`}>
              <TypeIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{communication.title}</h3>
              <p className="text-xs text-gray-600">{communication.audience}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(communication.status)}`}>
            {communication.status.charAt(0).toUpperCase() + communication.status.slice(1)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{communication.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatTime(communication.scheduledTime)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-blue-600">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-green-600">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
            {communication.status === 'scheduled' && (
              <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                <Send className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Create calendar grid
    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    const getDateCommunications = (day) => {
      if (!day) return [];
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return scheduledCommunications.filter(comm => comm.scheduledDate === dateString);
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            const dayComms = getDateCommunications(day);
            const isToday = day && 
              currentYear === today.getFullYear() && 
              currentMonth === today.getMonth() && 
              day === today.getDate();
            
            return (
              <div key={index} className="min-h-[120px] p-2 border-b border-r border-gray-200 bg-white">
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayComms.slice(0, 2).map(comm => {
                        const TypeIcon = getTypeIcon(comm.type);
                        return (
                          <div key={comm.id} className={`text-xs p-1 rounded ${getTypeColor(comm.type)} truncate`}>
                            <div className="flex items-center space-x-1">
                              <TypeIcon className="w-3 h-3" />
                              <span className="truncate">{comm.title}</span>
                            </div>
                          </div>
                        );
                      })}
                      {dayComms.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayComms.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ListView = () => {
    const filteredComms = filterType === 'all' 
      ? scheduledCommunications 
      : scheduledCommunications.filter(comm => comm.type === filterType);

    // Group by date
    const groupedComms = filteredComms.reduce((groups, comm) => {
      const date = comm.scheduledDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(comm);
      return groups;
    }, {});

    return (
      <div className="space-y-6">
        {Object.entries(groupedComms)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, comms]) => (
            <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{formatDate(date)}</h3>
              </div>
              <div className="p-6 space-y-4">
                {comms
                  .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                  .map(comm => (
                    <CommunicationCard key={comm.id} communication={comm} />
                  ))}
              </div>
            </div>
          ))}
      </div>
    );
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/communications')}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Schedule</h1>
              <p className="text-gray-600">Plan and manage your communication calendar</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Schedule Communication</span>
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="social">Social Media</option>
              <option value="newsletter">Newsletter</option>
            </select>
            
            <div className="flex bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 text-sm ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'} rounded-l-lg`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'} rounded-r-lg border-l border-gray-300`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Calendar/List View */}
        {viewMode === 'month' ? <CalendarView /> : <ListView />}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Next 7 Days</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationSchedule;
