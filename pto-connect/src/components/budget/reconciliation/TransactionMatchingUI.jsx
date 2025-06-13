import React, { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon, CheckCircleIcon, XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { reconciliationAPI } from '../../../services/api/reconciliation';
import { matchingAlgorithm } from '../../../utils/matchingAlgorithm';

const TransactionMatchingUI = ({ reconciliationId, bankTransactions = [], systemExpenses = [] }) => {
  const [matches, setMatches] = useState([]);
  const [selectedBankTx, setSelectedBankTx] = useState(null);
  const [selectedSystemExp, setSelectedSystemExp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoMatchingEnabled, setAutoMatchingEnabled] = useState(true);
  const [matchingStats, setMatchingStats] = useState({
    total: 0,
    matched: 0,
    autoMatched: 0,
    unmatched: 0
  });

  useEffect(() => {
    if (bankTransactions.length > 0 && systemExpenses.length > 0) {
      performMatching();
    }
  }, [bankTransactions, systemExpenses]);

  const performMatching = () => {
    setLoading(true);
    
    try {
      // Use our smart matching algorithm
      const matchResults = matchingAlgorithm.findMatches(bankTransactions, systemExpenses);
      setMatches(matchResults);
      
      // Calculate statistics
      const stats = {
        total: bankTransactions.length,
        matched: matchResults.filter(m => m.bestMatch).length,
        autoMatched: matchResults.filter(m => m.autoMatch).length,
        unmatched: matchResults.filter(m => !m.bestMatch).length
      };
      setMatchingStats(stats);

      // Auto-match high confidence matches if enabled
      if (autoMatchingEnabled) {
        const autoMatches = matchingAlgorithm.performAutoMatching(matchResults);
        console.log(`Auto-matched ${autoMatches.length} transactions`);
      }
    } catch (error) {
      console.error('Matching failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualMatch = async (bankTx, expense) => {
    try {
      const response = await reconciliationAPI.matchTransaction(reconciliationId, {
        bankTransactionId: bankTx.id,
        expenseId: expense.id
      });

      if (response.success) {
        // Update matches to reflect the manual match
        const updatedMatches = matches.map(match => {
          if (match.bankTransaction.id === bankTx.id) {
            return {
              ...match,
              isMatched: true,
              matchedExpense: expense
            };
          }
          return match;
        });
        setMatches(updatedMatches);
        
        // Clear selections
        setSelectedBankTx(null);
        setSelectedSystemExp(null);
      }
    } catch (error) {
      console.error('Failed to match transaction:', error);
      alert('Failed to match transaction. Please try again.');
    }
  };

  const handleSuggestedMatch = async (match) => {
    if (match.bestMatch) {
      await handleManualMatch(match.bankTransaction, match.bestMatch.expense);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Analyzing transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Smart Transaction Matching</h3>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoMatchingEnabled}
              onChange={(e) => setAutoMatchingEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-match high confidence</span>
          </label>
          <button
            onClick={performMatching}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Re-analyze
          </button>
        </div>
      </div>

      {/* Matching Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{matchingStats.total}</div>
          <div className="text-sm text-blue-800">Total Transactions</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{matchingStats.matched}</div>
          <div className="text-sm text-green-800">Potential Matches</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{matchingStats.autoMatched}</div>
          <div className="text-sm text-purple-800">Auto-Matched</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{matchingStats.unmatched}</div>
          <div className="text-sm text-red-800">Unmatched</div>
        </div>
      </div>

      {/* Matching Results */}
      <div className="space-y-4">
        {matches.map((match, index) => (
          <div key={match.bankTransaction.id} className="border border-gray-200 rounded-lg p-4">
            {/* Bank Transaction */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="font-medium text-gray-900">
                    {match.bankTransaction.description}
                  </div>
                  <div className="font-bold text-lg">
                    ${match.bankTransaction.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {match.bankTransaction.date}
                  </div>
                </div>
              </div>
              
              {match.isMatched && (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Matched</span>
                </div>
              )}
            </div>

            {/* Suggested Matches */}
            {match.suggestions.length > 0 && !match.isMatched && (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <LightBulbIcon className="h-4 w-4 mr-1" />
                  <span>Suggested matches:</span>
                </div>
                
                {match.suggestions.slice(0, 3).map((suggestion, suggestionIndex) => (
                  <div
                    key={suggestion.expense.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestedMatch({ ...match, bestMatch: suggestion })}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium">
                          {suggestion.expense.vendor || suggestion.expense.description}
                        </div>
                        <div className="font-bold">
                          ${suggestion.expense.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {suggestion.expense.date}
                        </div>
                      </div>
                      
                      {/* Match Reasons */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {suggestion.matchReasons.map((reason, reasonIndex) => (
                          <span
                            key={reasonIndex}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getConfidenceColor(suggestion.confidence)}`}>
                        {getConfidenceText(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
                      </span>
                      <button className="p-1 text-green-600 hover:text-green-800">
                        <ArrowsRightLeftIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {match.suggestions.length > 3 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{match.suggestions.length - 3} more potential matches
                  </div>
                )}
              </div>
            )}

            {/* No Matches Found */}
            {match.suggestions.length === 0 && !match.isMatched && (
              <div className="flex items-center justify-center p-4 bg-red-50 rounded border border-red-200">
                <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">No potential matches found</span>
                <button className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                  Create New Expense
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Manual Matching Section */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Manual Matching</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unmatched Bank Transactions */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">Unmatched Bank Transactions</h5>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {matches
                .filter(m => !m.isMatched)
                .map(match => (
                  <div
                    key={match.bankTransaction.id}
                    onClick={() => setSelectedBankTx(match.bankTransaction)}
                    className={`p-3 rounded border cursor-pointer ${
                      selectedBankTx?.id === match.bankTransaction.id 
                        ? 'bg-blue-100 border-blue-400' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{match.bankTransaction.description}</span>
                      <span className="font-bold">${match.bankTransaction.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">{match.bankTransaction.date}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Unmatched System Expenses */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">Unmatched System Expenses</h5>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {systemExpenses
                .filter(exp => !exp.is_matched)
                .map(expense => (
                  <div
                    key={expense.id}
                    onClick={() => setSelectedSystemExp(expense)}
                    className={`p-3 rounded border cursor-pointer ${
                      selectedSystemExp?.id === expense.id 
                        ? 'bg-green-100 border-green-400' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{expense.vendor || expense.description}</span>
                      <span className="font-bold">${expense.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">{expense.date}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Manual Match Button */}
        {selectedBankTx && selectedSystemExp && (
          <div className="mt-4 text-center">
            <button
              onClick={() => handleManualMatch(selectedBankTx, selectedSystemExp)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
              Match Selected Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionMatchingUI;
