import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function FundraiserEditRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to FundraiserManager with embedded edit mode
    // We'll use sessionStorage to pass the edit state
    if (id) {
      sessionStorage.setItem('editFundraiserId', id);
      navigate('/fundraisers', { replace: true });
    } else {
      navigate('/fundraisers', { replace: true });
    }
  }, [id, navigate]);

  // Show loading while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to fundraiser editor...</p>
      </div>
    </div>
  );
} 