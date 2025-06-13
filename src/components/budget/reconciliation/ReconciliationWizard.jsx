import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { reconciliationAPI } from '../../../services/api/reconciliation';
import StatementUploader from './StatementUploader';
import TransactionMatchingUI from './TransactionMatchingUI';
import ReconciliationReport from './ReconciliationReport';

const ReconciliationWizard = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [reconciliationData, setReconciliationData] = useState({
    id: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bankStatement: null,
    bankTransactions: [],
    systemExpenses: [],
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, name: 'Setup', description: 'Select period' },
    { id: 2, name: 'Upload Statement', description: 'Provide bank statement' },
    { id: 3, name: 'Review & Match', description: 'Match transactions' },
    { id: 4, name: 'Finalize', description: 'Review and complete' },
  ];

  const handleDataChange = (field, value) => {
    setReconciliationData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatementUpload = async (uploadData) => {
    setLoading(true);
    try {
      // Upload the OCR-processed transactions to the backend
      const response = await reconciliationAPI.uploadStatement(reconciliationData.id, {
        transactions: uploadData.transactions
      });

      if (response.success) {
        // Fetch the complete transaction data for matching
        const transactionData = await reconciliationAPI.getTransactions(reconciliationData.id);
        
        if (transactionData.success) {
          setReconciliationData(prev => ({
            ...prev,
            bankStatement: uploadData.file,
            bankTransactions: transactionData.data.bankTransactions,
            systemExpenses: transactionData.data.systemExpenses
          }));
          setCurrentStep(currentStep + 1);
        }
      } else {
        alert('Failed to upload transactions: ' + response.error);
      }
    } catch (error) {
      console.error('Failed to upload statement:', error);
      alert('Failed to upload statement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      setLoading(true);
      try {
        const response = await reconciliationAPI.startReconciliation({
          month: reconciliationData.month,
          year: reconciliationData.year
        });
        if (response.success) {
          setReconciliationData(prev => ({ ...prev, id: response.data.id }));
          setCurrentStep(currentStep + 1);
        } else {
          console.error('Failed to start reconciliation:', response.error);
          alert('Failed to start reconciliation: ' + response.error);
        }
      } catch (error) {
        console.error('Failed to start reconciliation:', error);
        alert('Failed to start reconciliation. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Reconciliation Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={reconciliationData.month}
                  onChange={(e) => handleDataChange('month', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={reconciliationData.year}
                  onChange={(e) => handleDataChange('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return <StatementUploader onUpload={handleStatementUpload} />;
      case 3:
        return (
          <TransactionMatchingUI 
            reconciliationId={reconciliationData.id}
            bankTransactions={reconciliationData.bankTransactions}
            systemExpenses={reconciliationData.systemExpenses}
          />
        );
      case 4:
        return <ReconciliationReport reconciliation={reconciliationData} />;
      default:
        return <div>Step {currentStep}</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        {/* Progress Steps */}
        <div className="mb-8">
          {/* Progress bar will go here */}
        </div>

        {/* Step Content */}
        <div className="p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between px-6 pb-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md"
          >
            Previous
          </button>
          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              disabled={loading || (currentStep === 2 && !reconciliationData.bankStatement)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600"
            >
              {loading ? 'Starting...' : 'Next'}
            </button>
          ) : (
            <button
              onClick={() => onComplete(reconciliationData)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600"
            >
              Finish
            </button>
          )}
        </div>
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          Close
        </button>
      </div>
    </div>
  );
};

export default ReconciliationWizard;
