import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import EventTasksList from '../components/EventTasksList';
import AddTaskModal from '../components/AddTaskModal';

// Tab config
const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'budget', label: 'Budget' },
  { key: 'communications', label: 'Communications' },
  { key: 'fundraising', label: 'Fundraising' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'project-management', label: 'Event Management' },
  { key: 'files', label: 'Files/Docs' },
];

// Placeholder for Stella Insights (to be replaced with orchestrator-powered content)
const stellaTipsFallback = [
  'Review your volunteer assignments to ensure all roles are filled.',
  'Schedule a reminder email 3 days before the event for maximum turnout.',
  'Check your budget for unallocated funds that could enhance the event experience.',
];

const pastelBox = 'bg-white bg-opacity-80 rounded-2xl shadow-lg border border-purple-100';

const EventDetailPage = () => {
  // Get id from route params (for future data fetching)
  const { id } = useParams();
  const navigate = useNavigate();

  // Section refs for scrolling
  const sectionRefs = {
    overview: useRef(null),
    budget: useRef(null),
    communications: useRef(null),
    fundraising: useRef(null),
    volunteers: useRef(null),
    'project-management': useRef(null),
    files: useRef(null),
  };

  // Track active tab for scrollspy
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpArrow, setShowUpArrow] = useState(false);

  // Event data state
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Budget/expenses state
  const [expenses, setExpenses] = useState([]);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetError, setBudgetError] = useState(null);

  // Communications state
  const [communications, setCommunications] = useState([]);
  const [commLoading, setCommLoading] = useState(true);
  const [commError, setCommError] = useState(null);

  // Fundraising state
  const [fundraising, setFundraising] = useState([]);
  const [fundraisingLoading, setFundraisingLoading] = useState(true);
  const [fundraisingError, setFundraisingError] = useState(null);

  // 1. Add a useState for expanded/collapsed core details and for edit mode.
  const [isCoreDetailsExpanded, setIsCoreDetailsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 1. Add state for editedEvent (copy of event for editing), and saving state.
  const [editedEvent, setEditedEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch event data from Supabase
  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        if (fetchError) {
          setError('Event not found.');
        } else {
          setEvent(data);
        }
      } catch (err) {
        setError('Error loading event.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchEvent();
  }, [id]);

  // Fetch expenses for this event
  useEffect(() => {
    async function fetchExpenses() {
      if (!id) return;
      setBudgetLoading(true);
      setBudgetError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('expense_submissions')
          .select('*')
          .eq('event_id', id)
          .order('expense_date', { ascending: false });
        if (fetchError) {
          setBudgetError('Could not load expenses.');
        } else {
          setExpenses(data || []);
        }
      } catch (err) {
        setBudgetError('Error loading expenses.');
      } finally {
        setBudgetLoading(false);
      }
    }
    fetchExpenses();
  }, [id]);

  // Fetch communications for this event
  useEffect(() => {
    async function fetchCommunications() {
      if (!id) return;
      setCommLoading(true);
      setCommError(null);
      try {
        // Fetch email campaigns, SMS campaigns, and social posts
        const [emailResult, smsResult, socialResult] = await Promise.all([
          supabase.from('email_campaigns').select('*').eq('org_id', event?.org_id).order('created_at', { ascending: false }),
          supabase.from('sms_campaigns').select('*').eq('org_id', event?.org_id).order('created_at', { ascending: false }),
          supabase.from('social_posts').select('*').eq('org_id', event?.org_id).order('created_at', { ascending: false })
        ]);
        
        if (emailResult.error || smsResult.error || socialResult.error) {
          setCommError('Could not load communications.');
        } else {
          // Combine and format all communications
          const allComms = [
            ...(emailResult.data || []).map(c => ({ ...c, type: 'email', campaign_name: c.subject })),
            ...(smsResult.data || []).map(c => ({ ...c, type: 'sms', campaign_name: c.name })),
            ...(socialResult.data || []).map(c => ({ ...c, type: 'social', campaign_name: c.content?.substring(0, 50) + '...' }))
          ];
          setCommunications(allComms);
        }
      } catch (err) {
        setCommError('Error loading communications.');
      } finally {
        setCommLoading(false);
      }
    }
    fetchCommunications();
  }, [id, event?.org_id]);

  // Fetch fundraising campaigns for this event
  useEffect(() => {
    async function fetchFundraising() {
      if (!id) return;
      setFundraisingLoading(true);
      setFundraisingError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('fundraising_campaigns')
          .select('*')
          .eq('org_id', event?.org_id)
          .order('created_at', { ascending: false });
        if (fetchError) {
          setFundraisingError('Could not load fundraising campaigns.');
        } else {
          setFundraising(data || []);
        }
      } catch (err) {
        setFundraisingError('Error loading fundraising campaigns.');
      } finally {
        setFundraisingLoading(false);
      }
    }
    fetchFundraising();
  }, [id, event?.org_id]);

  // Scroll to section on tab click
  const handleTabClick = (key) => {
    sectionRefs[key].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Scrollspy: update active tab on scroll
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 100; // height of sticky tab bar + margin
      let current = TABS[0].key;
      for (let i = 0; i < TABS.length; i++) {
        const ref = sectionRefs[TABS[i].key].current;
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.top - threshold <= 0) {
            current = TABS[i].key;
          }
        }
      }
      setActiveTab(current);
      setShowUpArrow(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Responsive: show sidebar on desktop, below overview on mobile
  const isDesktop = window.innerWidth >= 1024;

  // LocalStorage caching for event data and UI state
  useEffect(() => {
    if (event) {
      localStorage.setItem(`event-detail-${event.id}`, JSON.stringify(event));
    }
  }, [event]);

  useEffect(() => {
    const cached = localStorage.getItem(`event-detail-${id}`);
    if (!event && cached) {
      setEvent(JSON.parse(cached));
      setLoading(false);
    }
  }, [id]);

  // 2. When expanding core details, set editedEvent to event.
  const handleExpandCoreDetails = () => {
    setEditedEvent(event);
    setIsCoreDetailsExpanded(true);
  };

  // 3. When clicking edit, enable edit mode.
  const handleEditCoreDetails = () => {
    setIsEditMode(true);
    setEditedEvent(event);
  };

  // 4. On input change, update editedEvent.
  const handleInputChange = (field, value) => {
    setEditedEvent(prev => ({ ...prev, [field]: value }));
  };

  // 5. On Save, update event via API, lock fields, and update event state.
  const handleSaveCoreDetails = async () => {
    setSaving(true);
    try {
      // Update event in Supabase
      const { data, error } = await supabase
        .from('events')
        .update(editedEvent)
        .eq('id', event.id)
        .single();
      if (!error) {
        setEvent(data);
        setIsEditMode(false);
      } else {
        alert('Failed to save changes.');
      }
    } catch (err) {
      alert('Error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  // 6. On Cancel, revert changes and lock fields.
  const handleCancelEdit = () => {
    setEditedEvent(event);
    setIsEditMode(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Tab Navigation */}
        <div className="sticky top-0 z-10 bg-white bg-opacity-90 pt-2 pb-1 mb-6 border-b flex justify-evenly" style={{backdropFilter:'blur(4px)'}}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`flex-1 text-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Sections */}
        <section ref={sectionRefs.overview} id="overview" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Event Overview</h2>
          {loading ? (
            <div className="bg-white rounded-xl shadow p-6 text-gray-500">Loading event...</div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow p-6 text-red-500">{error}</div>
          ) : event ? (
            <div className="bg-white rounded-xl shadow p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  {isEditMode ? (
                    <input
                      className="text-xl font-semibold text-gray-900 border-b border-blue-200 focus:outline-none focus:border-blue-500 bg-white px-2 py-1"
                      value={editedEvent.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">{event.status}</span>
                </div>
                {isCoreDetailsExpanded && (
                  <>
                    <div className="mb-2">
                      {isEditMode ? (
                        <textarea
                          className="w-full text-gray-600 border border-gray-300 rounded-md p-2 resize-none bg-white"
                          rows={2}
                          value={editedEvent.description}
                          onChange={e => handleInputChange('description', e.target.value)}
                          placeholder="Event Description"
                        />
                      ) : (
                        <div className="text-gray-600 mb-2">{event.description}</div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-2">
                      <div>
                        <strong>Date:</strong>{' '}
                        {isEditMode ? (
                          <input
                            type="date"
                            className="border-b border-blue-200 focus:outline-none focus:border-blue-500 bg-white px-2 py-1"
                            value={editedEvent.event_date || ''}
                            onChange={e => handleInputChange('event_date', e.target.value)}
                          />
                        ) : (
                          event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'
                        )}
                      </div>
                      <div>
                        <strong>Time:</strong>{' '}
                        {isEditMode ? (
                          <input
                            type="time"
                            className="border-b border-blue-200 focus:outline-none focus:border-blue-500 bg-white px-2 py-1"
                            value={editedEvent.start_time || ''}
                            onChange={e => handleInputChange('start_time', e.target.value)}
                          />
                        ) : (
                          event.start_time || 'N/A'
                        )}
                      </div>
                      <div>
                        <strong>Location:</strong>{' '}
                        {isEditMode ? (
                          <input
                            className="border-b border-blue-200 focus:outline-none focus:border-blue-500 bg-white px-2 py-1"
                            value={editedEvent.location || ''}
                            onChange={e => handleInputChange('location', e.target.value)}
                            placeholder="Event Location"
                          />
                        ) : (
                          event.location || 'N/A'
                        )}
                      </div>
                      <div>
                        <strong>Type:</strong>{' '}
                        {isEditMode ? (
                          <select
                            className="border-b border-blue-200 focus:outline-none focus:border-blue-500 bg-white px-2 py-1"
                            value={editedEvent.type || ''}
                            onChange={e => handleInputChange('type', e.target.value)}
                          >
                            <option value="">Select Type</option>
                            <option value="fundraiser">Fundraiser</option>
                            <option value="meeting">Meeting</option>
                            <option value="social">Social</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          event.type || 'N/A'
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {isEditMode ? (
                        <>
                          <button
                            onClick={handleSaveCoreDetails}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
                            disabled={saving}
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition"
                            disabled={saving}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEditCoreDetails}
                          className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 transition flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" /></svg>
                          Edit
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col items-end">
                <button
                  onClick={() => setIsCoreDetailsExpanded(v => !v)}
                  className="px-2 py-1 text-xs text-blue-600 hover:underline"
                >
                  {isCoreDetailsExpanded ? 'Collapse Details' : 'Expand Details'}
                </button>
              </div>
            </div>
          ) : null}
          {/* Stella Insights for mobile */}
          <div className="block lg:hidden mb-6">
            <div className={`${pastelBox} p-6 min-h-[180px]`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-600 text-xl">✨</span>
                <span className="font-bold text-lg text-purple-700">Stella's Event Insights</span>
              </div>
              <ul className="list-disc pl-5 text-purple-900 space-y-2">
                {stellaTipsFallback.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-purple-400">Tips powered by Stella AI</div>
            </div>
          </div>
        </section>
        <section className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Tasks</h2>
          <div className="bg-white rounded-xl shadow p-6">
            <EventTasksList eventId={event?.id} />
          </div>
        </section>
        <section ref={sectionRefs.budget} id="budget" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Budget</h2>
          {budgetLoading ? (
            <div className="bg-white rounded-xl shadow p-6 text-gray-500">Loading expenses...</div>
          ) : budgetError ? (
            <div className="bg-white rounded-xl shadow p-6 text-red-500">{budgetError}</div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="mb-4 flex flex-wrap gap-8 items-center">
                <div className="text-lg font-semibold text-gray-900">Total Spent: <span className="text-blue-700">${expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0).toFixed(2)}</span></div>
                <div className="text-gray-600">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 border-b text-left">Date</th>
                      <th className="px-3 py-2 border-b text-left">Category</th>
                      <th className="px-3 py-2 border-b text-left">Vendor</th>
                      <th className="px-3 py-2 border-b text-right">Amount</th>
                      <th className="px-3 py-2 border-b text-left">Status</th>
                      <th className="px-3 py-2 border-b text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-4 text-gray-400">No expenses submitted for this event.</td></tr>
                    ) : expenses.map(exp => (
                      <tr key={exp.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{exp.expense_date ? new Date(exp.expense_date).toLocaleDateString() : ''}</td>
                        <td className="px-3 py-2">{exp.category_id || '-'}</td>
                        <td className="px-3 py-2">{exp.vendor_name || '-'}</td>
                        <td className="px-3 py-2 text-right">${parseFloat(exp.amount).toFixed(2)}</td>
                        <td className="px-3 py-2 capitalize">{exp.status}</td>
                        <td className="px-3 py-2">{exp.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
        <section ref={sectionRefs.communications} id="communications" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Communications</h2>
          {commLoading ? (
            <div className="bg-white rounded-xl shadow p-6 text-gray-500">Loading communications...</div>
          ) : commError ? (
            <div className="bg-white rounded-xl shadow p-6 text-red-500">{commError}</div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="mb-4 flex flex-wrap gap-8 items-center">
                <div className="text-lg font-semibold text-gray-900">Total Campaigns: <span className="text-blue-700">{communications.length}</span></div>
                <div className="text-gray-600">
                  {communications.filter(c => c.type === 'email').length} Email, {' '}
                  {communications.filter(c => c.type === 'sms').length} SMS, {' '}
                  {communications.filter(c => c.type === 'social').length} Social
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 border-b text-left">Type</th>
                      <th className="px-3 py-2 border-b text-left">Campaign</th>
                      <th className="px-3 py-2 border-b text-left">Status</th>
                      <th className="px-3 py-2 border-b text-left">Date</th>
                      <th className="px-3 py-2 border-b text-right">Recipients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communications.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-gray-400">No communications sent for this event.</td></tr>
                    ) : communications.map(comm => (
                      <tr key={comm.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comm.type === 'email' ? 'bg-blue-100 text-blue-800' :
                            comm.type === 'sms' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {comm.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2">{comm.campaign_name || '-'}</td>
                        <td className="px-3 py-2 capitalize">{comm.status}</td>
                        <td className="px-3 py-2">
                          {comm.sent_at ? new Date(comm.sent_at).toLocaleDateString() :
                           comm.scheduled_for ? new Date(comm.scheduled_for).toLocaleDateString() :
                           new Date(comm.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {comm.recipient_count || comm.sent_count || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
        <section ref={sectionRefs.fundraising} id="fundraising" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Fundraising</h2>
          {fundraisingLoading ? (
            <div className="bg-white rounded-xl shadow p-6 text-gray-500">Loading fundraising campaigns...</div>
          ) : fundraisingError ? (
            <div className="bg-white rounded-xl shadow p-6 text-red-500">{fundraisingError}</div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="mb-4 flex flex-wrap gap-8 items-center">
                <div className="text-lg font-semibold text-gray-900">Total Raised: <span className="text-green-700">${fundraising.reduce((sum, f) => sum + (parseFloat(f.raised_amount) || 0), 0).toFixed(2)}</span></div>
                <div className="text-gray-600">{fundraising.length} campaign{fundraising.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 border-b text-left">Campaign</th>
                      <th className="px-3 py-2 border-b text-left">Type</th>
                      <th className="px-3 py-2 border-b text-right">Goal</th>
                      <th className="px-3 py-2 border-b text-right">Raised</th>
                      <th className="px-3 py-2 border-b text-center">Progress</th>
                      <th className="px-3 py-2 border-b text-left">Status</th>
                      <th className="px-3 py-2 border-b text-left">Dates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundraising.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-4 text-gray-400">No fundraising campaigns for this event.</td></tr>
                    ) : fundraising.map(campaign => {
                      const progress = campaign.goal_amount > 0 ? (campaign.raised_amount / campaign.goal_amount) * 100 : 0;
                      return (
                        <tr key={campaign.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">{campaign.name}</td>
                          <td className="px-3 py-2 capitalize">{campaign.campaign_type || '-'}</td>
                          <td className="px-3 py-2 text-right">${parseFloat(campaign.goal_amount).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">${parseFloat(campaign.raised_amount).toFixed(2)}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              campaign.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : ''} - {' '}
                            {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
        <section ref={sectionRefs.volunteers} id="volunteers" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Volunteers</h2>
          <div className="bg-white rounded-xl shadow p-6 text-gray-500">Volunteer assignments and signups coming soon.</div>
        </section>
        <section ref={sectionRefs['project-management']} id="project-management" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Event Management</h2>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="mb-4">
              <button
                onClick={() => navigate(`/events/${id}/event-management`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Open Event Management
              </button>
            </div>
          </div>
        </section>
        <section ref={sectionRefs.files} id="files" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Files & Documents</h2>
          <div className="bg-white rounded-xl shadow p-6 text-gray-500">Linked files, images, and forms coming soon.</div>
        </section>
      </div>
      {/* Sidebar: Stella Insights (desktop only) */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className={`${pastelBox} p-6 min-h-[220px] sticky top-24`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-600 text-xl">✨</span>
            <span className="font-bold text-lg text-purple-700">Stella's Event Insights</span>
          </div>
          <ul className="list-disc pl-5 text-purple-900 space-y-2">
            {stellaTipsFallback.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-purple-400">Tips powered by Stella AI</div>
        </div>
      </aside>
      {/* Floating Up Arrow */}
      {showUpArrow && (
        <button
          onClick={handleScrollTop}
          className="fixed bottom-8 right-8 z-50 bg-purple-500 text-white rounded-full shadow-lg p-3 hover:bg-purple-600 transition"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default EventDetailPage; 