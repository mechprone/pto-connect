import React, { useState } from 'react';
import { ArrowUpTrayIcon, EyeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ocrService } from '../../../utils/ocrService';

const StatementUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a valid image (JPG, PNG) or PDF file.');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setFile(selectedFile);
    setOcrResult(null);
    setOcrProgress(0);
  };

  const processWithOCR = async () => {
    if (!file) return;

    setUploading(true);
    setOcrProgress(0);

    try {
      // For PDF files, we'd need to convert to image first
      // For now, we'll handle images directly
      if (file.type === 'application/pdf') {
        alert('PDF processing will be implemented in the next update. Please use an image file for now.');
        setUploading(false);
        return;
      }

      const result = await ocrService.processBankStatement(file, (progress) => {
        setOcrProgress(progress);
      });

      if (result.success) {
        // Validate and clean up transactions
        const validTransactions = ocrService.validateTransactions(result.transactions);
        const transactionsWithSuggestions = ocrService.suggestCorrections(validTransactions);

        setOcrResult({
          ...result,
          transactions: transactionsWithSuggestions
        });
      } else {
        alert(`OCR processing failed: ${result.error}`);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      alert('Failed to process the bank statement. Please try again.');
    } finally {
      setUploading(false);
      setOcrProgress(0);
    }
  };

  const handleConfirmTransactions = () => {
    if (ocrResult && ocrResult.transactions.length > 0) {
      onUpload({
        file: file,
        ocrResult: ocrResult,
        transactions: ocrResult.transactions
      });
    }
  };

  const editTransaction = (index, field, value) => {
    const updatedTransactions = [...ocrResult.transactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };
    
    setOcrResult({
      ...ocrResult,
      transactions: updatedTransactions
    });
  };

  const removeTransaction = (index) => {
    const updatedTransactions = ocrResult.transactions.filter((_, i) => i !== index);
    setOcrResult({
      ...ocrResult,
      transactions: updatedTransactions
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Upload Bank Statement</h3>
      
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h4 className="mt-2 text-sm font-medium text-gray-900">
          {uploading ? 'Processing...' : 'Upload your bank statement'}
        </h4>
        <p className="mt-1 text-sm text-gray-500">
          Drag and drop or click to select. Supports JPG, PNG, and PDF files up to 10MB.
        </p>
        
        <div className="mt-6">
          <input
            type="file"
            id="file-upload"
            className="sr-only"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Select a file
          </label>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Selected:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        {/* OCR Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Processing: {ocrProgress}%
            </p>
          </div>
        )}
      </div>

      {/* Process Button */}
      {file && !ocrResult && !uploading && (
        <div className="text-center">
          <button
            onClick={processWithOCR}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Extract Transactions with OCR
          </button>
        </div>
      )}

      {/* OCR Results */}
      {ocrResult && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <h4 className="text-sm font-medium text-green-800">
                OCR Processing Complete
              </h4>
            </div>
            <p className="mt-1 text-sm text-green-700">
              Extracted {ocrResult.transactions.length} transactions with {Math.round(ocrResult.confidence)}% confidence.
            </p>
          </div>

          {/* Transaction Review */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h4 className="text-lg font-medium text-gray-900">Review Extracted Transactions</h4>
              <p className="text-sm text-gray-500">
                Please review and edit the transactions below before proceeding.
              </p>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {ocrResult.transactions.map((transaction, index) => (
                <div key={transaction.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={transaction.date}
                        onChange={(e) => editTransaction(index, 'date', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={transaction.description}
                        onChange={(e) => editTransaction(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={transaction.amount}
                          onChange={(e) => editTransaction(index, 'amount', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeTransaction(index)}
                        className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                        title="Remove transaction"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {transaction.suggestions && transaction.suggestions.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mr-1 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-yellow-800">Suggestions:</p>
                          <ul className="text-xs text-yellow-700 list-disc list-inside">
                            {transaction.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confidence indicator */}
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>Confidence: {Math.round(transaction.confidence * 100)}%</span>
                    <div className="ml-2 flex-1 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full"
                        style={{ width: `${transaction.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm Button */}
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={handleConfirmTransactions}
                disabled={ocrResult.transactions.length === 0}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Confirm {ocrResult.transactions.length} Transactions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementUploader;
