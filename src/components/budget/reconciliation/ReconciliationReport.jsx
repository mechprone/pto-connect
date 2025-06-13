import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const ReconciliationReport = ({ reconciliation }) => {
  // Placeholder data
  const reportData = {
    period: 'October 2024',
    matchedTransactions: 15,
    unmatchedBank: 2,
    unmatchedSystem: 1,
    bankTotal: 5432.10,
    systemTotal: 5356.88,
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Reconciliation Report</h3>
          <p className="text-sm text-gray-500">For {reportData.period}</p>
        </div>
        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <PrinterIcon className="h-4 w-4 mr-2" />
          Print
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Summary cards */}
      </div>

      <div>
        <h4 className="font-medium text-gray-800 mb-3">Unmatched Items</h4>
        {/* Tables for unmatched items will go here */}
      </div>
    </div>
  );
};

export default ReconciliationReport;
