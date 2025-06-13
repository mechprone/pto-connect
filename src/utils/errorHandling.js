import { toast } from 'react-toastify';

export const handleError = (error, message = 'An error occurred') => {
  // Log the error for debugging
  console.error('Error:', error);

  // Show user-friendly error message
  toast.error(message);

  // Return false to indicate error occurred
  return false;
};

export const handleSuccess = (message = 'Operation successful') => {
  toast.success(message);
  return true;
};

export const handleWarning = (message = 'Warning') => {
  toast.warning(message);
  return true;
};

export const handleInfo = (message = 'Information') => {
  toast.info(message);
  return true;
}; 