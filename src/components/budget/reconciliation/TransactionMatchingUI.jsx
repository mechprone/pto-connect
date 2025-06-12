import React, { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { reconciliationAPI } from '../../../services/api/reconciliation';

const TransactionMatchingUI = ({ reconciliationId }) => {
  const [bankTransactions, setBankTransactions] = useState([]);
  const [systemExpenses, setSystemExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBankTx, setSelectedBankTx] = useState(null);
  const [selectedSystemExp, setSelectedSystemExp] = useState(null);
  const [suggestedMatch, setSuggestedMatch] = useState(null);

  useEffect(() => {
    if (selectedBankTx) {
      const potentialMatch = systemExpenses.find(exp => 
        exp.amount === selectedBankTx.amount && 
        !exp.is_matched
      );
      setSuggestedMatch(potentialMatch);
    } else {
      setSuggestedMatch(null);
    }
  }, [selectedBankTx, systemExpenses]);

  const handleMatch = async () => {
    if (!selectedBankTx || !selectedSystemExp) {
      alert('Please select one bank transaction and one system expense to match.');
      return;
    }

    try {
      const response = await reconciliationAPI.matchTransaction(
        reconciliationId,
        selectedBankTx.id,
        selectedSystemExp.id
      );

      if (response.success) {
        // Remove matched items from the lists
        setBankTransactions(bankTransactions.filter(tx => tx.id !== selectedBankTx.id));
        setSystemExpenses(systemExpenses.filter(exp => exp.id !== selectedSystemExp.id));
        setSelectedBankTx(null);
        setSelectedSystemExp(null);
      }
    } catch (error) {
      console.error('Failed to match transaction:', error);
      alert('Failed to match transaction. Please try again.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!reconciliationId) return;
      setLoading(true);
      try {
        const response = await reconciliationAPI.getReconciliationData(reconciliationId);
        if (response.success) {
          setBankTransactions(response.data.bankTransactions || []);
          setSystemExpenses(response.data.systemExpenses || []);
        }
      } catch (error) {
        console.error("Failed to fetch reconciliation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reconciliationId]);

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Match Transactions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bank Transactions */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Bank Statement Transactions</h4>
          <div className="space-y-3">
            {bankTransactions.map(tx => (
              <div
                key={tx.id}
                onClick={() => setSelectedBankTx(tx)}
                className={`p-3 rounded-lg border cursor-pointer ${selectedBankTx?.id === tx.id ? 'bg-blue-100 border-blue-400' : 'bg-gray-50'}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{tx.description}</span>
                  <span className="font-bold">${tx.amount.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500">{tx.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Expenses */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">System Expenses</h4>
          <div className="space-y-3">
            {systemExpenses.map(exp => (
              <div
                key={exp.id}
                onClick={() => setSelectedSystemExp(exp)}
                className={`p-3 rounded-lg border shadow-sm cursor-pointer ${
                  selectedSystemExp?.id === exp.id 
                    ? 'bg-green-100 border-green-400' 
                    : suggestedMatch?.id === exp.id 
                    ? 'bg-yellow-100 border-yellow-400'
                    : 'bg-white'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{exp.vendor}</span>
                  <span className="font-bold">${exp.amount.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500">{exp.date}</div>
                <div className="mt-2 text-right">
                  <button className="text-sm text-blue-600 hover:underline">
                    Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={handleMatch}
          disabled={!selectedBankTx || !selectedSystemExp}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
          Match Selected Transactions
        </button>
      </div>
    </div>
  );
};

export default TransactionMatchingUI;
