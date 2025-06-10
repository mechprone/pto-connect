import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign,
  CheckSquare, Mail, MessageSquare, Edit, Trash2, Plus,
  BarChart2, List, UserCheck, FileText
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEvent({
        id: parseInt(id),
        name: 'Fall Festival 2024',
        date: '2024-10-15',
        time: '2:00 PM - 6:00 PM',
        location: 'Central Park',
        description: 'Our biggest community event of the year! Join us for a fun-filled afternoon with games, food trucks, a bouncy castle, and live music. All proceeds support school programs.',
        status: 'planning',
        progress: 65,
        overview: {
          rsvps: 185,
          volunteers: 22,
          budget: 5000,
          spent: 2800,
          projectedProfit: 1800,
        },
        tasks: [
          { id: 1, text: 'Book food trucks', completed: true, assignedTo: 'Anna' },
          { id: 2, text: 'Secure park permit', completed: true, assignedTo: 'Mike' },
          { id: 3, text: 'Organize volunteer schedule', completed: false, assignedTo: 'Chloe' },
          { id: 4, text: 'Order decorations', completed: false, assignedTo: 'Sam' },
          { id: 5, text: 'Send out final reminder email', completed: false, assignedTo: 'System' },
        ],
        volunteers: [
          { id: 1, name: 'John Doe', role: 'Setup Crew', shift: '12pm-3pm' },
          { id: 2, name: 'Jane Smith', role: 'Games Booth', shift: '2pm-4pm' },
          { id: 3, name: 'Emily White', role: 'Clean-up Crew', shift: '5pm-7pm' },
          { id: 4, name: 'Michael Brown', role: 'Games Booth', shift: '4pm-6pm' },
        ],
        budgetSummary: [
          { category: 'Venue', amount: 500 },
          { category: 'Food & Drinks', amount: 2000 },
          { category: 'Entertainment', amount: 1500 },
          { category: 'Decorations', amount: 500 },
          { category: 'Contingency', amount: 500 },
        ],
        communications: [
          { id: 1, type: 'Email', subject: 'Save the Date!', date: '2024-09-01', status: 'Sent' },
          { id: 2, type: 'SMS', subject: 'Volunteers Needed!', date: '2024-09-15', status: 'Sent' },
          { id: 3, type: 'Email', subject: 'Event Reminder', date: '2024-10-13', status: 'Scheduled' },
        ]
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskList tasks={event.tasks} />;
      case 'volunteers':
        return <VolunteerList volunteers={event.volunteers} />;
      case 'budget':
        return <BudgetSummary summary={event.budgetSummary} overview={event.overview} />;
      case 'communications':
        return <CommunicationList communications={event.communications} />;
      default:
        return <OverviewPanel event={event} />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!event) {
    return <div className="text-center p-8">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/events')} className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Events Dashboard
        </button>

        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <div className="flex items-center space-x-6 text-gray-600 mt-2">
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {event.date}</div>
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {event.time}</div>
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {event.location}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate(`/events/edit/${event.id}`)} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"><Edit className="w-4 h-4 mr-2" />Edit</button>
              <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 className="w-4 h-4 mr-2" />Delete</button>
            </div>
          </div>
          <p className="text-gray-700 mt-4">{event.description}</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Event Progress</span>
              <span className="font-medium text-gray-900">{event.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${event.progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <TabButton name="overview" label="Overview" icon={BarChart2} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton name="tasks" label="Tasks" icon={CheckSquare} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton name="volunteers" label="Volunteers" icon={UserCheck} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton name="budget" label="Budget" icon={DollarSign} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton name="communications" label="Communications" icon={Mail} activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

const TabButton = ({ name, label, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(name)}
    className={`${
      activeTab === name
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
  >
    <Icon className="w-5 h-5 mr-2" />
    {label}
  </button>
);

const OverviewPanel = ({ event }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <MetricCard icon={Users} label="RSVPs" value={event.overview.rsvps} />
        <MetricCard icon={UserCheck} label="Volunteers" value={event.overview.volunteers} />
        <MetricCard icon={DollarSign} label="Budget" value={`$${event.overview.budget.toLocaleString()}`} />
        <MetricCard icon={DollarSign} label="Spent" value={`$${event.overview.spent.toLocaleString()}`} color="text-red-600" />
        <MetricCard icon={DollarSign} label="Projected Profit" value={`$${event.overview.projectedProfit.toLocaleString()}`} color="text-green-600" />
      </div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <QuickActionButton icon={Plus} label="Add New Task" />
        <QuickActionButton icon={UserCheck} label="Manage Volunteers" />
        <QuickActionButton icon={FileText} label="View RSVP List" />
        <QuickActionButton icon={Mail} label="Send Email to Attendees" />
      </div>
    </div>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, color = 'text-gray-900' }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="bg-blue-100 p-2 rounded-full">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`text-xl font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </button>
);

const TaskList = ({ tasks }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Task List</h3>
      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4 mr-2" />Add Task</button>
    </div>
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task.id} className={`p-3 rounded-lg flex items-center justify-between ${task.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="flex items-center">
            <input type="checkbox" checked={task.completed} readOnly className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <p className={`ml-3 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.text}</p>
          </div>
          <div className="text-sm text-gray-500">Assigned to: {task.assignedTo}</div>
        </div>
      ))}
    </div>
  </div>
);

const VolunteerList = ({ volunteers }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Volunteer Schedule</h3>
      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4 mr-2" />Add Volunteer</button>
    </div>
    <div className="flow-root">
      <ul className="-my-5 divide-y divide-gray-200">
        {volunteers.map(v => (
          <li key={v.id} className="py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                <p className="text-sm text-gray-500 truncate">{v.role}</p>
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {v.shift}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const BudgetSummary = ({ summary, overview }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
    <div className="grid grid-cols-3 gap-4 mb-6 text-center">
      <div><p className="text-sm text-gray-500">Total Budget</p><p className="text-2xl font-bold">${overview.budget.toLocaleString()}</p></div>
      <div><p className="text-sm text-gray-500">Spent</p><p className="text-2xl font-bold text-red-600">${overview.spent.toLocaleString()}</p></div>
      <div><p className="text-sm text-gray-500">Remaining</p><p className="text-2xl font-bold text-green-600">${(overview.budget - overview.spent).toLocaleString()}</p></div>
    </div>
    <h4 className="font-semibold text-gray-800 mb-2">Category Breakdown</h4>
    <div className="space-y-2">
      {summary.map(item => (
        <div key={item.category} className="flex justify-between items-center">
          <p className="text-gray-700">{item.category}</p>
          <p className="font-medium">${item.amount.toLocaleString()}</p>
        </div>
      ))}
    </div>
  </div>
);

const CommunicationList = ({ communications }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication History</h3>
    <ul className="divide-y divide-gray-200">
      {communications.map(comm => (
        <li key={comm.id} className="py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {comm.type === 'Email' ? <Mail className="w-5 h-5 text-gray-400" /> : <MessageSquare className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="font-medium text-gray-800">{comm.subject}</p>
              <p className="text-sm text-gray-500">Sent on {comm.date}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${comm.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{comm.status}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default EventDetails;
