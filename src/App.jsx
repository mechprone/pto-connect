import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from '@/modules/components/layout/MainLayout'

// ✅ Modular Auth Pages
import LoginPage from '@/modules/auth/pages/LoginPage'
import SignupPage from '@/modules/auth/pages/SignupPage'
import UnauthorizedPage from '@/modules/auth/pages/UnauthorizedPage'

// ✅ Modular Dashboards and Feature Pages
import EventsDashboard from './modules/events/pages/EventsDashboard'
import CreateEvent from './modules/events/pages/CreateEvent'
import EditEventPage from './modules/events/pages/EditEventPage'
import EventsCalendarPage from './modules/events/pages/EventsCalendarPage'

import FundraiserDashboard from './modules/fundraisers/pages/FundraiserDashboard'
import CreateFundraiser from './modules/fundraisers/pages/CreateFundraiser'

import BudgetDashboard from './modules/budgets/pages/BudgetDashboard'
import CreateBudgetEntry from './modules/budgets/pages/CreateBudgetEntry'

import CommunicationsDashboard from './modules/communications/pages/CommunicationsDashboard'
import CreateCommunication from './modules/communications/pages/CreateCommunication'
import EmailComposer from './modules/communications/pages/EmailComposer'
import SmsComposer from './modules/communications/pages/SmsComposer'
import SocialPostComposer from './modules/communications/pages/SocialPostComposer'
import AiContentAssistant from './modules/communications/pages/AiContentAssistant'

import DocumentsDashboard from './modules/documents/pages/DocumentsDashboard'
import UploadDocument from './modules/documents/pages/UploadDocument'

import SharedLibraryDashboard from './modules/sharedLibrary/pages/SharedLibraryDashboard'
import AiEventIdeas from './modules/ai/pages/AiEventIdeas'
import AdminDashboard from './modules/admin/pages/AdminDashboard'

import TeacherRequestsDashboard from './modules/teacherRequests/pages/TeacherRequestsDashboard'
import CreateTeacherRequest from './modules/teacherRequests/pages/CreateTeacherRequest'

import BillingPage from './modules/billing/pages/BillingPage'

import EmailComposer from './modules/communications/pages/EmailComposer'

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<div className="text-blue-600 p-4">PTO Connect is running!</div>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin Routes with MainLayout */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/events" element={<EventsDashboard />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/edit/:id" element={<EditEventPage />} />
          <Route path="/events/calendar" element={<EventsCalendarPage />} />

          <Route path="/fundraisers" element={<FundraiserDashboard />} />
          <Route path="/fundraisers/create" element={<CreateFundraiser />} />

          <Route path="/budget" element={<BudgetDashboard />} />
          <Route path="/budget/create" element={<CreateBudgetEntry />} />

          <Route path="/communications" element={<CommunicationsDashboard />} />
          <Route path="/communications/create" element={<CreateCommunication />} />
          <Route path="/communications/email" element={<EmailComposer />} />
          <Route path="/communications/sms" element={<SmsComposer />} />
          <Route path="/communications/social" element={<SocialPostComposer />} />
          <Route path="/communications/ai" element={<AiContentAssistant />} />

          <Route path="/documents" element={<DocumentsDashboard />} />
          <Route path="/documents/upload" element={<UploadDocument />} />

          <Route path="/shared-library" element={<SharedLibraryDashboard />} />
          <Route path="/ai-event-ideas" element={<AiEventIdeas />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/communications/email" element={<EmailComposer />} />
        </Route>
      </Route>

      {/* Teacher Routes with MainLayout */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<MainLayout />}>
          <Route path="/teacher-requests" element={<TeacherRequestsDashboard />} />
          <Route path="/teacher-requests/create" element={<CreateTeacherRequest />} />
        </Route>
      </Route>
    </Routes>
  )
}
