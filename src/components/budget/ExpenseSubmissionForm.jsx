import React, { useState, useEffect, useRef } from 'react';
import { 
  CameraIcon, 
  PhotoIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { expenseService } from '../services/expenseService';
import { cameraService } from '../services/cameraService';

const ExpenseSubmissionForm = ({ user, isOnline, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    vendor: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    category_id: '',
    event_id: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadInitialData();
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [categoriesResult, eventsResult] = await Promise.all([
        expenseService.getCategories(),
        expenseService.getEvents()
      ]);
      
      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
        // Auto-select first expense category
        const expenseCategories = categoriesResult.data.filter(cat => cat.category_type === 'expense');
        if (expenseCategories.length > 0) {
          setFormData(prev => ({ ...prev, category_id: expenseCategories[0].id }));
        }
      }
      
      if (eventsResult.success) {
        setEvents(eventsResult.data);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      showNotification('Failed to load categories and events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Please enter a vendor name';
    }
    
    if (!formData.expense_date) {
      newErrors.expense_date = 'Please select a date';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fix the errors below', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const submissionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        receipts: receipts,
        submitted_by: user.id,
        organization_id: user.organization_id
      };
      
      const result = await expenseService.submitExpense(submissionData);
      
      if (result.success) {
        showNotification(
          result.offline 
            ? 'Expense saved offline. Will sync when connected.' 
            : 'Expense submitted successfully!',
          'success'
        );
        
        // Reset form
        setFormData({
          amount: '',
          vendor: '',
          description: '',
          expense_date: new Date().toISOString().split('T')[0],
          category_id: categories.find(cat => cat.category_type === 'expense')?.id || '',
          event_id: ''
        });
        setReceipts([]);
        
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        showNotification(result.error || 'Failed to submit expense', 'error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showNotification('Failed to submit expense. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await cameraService.startCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      showNotification('Unable to access camera. Please use file upload instead.', 'error');
    }
  };

  const capturePhoto = async () => {
    try {
      const imageBlob = await cameraService.capturePhoto(videoRef.current, canvasRef.current);
      const receipt = {
        id: Date.now(),
        file: imageBlob,
        preview: URL.createObjectURL(imageBlob),
        type: 'camera'
      };
      
      setReceipts(prev => [...prev, receipt]);
      stopCamera();
      showNotification('Receipt photo captured!', 'success');
    } catch (error) {
      console.error('Capture error:', error);
      showNotification('Failed to capture photo', 'error');
    }
  };

  const stopCamera = () => {
    cameraService.stopCamera(videoRef.current);
    setShowCamera(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const receipt = {
          id: Date.now() + Math.random(),
          file: file,
          preview: URL.createObjectURL(file),
          type: 'upload'
        };
        
        setReceipts(prev => [...prev, receipt]);
      }
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeReceipt = (receiptId) => {
    setReceipts(prev => {
      const updated = prev.filter(receipt => receipt.id !== receiptId);
      // Clean up object URLs
      const removed = prev.find(receipt => receipt.id === receiptId);
      if (removed && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return parseFloat(value).toFixed(2);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="expense-form-container">
      {/* Header */}
      <div className="form-header">
        <h1 className="form-title">Submit Expense</h1>
        <p className="form-subtitle">
          {isOnline ? 'Connected' : 'Offline - will sync when connected'}
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && <CheckCircleIcon className="notification-icon" />}
            {notification.type === 'error' && <ExclamationTriangleIcon className="notification-icon" />}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="notification-close"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="expense-form">
        {/* Amount */}
        <div className="form-group">
          <label className="form-label">
            <CurrencyDollarIcon className="form-label-icon" />
            Amount *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className={`form-input ${errors.amount ? 'form-input-error' : ''}`}
            required
          />
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>

        {/* Vendor */}
        <div className="form-group">
          <label className="form-label">
            <BuildingStorefrontIcon className="form-label-icon" />
            Vendor/Merchant *
          </label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleInputChange}
            placeholder="Store or company name"
            className={`form-input ${errors.vendor ? 'form-input-error' : ''}`}
            required
          />
          {errors.vendor && <span className="form-error">{errors.vendor}</span>}
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">
            <CalendarIcon className="form-label-icon" />
            Date *
          </label>
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            className={`form-input ${errors.expense_date ? 'form-input-error' : ''}`}
            required
          />
          {errors.expense_date && <span className="form-error">{errors.expense_date}</span>}
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">
            <DocumentTextIcon className="form-label-icon" />
            Category *
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className={`form-input ${errors.category_id ? 'form-input-error' : ''}`}
            required
          >
            <option value="">Select a category</option>
            {categories
              .filter(cat => cat.category_type === 'expense')
              .map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
          {errors.category_id && <span className="form-error">{errors.category_id}</span>}
        </div>

        {/* Event (Optional) */}
        <div className="form-group">
          <label className="form-label">
            Event (Optional)
          </label>
          <select
            name="event_id"
            value={formData.event_id}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="">No specific event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Additional details about this expense..."
            rows={3}
            className="form-input"
          />
        </div>

        {/* Receipt Upload */}
        <div className="form-group">
          <label className="form-label">Receipt Photos</label>
          
          <div className="receipt-upload-section">
            <div className="upload-buttons">
              <button
                type="button"
                onClick={startCamera}
                className="upload-btn upload-btn-camera"
                disabled={showCamera}
              >
                <CameraIcon className="upload-btn-icon" />
                Take Photo
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="upload-btn upload-btn-file"
              >
                <PhotoIcon className="upload-btn-icon" />
                Choose File
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Camera View */}
          {showCamera && (
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <div className="camera-controls">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="camera-btn camera-btn-capture"
                >
                  <div className="camera-btn-inner"></div>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="camera-btn camera-btn-cancel"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Receipt Previews */}
          {receipts.length > 0 && (
            <div className="receipt-previews">
              {receipts.map(receipt => (
                <div key={receipt.id} className="receipt-preview">
                  <img
                    src={receipt.preview}
                    alt="Receipt"
                    className="receipt-image"
                  />
                  <button
                    type="button"
                    onClick={() => removeReceipt(receipt.id)}
                    className="receipt-remove"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="submit-btn"
        >
          {submitting ? (
            <>
              <div className="submit-spinner"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircleIcon className="submit-btn-icon" />
              Submit Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpenseSubmissionForm;