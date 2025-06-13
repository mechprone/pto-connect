import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
    { id: 1, name: 'Period Selection', description: 'Select reconciliation period' },
    { id: 2, name: 'Upload Statement', description: 'Upload bank statement' },
    { id: 3, name: 'Match Transactions', description: 'Review and match transactions' },
    { id: 4, name: 'Finalize Report', description: 'Complete reconciliation' },
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
    console.log('🔍 [FRONTEND DEBUG] nextStep called, currentStep:', currentStep);
    
    if (currentStep === 1) {
      console.log('🔍 [FRONTEND DEBUG] Starting reconciliation process');
      console.log('🔍 [FRONTEND DEBUG] Reconciliation data:', {
        month: reconciliationData.month,
        year: reconciliationData.year
      });
      
      setLoading(true);
      try {
        console.log('🔍 [FRONTEND DEBUG] Calling reconciliationAPI.startReconciliation');
        const response = await reconciliationAPI.startReconciliation({
          month: reconciliationData.month,
          year: reconciliationData.year
        });
        
        console.log('🔍 [FRONTEND DEBUG] startReconciliation response:', response);
        
        if (response.success) {
          console.log('✅ [FRONTEND DEBUG] Reconciliation started successfully, ID:', response.data.id);
          setReconciliationData(prev => ({ ...prev, id: response.data.id }));
          setCurrentStep(currentStep + 1);
        } else {
          console.error('❌ [FRONTEND DEBUG] Failed to start reconciliation:', response.error);
          alert('Failed to start reconciliation: ' + response.error);
        }
      } catch (error) {
        console.error('❌ [FRONTEND DEBUG] Exception in nextStep:', error);
        alert('Failed to start reconciliation. Please try again.');
      } finally {
        console.log('🔍 [FRONTEND DEBUG] Setting loading to false');
        setLoading(false);
      }
    } else if (currentStep < steps.length) {
      console.log('🔍 [FRONTEND DEBUG] Moving to next step:', currentStep + 1);
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
    <div className="max-w-4xl mx-auto">
      {/* Header with Close Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Reconciliation</h1>
        <button
          onClick={onCancel}
          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:border-gray-400"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            disabled={loading || (currentStep === 2 && !reconciliationData.bankStatement)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Next'}
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={() => onComplete(reconciliationData)}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Complete Reconciliation
          </button>
        )}
      </div>
    </div>
  );
};

export default ReconciliationWizard;
