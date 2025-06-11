import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, MessageSquare, Megaphone, Calendar, Users,
  BarChart2, CheckCircle, Percent, MousePointerClick, Edit, Trash2,
  Clock, Send
} from 'lucide-react';

const CommunicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [communication, setCommunication] = useState(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCommunication({
        id: parseInt(id),
        title: 'Fall Festival Announcement',
        type: 'email',
        status: 'sent',
        createdBy: 'stella',
        sentDate: '2024-10-01T10:00:00Z',
        audience: {
          name: 'All Families',
          size: 450,
        },
        analytics: {
          sent: 450,
          delivered: 445,
          opens: 347,
          clicks: 54,
          bounces: 5,
        },
        content: {
          subject: 'Get Ready for the Annual Fall Festival!',
          body: '<h1>Join Us for Fun and Festivities!</h1><p>Our annual Fall Festival is just around the corner! Mark your calendars for an afternoon of games, food, and community fun. We can\'t wait to see you there!</p><p><strong>When:</strong> October 15th, 2-6 PM</p><p><strong>Where:</strong> Central Park</p>',
        },
        links: [
          { id: 1, url: 'https://ptoconnect.com/events/1/rsvp', clicks: 35 },
          { id: 2, url: 'https://ptoconnect.com/volunteer', clicks: 19 },
        ]
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!communication) {
    return <div className="text-center p-8">Communication not found.</div>;
  }

  const getIcon = (type) => {
    switch(type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'social': return Megaphone;
      default: return Mail;
    }
  };
  const TypeIcon = getIcon(communication.type);

  const openRate = ((communication.analytics.opens / communication.analytics.delivered) * 100).toFixed(1);
  const clickRate = ((communication.analytics.clicks / communication.analytics.opens) * 100).toFixed(1);
  const deliveryRate = ((communication.analytics.delivered / communication.analytics.sent) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/communications')} className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Communications Dashboard
        </button>

        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <TypeIcon className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">{communication.title}</h1>
              </div>
              <p className="text-gray-600 mt-2">
                Sent on {new Date(communication.sentDate).toLocaleString()} to <span className="font-medium">{communication.audience.name}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"><Edit className="w-4 h-4 mr-2" />Edit</button>
              <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 className="w-4 h-4 mr-2" />Delete</button>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <AnalyticsCard icon={CheckCircle} label="Delivery Rate" value={`${deliveryRate}%`} />
          <AnalyticsCard icon={Percent} label="Open Rate" value={`${openRate}%`} />
          <AnalyticsCard icon={MousePointerClick} label="Click Rate" value={`${clickRate}%`} />
          <AnalyticsCard icon={Users} label="Audience Size" value={communication.audience.size} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Preview */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Preview</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="font-medium text-gray-800 mb-2">Subject: {communication.content.subject}</p>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: communication.content.body }} />
            </div>
          </div>

          {/* Link Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Link Performance</h3>
            <div className="space-y-4">
              {communication.links.map(link => (
                <div key={link.id}>
                  <div className="flex justify-between items-center text-sm">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate w-4/5">{link.url}</a>
                    <span className="font-medium">{link.clicks} clicks</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(link.clicks / communication.analytics.clicks) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center space-x-4">
      <div className="bg-blue-100 p-3 rounded-full">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default CommunicationDetails;
