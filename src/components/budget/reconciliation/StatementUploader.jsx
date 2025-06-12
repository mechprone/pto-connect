import React, { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const StatementUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    // Simulate OCR processing and upload
    setTimeout(() => {
      onUpload(file);
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        Upload your bank statement
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        PDF, PNG, or JPG files are supported.
      </p>
      <div className="mt-6">
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.jpeg"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Select a file
        </label>
        {file && <p className="mt-2 text-sm text-gray-600">{file.name}</p>}
      </div>
      <div className="mt-6">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Processing...' : 'Upload and Process'}
        </button>
      </div>
    </div>
  );
};

export default StatementUploader;
