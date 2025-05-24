import React, { useState } from 'react';

const mockEvents = [
  {
    id: 1,
    title: 'Fall Festival',
    date: '2025-10-15',
    category: 'Fundraiser',
    volunteers: 12,
  },
  {
    id: 2,
    title: 'Book Fair',
    date: '2025-11-01',
    category: 'Literacy',
    volunteers: 8,
  },
];

export default function AdminEventsPanel() {
  const [events, setEvents] = useState(mockEvents);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    category: '',
  });

  const handleChange = (e) => {
    setNewEvent((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.category) return;
    setEvents((prev) => [
      ...prev,
      {
        ...newEvent,
        id: prev.length + 1,
        volunteers: 0,
      },
    ]);
    setNewEvent({ title: '', date: '', category: '' });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="title"
          placeholder="Event Title"
          className="border px-3 py-2 rounded"
          value={newEvent.title}
          onChange={handleChange}
        />
        <input
          type="date"
          name="date"
          className="border px-3 py-2 rounded"
          value={newEvent.date}
          onChange={handleChange}
        />
        <input
          name="category"
          placeholder="Category"
          className="border px-3 py-2 rounded"
          value={newEvent.category}
          onChange={handleChange}
        />
      </div>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={addEvent}
      >
        Add Event
      </button>

      <table className="min-w-full bg-white shadow rounded mt-6">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="py-2 px-4">Title</th>
            <th className="py-2 px-4">Date</th>
            <th className="py-2 px-4">Category</th>
            <th className="py-2 px-4">Volunteers</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-t">
              <td className="py-2 px-4">{event.title}</td>
              <td className="py-2 px-4">{event.date}</td>
              <td className="py-2 px-4">{event.category}</td>
              <td className="py-2 px-4">{event.volunteers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
