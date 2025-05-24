import React, { useState } from 'react';

const mockFundraisers = [
  {
    id: 1,
    title: 'Read-a-thon',
    goal: 1000,
    raised: 750,
    deadline: '2025-09-30',
  },
  {
    id: 2,
    title: 'Holiday Raffle',
    goal: 500,
    raised: 300,
    deadline: '2025-12-10',
  },
];

export default function AdminFundraisingPanel() {
  const [fundraisers, setFundraisers] = useState(mockFundraisers);
  const [newFundraiser, setNewFundraiser] = useState({
    title: '',
    goal: '',
    deadline: '',
  });

  const handleChange = (e) => {
    setNewFundraiser({ ...newFundraiser, [e.target.name]: e.target.value });
  };

  const addFundraiser = () => {
    if (!newFundraiser.title || !newFundraiser.goal || !newFundraiser.deadline) return;
    setFundraisers((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...newFundraiser,
        raised: 0,
        goal: parseInt(newFundraiser.goal, 10),
      },
    ]);
    setNewFundraiser({ title: '', goal: '', deadline: '' });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="title" value={newFundraiser.title} onChange={handleChange} placeholder="Title" className="border px-3 py-2 rounded" />
        <input name="goal" type="number" value={newFundraiser.goal} onChange={handleChange} placeholder="Goal Amount" className="border px-3 py-2 rounded" />
        <input name="deadline" type="date" value={newFundraiser.deadline} onChange={handleChange} className="border px-3 py-2 rounded" />
      </div>
      <button onClick={addFundraiser} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Fundraiser</button>

      <table className="min-w-full bg-white shadow rounded mt-6">
        <thead className="bg-gray-100 text-left">
          <tr><th className="py-2 px-4">Title</th><th className="py-2 px-4">Raised</th><th className="py-2 px-4">Goal</th><th className="py-2 px-4">Deadline</th></tr>
        </thead>
        <tbody>
          {fundraisers.map(f => (
            <tr key={f.id} className="border-t">
              <td className="py-2 px-4">{f.title}</td>
              <td className="py-2 px-4">${f.raised}</td>
              <td className="py-2 px-4">${f.goal}</td>
              <td className="py-2 px-4">{f.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}