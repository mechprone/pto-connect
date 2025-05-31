import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function EventsDashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('User not found.');
        console.error('User error:', userError);
        return;
      }

      // 🔄 Lookup org_id from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.org_id) {
        setError('Unable to load profile or org ID.');
        console.error('Profile error:', profileError);
        return;
      }

      const { data, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('event_date', { ascending: true });

      if (eventError) {
        setError('Failed to load events.');
        console.error('Event query error:', eventError);
      } else {
        setEvents(data);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">PTO-Wide Events</h1>
        <Link to="/events/create" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Create Event
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {events.length === 0 && !error && <p>No events created yet.</p>}

      <ul className="space-y-4">
        {events.map((event) => (
          <li key={event.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-sm text-gray-500">
              {new Date(event.event_date).toLocaleDateString()} • {event.school_level} • {event.category}
            </p>
            <p className="mt-2">{event.description}</p>
            {event.share_public && (
              <span className="text-xs inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded">
                Shared to Library
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
