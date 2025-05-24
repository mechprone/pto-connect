import React, { useState } from 'react';

const mockBudgetItems = [
  { id: 1, type: 'Income', category: 'Fundraiser', amount: 500 },
  { id: 2, type: 'Expense', category: 'Supplies', amount: 150 },
];

export default function AdminBudgetPanel() {
  const [items, setItems] = useState(mockBudgetItems);
  const [newItem, setNewItem] = useState({ type: 'Income', category: '', amount: '' });

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    if (!newItem.category || !newItem.amount) return;
    setItems(prev => [
      ...prev,
      { id: prev.length + 1, ...newItem, amount: parseFloat(newItem.amount) }
    ]);
    setNewItem({ type: 'Income', category: '', amount: '' });
  };

  const incomeTotal = items.filter(i => i.type === 'Income').reduce((sum, i) => sum + i.amount, 0);
  const expenseTotal = items.filter(i => i.type === 'Expense').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select name="type" value={newItem.type} onChange={handleChange} className="border px-3 py-2 rounded">
          <option>Income</option>
          <option>Expense</option>
        </select>
        <input name="category" value={newItem.category} onChange={handleChange} placeholder="Category" className="border px-3 py-2 rounded" />
        <input name="amount" type="number" value={newItem.amount} onChange={handleChange} placeholder="Amount" className="border px-3 py-2 rounded" />
      </div>
      <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Entry</button>

      <div className="text-lg font-semibold mt-6">
        Income: ${incomeTotal} | Expenses: ${expenseTotal} | Balance: ${incomeTotal - expenseTotal}
      </div>

      <table className="min-w-full bg-white shadow rounded mt-4">
        <thead className="bg-gray-100 text-left">
          <tr><th className="py-2 px-4">Type</th><th className="py-2 px-4">Category</th><th className="py-2 px-4">Amount</th></tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id} className="border-t">
              <td className="py-2 px-4">{i.type}</td>
              <td className="py-2 px-4">{i.category}</td>
              <td className="py-2 px-4">${i.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}