import React, { useState, useEffect } from 'react';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { reconciliationAPI } from '../../../services/api/reconciliation';
import { useUserProfile } from '../../../modules/hooks/useUserProfile';
import ReconciliationWizard from './ReconciliationWizard';

const ReconciliationDashboard = () => {
  const { userProfile } = useUserProfile();
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadReconciliations(); 
  }, []);

  const loadReconciliations = async () => {
    setLoading(true);
    try {
      const response = await reconciliationAPI.getReconciliations();
      if (response.success) {
        setReconciliations(response.data);
      }
    } catch (error) {
      console.error('Failed to load reconciliations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReconciliation = (data) => {
    // This will launch the wizard
    console.log('Starting new reconciliation...');
    setShowCreateModal(false);
    loadReconciliations(); // Refresh the list after creating a new one
  };

  return (
    <div className="space-y-6">
      {showCreateModal && (
        <ReconciliationWizard
          onComplete={handleCreateReconciliation}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Reconciliations</h2>
          <p className="text-sm text-gray-600">Keep your budget accurate by reconciling with your bank statements.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Reconciliation
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">History</h3>
        </div>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : reconciliations.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No reconciliations started yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Start Your First Reconciliation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reconciliations.map((rec) => (
                  <tr key={rec.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(rec.year, rec.month - 1).toLocaleString('default', { month: 'long' })} {rec.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        {rec.status === 'in_progress' ? 'Continue' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReconciliationDashboard;
