import { Routes, Route } from 'react-router-dom';
import EnhancedCommunicationsDashboard from './EnhancedCommunicationsDashboard';
import CreateCommunication from './CreateCommunication';
// Legacy EmailComposer removed - using UnifiedCommunicationComposer
import SmsComposer from './SmsComposer';
import SocialPostComposer from './SocialPostComposer';
import UnifiedCommunicationComposer from './UnifiedCommunicationComposer';

export default function CommunicationsRoutes() {
  return (
    <Routes>
      <Route index element={<EnhancedCommunicationsDashboard />} />
      <Route path="create" element={<CreateCommunication />} />
      <Route path="compose" element={<UnifiedCommunicationComposer />} />
      <Route path="email" element={<UnifiedCommunicationComposer />} />
      <Route path="sms" element={<SmsComposer />} />
      <Route path="social" element={<SocialPostComposer />} />
    </Routes>
  );
} 