import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PaperAirplaneIcon, 
  TrashIcon, 
  EyeIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useUserProfile } from '@/modules/hooks/useUserProfile';
import { supabase } from '../../utils/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const SMSCampaignManager = () => {
  const { profile, organization } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (organization?.id) {
      fetchCampaigns();
    }
  }, [organization?.id]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl || apiUrl.includes('localhost')) {
        // Skip API calls if API is not available or pointing to localhost
        console.log('SMS campaigns fetch skipped: API not available or in development mode');
        setCampaigns([
          {
            id: 1,
            name: 'Volunteer Reminder',
            message: 'Don\'t forget about tomorrow\'s volunteer event!',
            status: 'sent',
            recipient_count: 25,
            sent_count: 25,
            created_at: new Date().toISOString(),
            scheduled_at: null
          },
          {
            id: 2,
            name: 'Event Update',
            message: 'The Fall Festival has been moved to the gymnasium due to weather.',
            status: 'draft',
            recipient_count: 45,
            sent_count: 0,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            scheduled_at: null
          }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/communications/sms/campaigns`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data || []);
      } else {
        setError('Failed to load SMS campaigns');
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load SMS campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (campaignData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/communications/sms/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(prev => [data.data, ...prev]);
        setShowCreateModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create campaign');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError('Failed to create campaign');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/communications/sms/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update campaign status
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: 'sent', sent_count: data.data.sent_count }
            : campaign
        ));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send campaign');
      }
    } catch (err) {
      console.error('Error sending campaign:', err);
      setError('Failed to send campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/communications/sms/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete campaign');
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <PencilIcon className="h-5 w-5 text-gray-500" />;
      case 'scheduled':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'sending':
        return <LoadingSpinner size="sm" />;
      case 'sent':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <PencilIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SMS Campaigns</h1>
            <p className="text-gray-600 mt-1">
              Send SMS messages to your PTO members
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <ErrorMessage message={error} onRetry={fetchCampaigns} />
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SMS campaigns yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first SMS campaign to start communicating with your members
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {campaign.message_content}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(campaign.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.recipient_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.sent_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {campaign.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleSendCampaign(campaign.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Send Campaign"
                            >
                              <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Campaign"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCampaign}
        />
      )}

      {/* Campaign Details Modal */}
      {showDetailsModal && selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCampaign(null);
          }}
        />
      )}
    </div>
  );
};

// Create Campaign Modal Component
const CreateCampaignModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    message_content: '',
    recipient_type: 'all',
    scheduled_for: ''
  });
  const [saving, setSaving] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleMessageChange = (e) => {
    const message = e.target.value;
    setFormData(prev => ({ ...prev, message_content: message }));
    setCharacterCount(message.length);
  };

  const getSMSCount = () => {
    if (characterCount <= 160) return 1;
    return Math.ceil(characterCount / 153);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create SMS Campaign</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Meeting Reminder"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              required
              value={formData.message_content}
              onChange={handleMessageChange}
              rows={4}
              maxLength={1600}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Type your SMS message here..."
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{characterCount}/1600 characters</span>
              <span>{getSMSCount()} SMS{getSMSCount() > 1 ? ' messages' : ' message'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients
            </label>
            <select
              value={formData.recipient_type}
              onChange={(e) => setFormData(prev => ({ ...prev, recipient_type: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Members</option>
              <option value="board_members">Board Members Only</option>
              <option value="volunteers">Volunteers Only</option>
              <option value="parents">Parents Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule for Later (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_for}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to send immediately
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name || !formData.message_content}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving && <LoadingSpinner size="sm" />}
              <span>{saving ? 'Creating...' : 'Create Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Campaign Details Modal Component
const CampaignDetailsModal = ({ campaign, onClose }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  useEffect(() => {
    if (campaign.status === 'sent') {
      fetchDeliveries();
    }
  }, [campaign.id]);

  const fetchDeliveries = async () => {
    try {
      setLoadingDeliveries(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/communications/sms/campaigns/${campaign.id}/deliveries`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoadingDeliveries(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
            <p className="text-sm text-gray-500">Campaign Details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Campaign Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Message Content</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{campaign.message_content}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recipients</h4>
                <p className="text-gray-600">{campaign.recipient_type}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Recipients</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {campaign.recipient_count || 0}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Sent</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {campaign.sent_count || 0}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                <p className="text-gray-600">
                  {new Date(campaign.created_at).toLocaleString()}
                </p>
              </div>

              {campaign.sent_at && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sent</h4>
                  <p className="text-gray-600">
                    {new Date(campaign.sent_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Status */}
          {campaign.status === 'sent' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Delivery Status</h4>
              {loadingDeliveries ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : deliveries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sent At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivered At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deliveries.map((delivery, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.phone_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              delivery.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {delivery.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(delivery.sent_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No delivery data available</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMSCampaignManager;
