import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const REPORT_OPTIONS = [
  { value: 'monetary', label: 'Monetary Donations' },
  { value: 'volunteer', label: 'Volunteer Hours' },
  { value: 'supplies', label: 'Supply Donations' },
  { value: 'top_donors', label: 'Top Donors' },
  { value: 'recurring', label: 'Recurring Donors' },
  { value: 'retention', label: 'Donor Retention' },
  { value: 'campaign', label: 'Campaign Performance' },
  { value: 'year_over_year', label: 'Year-over-Year Comparison' },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('monetary');
  const [dateRange, setDateRange] = useState('6m');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState(null);

  // Placeholder: Simulate report generation
  const generateReport = () => {
    setLoading(true);
    setTimeout(() => {
      setReportData([
        { name: 'John Smith', value: 1500, date: '2024-01-15' },
        { name: 'Sarah Johnson', value: 2500, date: '2024-03-01' },
        { name: 'Mike Brown', value: 500, date: '2024-02-01' },
      ]);
      setLoading(false);
      setError(null);
    }, 1000);
  };

  // Placeholder: Export as PDF
  const exportPDF = () => {
    alert('PDF export coming soon!');
  };

  // Placeholder: Export as XLSX
  const exportXLSX = () => {
    alert('XLSX export coming soon!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
          <select
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-4 py-3 mb-2"
            value={selectedReport}
            onChange={e => setSelectedReport(e.target.value)}
          >
            {REPORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-4 py-3 mb-2"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <Button onClick={generateReport} disabled={loading} className="h-12 md:h-12 md:mt-0 mt-0 flex items-center">Generate Report</Button>
      </div>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{REPORT_OPTIONS.find(opt => opt.value === selectedReport)?.label} Report</h3>
          <div className="space-x-2">
            <Button variant="outline" onClick={exportPDF}>Export as PDF</Button>
            <Button variant="outline" onClick={exportXLSX}>Export as XLSX</Button>
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12">Generating report...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.map((row, idx) => (
                    <tr key={idx} className="bg-white even:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">{row.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{row.value}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="text-center py-4 text-gray-500">No data to display.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 