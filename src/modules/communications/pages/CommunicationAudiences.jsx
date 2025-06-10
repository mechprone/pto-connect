import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ArrowLeft, Plus, Edit, Trash2, Search, Filter,
  Mail, MessageSquare, Eye, Download, Upload, UserPlus,
  School, GraduationCap, Heart, Briefcase, Star
} from 'lucide-react';

const CommunicationAudiences = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAudiences, setSelectedAudiences] = useState([]);

  // Sample audience data
  const audiences = [
    {
      id: 1,
      name: 'All Families',
      description: 'All registered families in the PTO',
      type: 'default',
      memberCount: 342,
      lastUsed: '2024-10-01',
      engagement: 78,
      tags: ['primary', 'families'],
      criteria: 'All active family accounts'
    },
    {
      id: 2,
      name: 'Elementary Parents',
      description: 'Parents with children in grades K-5',
      type: 'grade_based',
      memberCount: 198,
      lastUsed: '2024-09-28',
      engagement: 82,
      tags: ['elementary', 'parents'],
      criteria: 'Children in grades K-5'
    },
    {
      id: 3,
      name: 'Middle School Parents',
      description: 'Parents with children in grades 6-8',
      type: 'grade_based',
      memberCount: 144,
      lastUsed: '2024-09-25',
      engagement: 75,
      tags: ['middle_school', 'parents'],
      criteria: 'Children in grades 6-8'
    },
    {
      id: 4,
      name: 'Active Volunteers',
      description: 'Parents who have volunteered in the last 6 months',
      type: 'engagement',
      memberCount: 89,
      lastUsed: '2024-10-02',
      engagement: 91,
      tags: ['volunteers', 'active'],
      criteria: 'Volunteered in last 6 months'
    },
    {
      id: 5,
      name: 'Event Organizers',
      description: 'Committee leads and event coordinators',
      type: 'role_based',
      memberCount: 23,
      lastUsed: '2024-09-30',
      engagement: 95,
      tags: ['organizers', 'leadership'],
      criteria: 'Committee lead or event coordinator role'
    },
    {
      id: 6,
      name: 'New Families',
      description: 'Families who joined in the last 3 months',
      type: 'temporal',
      memberCount: 47,
      lastUsed: '2024-09-20',
      engagement: 68,
      tags: ['new', 'onboarding'],
      criteria: 'Joined in last 3 months'
    },
    {
      id: 7,
      name: 'High Engagement',
      description: 'Families with high email engagement rates',
      type: 'engagement',
      memberCount: 156,
      lastUsed: '2024-10-01',
      engagement: 89,
      tags: ['engaged', 'responsive'],
      criteria: 'Open rate > 80% in last 6 months'
    },
    {
      id: 8,
      name: 'Teachers & Staff',
      description: 'School teachers and administrative staff',
      type: 'role_based',
      memberCount: 34,
      lastUsed: '2024-09-15',
      engagement: 87,
      tags: ['teachers', 'staff'],
      criteria: 'Teacher or staff role'
    }
  ];

  const getTypeIcon = (type) => {
    const icons = {
      default: Users,
      grade_based: School,
      role_based: Briefcase,
      engagement: Heart,
      temporal: Star
    };
    return icons[type] || Users;
  };

  const getTypeColor = (type) => {
    const colors = {
      default: 'bg-blue-100 text-blue-800',
      grade_based: 'bg-green-100 text-green-800',
      role_based: 'bg-purple-100 text-purple-800',
      engagement: 'bg-red-100 text-red-800',
      temporal: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEngagementColor = (engagement) => {
    if (engagement >= 85) return 'text-green-600';
    if (engagement >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredAudiences = audiences.filter(audience => {
    const matchesSearch = audience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audience.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || audience.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSelectAudience = (audienceId) => {
    setSelectedAudiences(prev => 
      prev.includes(audienceId) 
        ? prev.filter(id => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  const AudienceCard = ({ audience }) => {
    const TypeIcon = getTypeIcon(audience.type);
    const isSelected = selectedAudiences.includes(audience.id);
    
    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(audience.type)}`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{audience.name}</h3>
                <p className="text-sm text-gray-600">{audience.description}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleSelectAudience(audience.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Members</div>
              <div className="text-xl font-bold text-gray-900">{audience.memberCount}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Engagement</div>
              <div className={`text-xl font-bold ${getEngagementColor(audience.engagement)}`}>
                {audience.engagement}%
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Criteria</div>
            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{audience.criteria}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last used: {new Date(audience.lastUsed).toLocaleDateString()}
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
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuickActions = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
          <Plus className="w-6 h-6 text-blue-600 mb-2" />
          <span className="text-sm font-medium">Create Audience</span>
        </button>
        
        <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
          <Upload className="w-6 h-6 text-green-600 mb-2" />
          <span className="text-sm font-medium">Import Contacts</span>
        </button>
        
        <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
          <Mail className="w-6 h-6 text-purple-600 mb-2" />
          <span className="text-sm font-medium">Send to Selected</span>
        </button>
        
        <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors">
          <Download className="w-6 h-6 text-orange-600 mb-2" />
          <span className="text-sm font-medium">Export Lists</span>
        </button>
      </div>
    </div>
  );

  const AudienceStats = () => {
    const totalMembers = audiences.reduce((sum, audience) => sum + audience.memberCount, 0);
    const avgEngagement = Math.round(audiences.reduce((sum, audience) => sum + audience.engagement, 0) / audiences.length);
    const activeAudiences = audiences.filter(audience => {
      const lastUsed = new Date(audience.lastUsed);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastUsed > thirtyDaysAgo;
    }).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Audiences</p>
              <p className="text-2xl font-bold text-gray-900">{audiences.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{avgEngagement}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active (30d)</p>
              <p className="text-2xl font-bold text-gray-900">{activeAudiences}</p>
            </div>
          </div>
        </div>
      </div>
    );
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
              <h1 className="text-3xl font-bold text-gray-900">Communication Audiences</h1>
              <p className="text-gray-600">Manage and organize your communication lists</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedAudiences.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedAudiences.length} selected</span>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Send Communication
                </button>
              </div>
            )}
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Audience</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <AudienceStats />

        {/* Quick Actions */}
        <QuickActions />

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search audiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="default">Default</option>
              <option value="grade_based">Grade Based</option>
              <option value="role_based">Role Based</option>
              <option value="engagement">Engagement</option>
              <option value="temporal">Temporal</option>
            </select>

            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Audiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAudiences.map(audience => (
            <AudienceCard key={audience.id} audience={audience} />
          ))}
        </div>

        {filteredAudiences.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audiences found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or create a new audience</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Your First Audience
            </button>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Stella's Audience Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Create "Frequent Volunteers" List</h4>
              <p className="text-sm text-gray-600">
                23 parents have volunteered 3+ times this year. Create a dedicated list for priority communications.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Segment by Communication Preference</h4>
              <p className="text-sm text-gray-600">
                Consider creating separate lists for email-preferred vs SMS-preferred families for better engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationAudiences;
