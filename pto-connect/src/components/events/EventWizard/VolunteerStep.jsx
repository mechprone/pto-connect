import React, { useState } from 'react';
import { Users, Plus, X, Clock, Star, Mail, Phone, AlertCircle } from 'lucide-react';

const VolunteerStep = ({ data, onUpdate }) => {
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    slots_needed: 1,
    skills_required: [],
    time_commitment: '',
    location: '',
    contact_info: ''
  });

  const predefinedSkills = [
    'Setup/Teardown', 'Food Service', 'Cashier', 'Registration', 'Photography',
    'Sound/AV', 'Childcare', 'Security', 'Cleanup', 'Decorating',
    'Marketing', 'Social Media', 'First Aid', 'Transportation', 'Coordination'
  ];

  const volunteerRoles = [
    {
      title: 'Event Setup',
      description: 'Help set up tables, chairs, decorations, and equipment',
      slots: 4,
      time: '2 hours before event',
      skills: ['Setup/Teardown', 'Coordination']
    },
    {
      title: 'Registration Table',
      description: 'Check in attendees and distribute materials',
      slots: 2,
      time: 'During event',
      skills: ['Registration', 'Customer Service']
    },
    {
      title: 'Food Service',
      description: 'Serve food and beverages to attendees',
      slots: 3,
      time: 'During event',
      skills: ['Food Service', 'Customer Service']
    },
    {
      title: 'Photography',
      description: 'Take photos of the event for social media and records',
      slots: 1,
      time: 'During event',
      skills: ['Photography', 'Social Media']
    },
    {
      title: 'Cleanup Crew',
      description: 'Clean up after the event and return equipment',
      slots: 5,
      time: '1 hour after event',
      skills: ['Cleanup', 'Setup/Teardown']
    }
  ];

  const handleInputChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const addOpportunity = (opportunity) => {
    const opportunities = data.volunteer_opportunities || [];
    const newId = Date.now().toString();
    const newOpportunityWithId = { ...opportunity, id: newId };
    onUpdate({ volunteer_opportunities: [...opportunities, newOpportunityWithId] });
  };

  const removeOpportunity = (id) => {
    const opportunities = data.volunteer_opportunities || [];
    onUpdate({ volunteer_opportunities: opportunities.filter(opp => opp.id !== id) });
  };

  const addPredefinedRole = (role) => {
    const opportunity = {
      id: Date.now().toString(),
      title: role.title,
      description: role.description,
      slots_needed: role.slots,
      time_commitment: role.time,
      skills_required: role.skills,
      location: data.location || '',
      contact_info: ''
    };
    addOpportunity(opportunity);
  };

  const addCustomOpportunity = () => {
    if (!newOpportunity.title.trim()) return;
    
    addOpportunity({
      ...newOpportunity,
      id: Date.now().toString()
    });
    
    setNewOpportunity({
      title: '',
      description: '',
      slots_needed: 1,
      skills_required: [],
      time_commitment: '',
      location: '',
      contact_info: ''
    });
  };

  const toggleSkill = (skill) => {
    const skills = newOpportunity.skills_required || [];
    const updatedSkills = skills.includes(skill)
      ? skills.filter(s => s !== skill)
      : [...skills, skill];
    setNewOpportunity({ ...newOpportunity, skills_required: updatedSkills });
  };

  const getTotalSlotsNeeded = () => {
    const opportunities = data.volunteer_opportunities || [];
    return opportunities.reduce((total, opp) => total + (parseInt(opp.slots_needed) || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Volunteer Coordinator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Volunteer Coordinator
          </label>
          <input
            type="text"
            value={data.volunteer_coordinator || ''}
            onChange={(e) => handleInputChange('volunteer_coordinator', e.target.value)}
            placeholder="Name of volunteer coordinator"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Person responsible for managing volunteers
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requirements
          </label>
          <textarea
            value={data.volunteer_requirements || ''}
            onChange={(e) => handleInputChange('volunteer_requirements', e.target.value)}
            placeholder="Any special requirements for volunteers (background checks, training, etc.)"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Add Predefined Roles */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add Common Volunteer Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteerRoles.map((role, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{role.title}</h4>
                <button
                  onClick={() => addPredefinedRole(role)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{role.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>👥 {role.slots} volunteer{role.slots !== 1 ? 's' : ''} needed</div>
                <div>⏰ {role.time}</div>
                <div>🏷️ {role.skills.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Volunteer Opportunity */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Custom Volunteer Opportunity</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Title
              </label>
              <input
                type="text"
                value={newOpportunity.title}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
                placeholder="e.g., Sound System Operator"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Volunteers Needed
              </label>
              <input
                type="number"
                value={newOpportunity.slots_needed}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, slots_needed: parseInt(e.target.value) || 1 })}
                min="1"
                max="20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newOpportunity.description}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
              placeholder="Describe what this volunteer role involves..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time Commitment
              </label>
              <input
                type="text"
                value={newOpportunity.time_commitment}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, time_commitment: e.target.value })}
                placeholder="e.g., 2 hours during event"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <input
                type="text"
                value={newOpportunity.contact_info}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, contact_info: e.target.value })}
                placeholder="Email or phone for questions"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="w-4 h-4 inline mr-1" />
              Skills Required (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`
                    px-3 py-1 rounded-full text-sm transition-all
                    ${newOpportunity.skills_required?.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustomOpportunity}
            disabled={!newOpportunity.title.trim()}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Volunteer Opportunity
          </button>
        </div>
      </div>

      {/* Current Volunteer Opportunities */}
      {data.volunteer_opportunities && data.volunteer_opportunities.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Volunteer Opportunities ({data.volunteer_opportunities.length})
            </h3>
            <div className="text-sm text-gray-600">
              Total volunteers needed: <span className="font-medium">{getTotalSlotsNeeded()}</span>
            </div>
          </div>

          <div className="space-y-4">
            {data.volunteer_opportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium text-gray-900 mr-3">{opportunity.title}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {opportunity.slots_needed} volunteer{opportunity.slots_needed !== 1 ? 's' : ''} needed
                      </span>
                    </div>
                    
                    {opportunity.description && (
                      <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {opportunity.time_commitment && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {opportunity.time_commitment}
                        </div>
                      )}
                      {opportunity.contact_info && (
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {opportunity.contact_info}
                        </div>
                      )}
                    </div>
                    
                    {opportunity.skills_required && opportunity.skills_required.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {opportunity.skills_required.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeOpportunity(opportunity.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary and Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Volunteer Management Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Clearly define what each volunteer role involves</li>
          <li>• Provide contact information for volunteers to ask questions</li>
          <li>• Consider skill requirements to match the right people to roles</li>
          <li>• Plan for 10-20% more volunteers than you think you need</li>
          <li>• Send reminder emails 1 week and 1 day before the event</li>
        </ul>
      </div>

      {/* Validation */}
      {data.volunteer_opportunities && data.volunteer_opportunities.length === 0 && (
        <div className="text-sm text-amber-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Consider adding volunteer opportunities to help make your event successful
        </div>
      )}
    </div>
  );
};

export default VolunteerStep;
