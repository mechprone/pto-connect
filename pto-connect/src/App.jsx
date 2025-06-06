import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from '@/modules/components/layout/MainLayout'

// Auth
import LoginPage from '@/modules/auth/pages/LoginPage'
import SignupPage from '@/modules/auth/pages/SignupPage'
import UnauthorizedPage from '@/modules/auth/pages/UnauthorizedPage'

// Dashboard Pages (Add as Needed)
import AdminDashboard from './modules/admin/pages/AdminDashboard'
import BoardDashboard from './modules/dashboard/pages/BoardDashboard'
import CommitteeDashboard from './modules/dashboard/pages/CommitteeDashboard'
import VolunteerDashboard from './modules/dashboard/pages/VolunteerDashboard'
import ParentDashboard from './modules/dashboard/pages/ParentDashboard'
import TeacherDashboard from './modules/dashboard/pages/TeacherDashboard'

// Events
import EventsDashboard from './modules/events/pages/EventsDashboard'
import CreateEvent from './modules/events/pages/CreateEvent'
import EditEventPage from './modules/events/pages/EditEventPage'
import EventsCalendarPage from './modules/events/pages/EventsCalendarPage'

// Fundraisers
import FundraiserDashboard from './modules/fundraisers/pages/FundraiserDashboard'
import CreateFundraiser from './modules/fundraisers/pages/CreateFundraiser'

// Budget
import BudgetDashboard from './modules/budgets/pages/BudgetDashboard'
import CreateBudgetEntry from './modules/budgets/pages/CreateBudgetEntry'

// Communications
import CommunicationsDashboard from './modules/communications/pages/CommunicationsDashboard'
import CreateCommunication from './modules/communications/pages/CreateCommunication'
import EmailComposer from './modules/communications/pages/EmailComposer'
import SmsComposer from './modules/communications/pages/SmsComposer'
import SocialPostComposer from './modules/communications/pages/SocialPostComposer'
import AiContentAssistant from './modules/communications/pages/AiContentAssistant'

// Documents
import DocumentsDashboard from './modules/documents/pages/DocumentsDashboard'
import UploadDocument from './modules/documents/pages/UploadDocument'

// Shared Library & AI
import SharedLibraryDashboard from './modules/sharedLibrary/pages/SharedLibraryDashboard'
import AiEventIdeas from './modules/ai/pages/AiEventIdeas'

// Teacher
import TeacherRequestsDashboard from './modules/teacherRequests/pages/TeacherRequestsDashboard'
import CreateTeacherRequest from './modules/teacherRequests/pages/CreateTeacherRequest'

// Billing
import BillingPage from './modules/billing/pages/BillingPage'
import BillingSuccess from './modules/billing/pages/BillingSuccess'
import BillingCancel from './modules/billing/pages/BillingCancel'

// Onboarding
import CreatePtoPage from './modules/onboarding/pages/CreatePtoPage'
import PricingPage from './modules/onboarding/pages/PricingPage'
import CompleteSignupPage from './modules/onboarding/pages/CompleteSignupPage'
import SimpleSignupPage from './modules/onboarding/pages/SimpleSignupPage'
import NextStepPage from './modules/onboarding/pages/NextStepPage'

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<div className="text-blue-600 p-4">PTO Connect is running!</div>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Onboarding Routes */}
      <Route path="/onboarding/create-pto" element={<CreatePtoPage />} />
      <Route path="/onboarding/pricing" element={<PricingPage />} />
      <Route path="/onboarding/complete-signup" element={<CompleteSignupPage />} />
      <Route path="/onboarding/simple-signup" element={<SimpleSignupPage />} />
      <Route path="/onboarding/next-steps" element={<NextStepPage />} />
      
      {/* Billing Success/Cancel Routes */}
      <Route path="/billing/success" element={<BillingSuccess />} />
      <Route path="/billing/cancel" element={<BillingCancel />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/billing" element={<BillingPage />} />

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
        </Route>
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher-requests" element={<TeacherRequestsDashboard />} />
          <Route path="/teacher-requests/create" element={<CreateTeacherRequest />} />
        </Route>
      </Route>

      {/* Additional Role Dashboards */}
      <Route element={<ProtectedRoute allowedRoles={['board_member']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard/board" element={<BoardDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['committee_lead']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard/committee" element={<CommitteeDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['volunteer']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['parent_member']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}
