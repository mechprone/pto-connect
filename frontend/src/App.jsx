import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized'; // You'll need to create this simple component

import EventsDashboard from './pages/EventsDashboard';
import CreateEvent from './pages/CreateEvent';
import CreateFundraiser from './pages/CreateFundraiser';
import FundraiserDashboard from './pages/FundraiserDashboard';
import CreateBudgetEntry from './pages/CreateBudgetEntry';
import BudgetDashboard from './pages/BudgetDashboard';
import CreateTeacherRequest from './pages/CreateTeacherRequest';
import TeacherRequestsDashboard from './pages/TeacherRequestsDashboard';
import CreateMessage from './pages/CreateMessage';
import MessagesDashboard from './pages/MessagesDashboard';
import UploadDocument from './pages/UploadDocument';
import DocumentsDashboard from './pages/DocumentsDashboard';
import SharedLibraryDashboard from './pages/SharedLibraryDashboard';
import AiEventIdeas from './pages/AiEventIdeas';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<div className="text-blue-600 p-4">PTO Connect is running!</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/events" element={<EventsDashboard />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/fundraisers" element={<FundraiserDashboard />} />
        <Route path="/fundraisers/create" element={<CreateFundraiser />} />
        <Route path="/budget" element={<BudgetDashboard />} />
        <Route path="/budget/create" element={<CreateBudgetEntry />} />
        <Route path="/messages" element={<MessagesDashboard />} />
        <Route path="/messages/create" element={<CreateMessage />} />
        <Route path="/documents" element={<DocumentsDashboard />} />
        <Route path="/documents/upload" element={<UploadDocument />} />
        <Route path="/shared-library" element={<SharedLibraryDashboard />} />
        <Route path="/ai-event-ideas" element={<AiEventIdeas />} />
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher-requests" element={<TeacherRequestsDashboard />} />
        <Route path="/teacher-requests/create" element={<CreateTeacherRequest />} />
      </Route>
    </Routes>
  );
}
