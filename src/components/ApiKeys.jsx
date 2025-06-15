export default function ApiKeys() {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">API Keys</h2>
      <table className="w-full table-auto border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Key Name</th>
            <th className="p-2 border">Permissions</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border">[Key 1]</td>
            <td className="p-2 border">[Read, Write]</td>
            <td className="p-2 border">Active</td>
            <td className="p-2 border"><button className="px-2 py-1 bg-blue-600 text-white rounded opacity-50 cursor-not-allowed" disabled>Edit</button></td>
          </tr>
          <tr>
            <td className="p-2 border">[Key 2]</td>
            <td className="p-2 border">[Read]</td>
            <td className="p-2 border">Inactive</td>
            <td className="p-2 border"><button className="px-2 py-1 bg-blue-600 text-white rounded opacity-50 cursor-not-allowed" disabled>Edit</button></td>
          </tr>
        </tbody>
      </table>
      <button className="px-4 py-2 rounded bg-blue-600 text-white font-semibold opacity-50 cursor-not-allowed" disabled>Create New API Key</button>
      <div className="mt-6 text-gray-400 italic">[API key management coming soon]</div>
    </div>
  )
} 