import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

// Tab config
const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'budget', label: 'Budget' },
  { key: 'communications', label: 'Communications' },
  { key: 'fundraising', label: 'Fundraising' },
  { key: 'volunteers', label: 'Volunteers' },
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

  // Section refs for scrolling
  const sectionRefs = {
    overview: useRef(null),
    budget: useRef(null),
    communications: useRef(null),
    fundraising: useRef(null),
    volunteers: useRef(null),
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
              <div>
                <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">{event.status}</span>
                </div>
                <div className="text-gray-600 mb-2">{event.description}</div>
                <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-2">
                  <div><strong>Date:</strong> {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Location:</strong> {event.location || 'N/A'}</div>
                  <div><strong>Progress:</strong> {event.progress ? `${event.progress}%` : 'N/A'}</div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = `/events/edit/${event.id}`}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              >
                Edit Event
              </button>
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