import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/utils/supabaseClient';

export default function EditEventPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    school_level: 'elementary',
    category: '',
    visibility: 'public',
    estimated_budget: '',
    share_public: false
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) {
        setError('Failed to load event.');
        console.error(error);
      } else if (data) {
        setForm({
          title: data.title || '',
          description: data.description || '',
          event_date: data.event_date || '',
          start_time: data.start_time || '',
          end_time: data.end_time || '',
          location: data.location || '',
          school_level: data.school_level || 'elementary',
          category: data.category || '',
          visibility: data.visibility || 'public',
          estimated_budget: data.estimated_budget || '',
          share_public: !!data.share_public
        });
      }
    }
    loadEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.from('events').update({
      title: form.title,
      description: form.description,
      event_date: form.event_date,
      start_time: form.start_time,
      end_time: form.end_time,
      location: form.location,
      school_level: form.school_level,
      category: form.category,
      visibility: form.visibility,
      estimated_budget: form.estimated_budget,
      share_public: form.share_public
    }).eq('id', id);
    if (error) {
      setError('Update failed.');
      console.error(error);
    } else {
      navigate('/events');
    }
  };

  if (!form.title && !form.event_date) return <p className="p-4">Loading event...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Edit Event</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" className="w-full border p-2" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2" />
        <input type="date" name="event_date" value={form.event_date} onChange={handleChange} className="w-full border p-2" required />
        <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className="w-full border p-2" />
        <input type="time" name="end_time" value={form.end_time} onChange={handleChange} className="w-full border p-2" />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full border p-2" />
        <select name="school_level" value={form.school_level} onChange={handleChange} className="w-full border p-2">
          <option value="elementary">Elementary</option>
          <option value="upper_elementary">Upper Elementary</option>
          <option value="middle">Middle</option>
          <option value="junior_high">Junior High</option>
          <option value="high">High School</option>
        </select>
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full border p-2" />
        <select name="visibility" value={form.visibility} onChange={handleChange} className="w-full border p-2">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <input name="estimated_budget" value={form.estimated_budget} onChange={handleChange} placeholder="Estimated Budget" className="w-full border p-2" />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="share_public" checked={form.share_public} onChange={handleChange} />
          <span>Share Publicly</span>
        </label>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save Changes</button>
      </form>
    </div>
  );
}