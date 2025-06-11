import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, MessageSquare, Megaphone, Calendar, Users, 
  Sparkles, User, BarChart3, Send, Eye, Edit, 
  Plus, Search, Filter, Grid, List, Clock,
  Facebook, Instagram, Twitter, Smartphone
} from 'lucide-react';
import AIAssistanceToggle from '../../../components/common/AIAssistanceToggle';
import { useStella } from '../../../components/common/StellaProvider';

const EnhancedCommunicationsDashboard = () => {
  const navigate = useNavigate();
  const { openStella } = useStella();
  const [viewMode, setViewMode] = useState('grid');
  const [creationMode, setCreationMode] = useState('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Sample communications data
  const communications = [
    {
      id: 1,
      title: 'Fall Festival Announcement',
      type: 'email',
      status: 'sent',
      audience: 'All Families',
      sentDate: '2024-10-01',
      openRate: 78,
      clickRate: 12,
      createdBy: 'stella',
      description: 'Exciting announcement about our upcoming Fall Festival'
    },
    {
      id: 2,
      title: 'Volunteer Recruitment Drive',
      type: 'social',
      status: 'scheduled',
      audience: 'Facebook & Instagram',
      scheduledDate: '2024-10-05',
      engagement: 0,
      createdBy: 'manual',
      description: 'Call for volunteers for upcoming events'
    },
    {
      id: 3,
      title: 'Book Fair Reminder',
      type: 'sms',
      status: 'draft',
      audience: 'Parent Contacts',
      deliveryRate: 0,
      createdBy: 'stella',
      description: 'Reminder about the upcoming book fair'
    },
    {
      id: 4,
      title: 'Monthly Newsletter',
      type: 'newsletter',
      status: 'in_progress',
      audience: 'All Subscribers',
      progress: 65,
      createdBy: 'manual',
      description: 'October newsletter with updates and events'
    }
  ];

  const handleCreationModeChange = (mode, settings) => {
    setCreationMode(mode);
    console.log('Creation mode changed:', mode, settings);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const getTypeIcon = (type) => {
    const icons = {
      email: Mail,
      sms: Smartphone,
      social: Megaphone,
      newsletter: Calendar
    };
    return icons[type] || Mail;
  };

  const CommunicationCard = ({ communication }) => {
    const TypeIcon = getTypeIcon(communication.type);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <TypeIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-gray-900 truncate">{communication.title}</h3>
                {communication.createdBy === 'stella' && (
                  <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" title="Created by Stella" />
                )}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{communication.description}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusColor(communication.status)}`}>
              {communication.status.replace('_', ' ').charAt(0).toUpperCase() + communication.status.replace('_', ' ').slice(1)}
            </span>
          </div>

          {/* Compact Info Row */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span className="truncate">{communication.audience}</span>
            </div>
            {communication.sentDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(communication.sentDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Compact Performance Metrics */}
          {communication.status === 'sent' && (
            <div className="flex space-x-2 mb-3">
              <div className="flex-1 text-center p-2 bg-green-50 rounded">
                <div className="text-xs text-green-600">Open</div>
                <div className="text-sm font-semibold text-green-700">{communication.openRate}%</div>
              </div>
              <div className="flex-1 text-center p-2 bg-blue-50 rounded">
                <div className="text-xs text-blue-600">Click</div>
                <div className="text-sm font-semibold text-blue-700">{communication.clickRate}%</div>
              </div>
            </div>
          )}

          {/* Compact Progress Bar */}
          {communication.status === 'in_progress' && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{communication.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${communication.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Compact Action Buttons */}
          <div className="flex space-x-1">
            <button 
              onClick={() => navigate(`/communications/details/${communication.id}`)}
              className="flex-1 flex items-center justify-center px-2 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </button>
            <button 
              onClick={() => navigate(`/communications/${communication.type === 'newsletter' ? 'email' : communication.type}/edit/${communication.id}`)}
              className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </button>
            {communication.status === 'draft' && (
              <button className="flex-1 flex items-center justify-center px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                <Send className="w-3 h-3 mr-1" />
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreateCommunicationOptions = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Communication</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Email Campaign */}
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Email Campaign</h3>
              <p className="text-sm text-gray-600">Reach all families</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <button 
              onClick={() => navigate('/communications/email')}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Manual Creation
            </button>
            <button 
              onClick={() => navigate('/communications/email?mode=assisted')}
              className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              Let Stella Help
            </button>
            <button 
              onClick={() => navigate('/communications/email?mode=auto')}
              className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
            >
              Stella Auto-Generate
            </button>
          </div>
        </div>

        {/* Social Media */}
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <Megaphone className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Social Media</h3>
              <p className="text-sm text-gray-600">Facebook & Instagram</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <button onClick={() => navigate('/communications/social')} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Manual Creation
            </button>
            <button onClick={() => navigate('/communications/social?mode=assisted')} className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
              Let Stella Help
            </button>
            <button onClick={() => navigate('/communications/social?mode=auto')} className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
              Stella Auto-Generate
            </button>
          </div>
        </div>

        {/* SMS Campaign */}
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-yellow-300 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <Smartphone className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-gray-900">SMS Campaign</h3>
              <p className="text-sm text-gray-600">Direct text messages</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <button onClick={() => navigate('/communications/sms')} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Manual Creation
            </button>
            <button onClick={() => navigate('/communications/sms?mode=assisted')} className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
              Let Stella Help
            </button>
            <button onClick={() => navigate('/communications/sms?mode=auto')} className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
              Stella Auto-Generate
            </button>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Newsletter</h3>
              <p className="text-sm text-gray-600">Monthly updates</p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Manual Creation
            </button>
            <button className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
              Let Stella Help
            </button>
            <button className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
              Stella Auto-Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const StellaInsights = () => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">Stella's Communication Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Best Send Time</div>
          <div className="text-lg font-semibold text-purple-900">Tuesday 10 AM</div>
          <div className="text-xs text-purple-700">Based on your audience engagement</div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Top Performing Subject</div>
          <div className="text-lg font-semibold text-purple-900">Event Announcements</div>
          <div className="text-xs text-purple-700">85% average open rate</div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Stella's Suggestion</div>
          <div className="text-lg font-semibold text-purple-900">Add Volunteer Call</div>
          <div className="text-xs text-purple-700">Include in next newsletter</div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded-lg">
        <div className="text-sm text-purple-900 font-medium mb-2">💡 Stella's Tip of the Day</div>
        <div className="text-sm text-purple-800">
          "Your Fall Festival emails get 23% higher engagement when sent on weekday mornings. 
          Want me to schedule your next announcement for optimal timing?"
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={openStella}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
        >
          <Sparkles className="w-6 h-6 text-purple-600 mb-2" />
          <span className="text-sm font-medium">Ask Stella</span>
          <span className="text-xs text-gray-500">Get content ideas</span>
        </button>
        
        <button 
          onClick={() => navigate('/communications/analytics')}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
        >
          <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
          <span className="text-sm font-medium">Analytics</span>
          <span className="text-xs text-gray-500">View performance</span>
        </button>
        
        <button 
          onClick={() => navigate('/communications/schedule')}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
        >
          <Clock className="w-6 h-6 text-yellow-600 mb-2" />
          <span className="text-sm font-medium">Schedule</span>
          <span className="text-xs text-gray-500">Plan campaigns</span>
        </button>
        
        <button 
          onClick={() => navigate('/communications/audiences')}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <Users className="w-6 h-6 text-blue-600 mb-2" />
          <span className="text-sm font-medium">Audiences</span>
          <span className="text-xs text-gray-500">Manage lists</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header with Quick Actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
            <p className="text-sm text-gray-600">Manage all your PTO communications</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quick Action Buttons */}
            <button 
              onClick={openStella}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask Stella
            </button>
            <button
              onClick={() => navigate('/communications/analytics')}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Compact Stella Insights & Create Options Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Stella Insights - Expanded to match height */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 h-full">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-purple-900">Stella's Insights</h3>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-purple-600">Best Send Time</div>
                  <div className="text-sm font-semibold text-purple-900">Tuesday 10 AM</div>
                  <div className="text-xs text-purple-700">85% open rate</div>
                </div>
                
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-purple-600">Top Performing</div>
                  <div className="text-sm font-semibold text-purple-900">Event Announcements</div>
                  <div className="text-xs text-purple-700">78% avg engagement</div>
                </div>
                
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-purple-600">This Week's Goal</div>
                  <div className="text-sm font-semibold text-purple-900">Volunteer Recruitment</div>
                  <div className="text-xs text-purple-700">Fall Festival needs</div>
                </div>
                
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-purple-600">Engagement Trend</div>
                  <div className="text-sm font-semibold text-green-700">↗ +12% This Month</div>
                  <div className="text-xs text-purple-700">Great improvement!</div>
                </div>
              </div>
              
              <div className="bg-white rounded p-2">
                <div className="text-xs text-purple-900 font-medium mb-1">💡 Quick Tip</div>
                <div className="text-xs text-purple-800">
                  "Add emojis to subject lines for 15% higher open rates!"
                </div>
              </div>
            </div>
          </div>

          {/* Create Communication Options - Compact 2x2 Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Create New Communication</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Email Campaign */}
                <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Email</h4>
                      <p className="text-xs text-gray-600">Reach all families</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => navigate('/communications/email')}
                      className="w-full py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      Manual
                    </button>
                    <button 
                      onClick={() => navigate('/communications/email?mode=assisted')}
                      className="w-full py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      Stella Assist
                    </button>
                    <button 
                      onClick={() => navigate('/communications/email?mode=auto')}
                      className="w-full py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                    >
                      Stella Auto
                    </button>
                  </div>
                </div>

                {/* Social Media */}
                <div className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <Megaphone className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Social</h4>
                      <p className="text-xs text-gray-600">Facebook & Instagram</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => navigate('/communications/social')}
                      className="w-full py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      Manual
                    </button>
                    <button 
                      onClick={() => navigate('/communications/social?mode=assisted')}
                      className="w-full py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      Stella Assist
                    </button>
                    <button 
                      onClick={() => navigate('/communications/social?mode=auto')}
                      className="w-full py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                    >
                      Stella Auto
                    </button>
                  </div>
                </div>

                {/* SMS Campaign */}
                <div className="border border-gray-200 rounded-lg p-3 hover:border-yellow-300 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <Smartphone className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">SMS</h4>
                      <p className="text-xs text-gray-600">Direct messages</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => navigate('/communications/sms')}
                      className="w-full py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      Manual
                    </button>
                    <button 
                      onClick={() => navigate('/communications/sms?mode=assisted')}
                      className="w-full py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      Stella Assist
                    </button>
                    <button 
                      onClick={() => navigate('/communications/sms?mode=auto')}
                      className="w-full py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                    >
                      Stella Auto
                    </button>
                  </div>
                </div>

                {/* Newsletter */}
                <div className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Newsletter</h4>
                      <p className="text-xs text-gray-600">Monthly updates</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => navigate('/communications/newsletter')}
                      className="w-full py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      Manual
                    </button>
                    <button 
                      onClick={() => navigate('/communications/newsletter?mode=assisted')}
                      className="w-full py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      Stella Assist
                    </button>
                    <button 
                      onClick={() => navigate('/communications/newsletter?mode=auto')}
                      className="w-full py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                    >
                      Stella Auto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="social">Social Media</option>
              <option value="newsletter">Newsletter</option>
            </select>

            <button 
              onClick={() => navigate('/communications/schedule')}
              className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
            >
              <Clock className="w-4 h-4 mr-1" />
              Schedule
            </button>
            
            <button 
              onClick={() => navigate('/communications/audiences')}
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Users className="w-4 h-4 mr-1" />
              Audiences
            </button>
          </div>
        </div>

        {/* Communications List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {communications.map(communication => (
            <CommunicationCard key={communication.id} communication={communication} />
          ))}
        </div>

        {communications.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first communication</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Your First Communication
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default EnhancedCommunicationsDashboard;
