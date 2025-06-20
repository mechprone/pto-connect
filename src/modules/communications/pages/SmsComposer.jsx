import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

export default function SmsComposer() {
  const navigate = useNavigate();

  // Redirect to unified composer for SMS
  useEffect(() => {
    navigate('/communications/compose?mode=sms');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">SMS Composer</h2>
          <p className="text-gray-600 mb-6">
            Redirecting to the unified communication composer for SMS messages...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
