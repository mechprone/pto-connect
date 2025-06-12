import React from 'react';
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from '@/modules/components/layout/MainLayout'
import StellaProvider from './components/common/StellaProvider'

// Auth
import LoginPage from '@/modules/auth/pages/LoginPage'
import SignupPage from '@/modules/auth/pages/SignupPage'
import UnauthorizedPage from '@/modules/auth/pages/UnauthorizedPage'

// Enhanced Dashboard
import EnhancedDashboard from './components/dashboard/EnhancedDashboard'

// Dashboard Pages (Add as Needed)
import AdminDashboard from './modules/admin/pages/AdminDashboard'
import PermissionManagement from './modules/admin/pages/PermissionManagement'
import BoardDashboard from './modules/dashboard/pages/BoardDashboard'
import CommitteeDashboard from './modules/dashboard/pages/CommitteeDashboard'
import VolunteerDashboard from './modules/dashboard/pages/VolunteerDashboard'
import ParentDashboard from './modules/dashboard/pages/ParentDashboard'
import TeacherDashboard from './modules/dashboard/pages/TeacherDashboard'

// Events
import EventsDashboard from './modules/events/pages/EventsDashboard'
import EnhancedEventsDashboard from './modules/events/pages/EnhancedEventsDashboard'
import CreateEvent from './modules/events/pages/CreateEvent'
import EditEventPage from './modules/events/pages/EditEventPage'
import EventsCalendarPage from './modules/events/pages/EventsCalendarPage'
import RSVPTestPage from './modules/events/pages/RSVPTestPage'
import EventDetails from './modules/events/pages/EventDetails'

// Fundraisers
import FundraiserDashboard from './modules/fundraisers/pages/FundraiserDashboard'
import CreateFundraiser from './modules/fundraisers/pages/CreateFundraiser'

// Budget
import BudgetDashboard from './modules/budgets/pages/BudgetDashboard'
import EnhancedBudgetDashboard from './modules/budgets/pages/EnhancedBudgetDashboard'
import CreateBudgetEntry from './modules/budgets/pages/CreateBudgetEntry'
import BudgetCategoryDetails from './modules/budgets/pages/BudgetCategoryDetails'
import CreateEditBudgetCategory from './modules/budgets/pages/CreateEditBudgetCategory'
import BudgetSubcategoryDetails from './modules/budgets/pages/BudgetSubcategoryDetails'
import CreateEditBudgetSubcategory from './modules/budgets/pages/CreateEditBudgetSubcategory'
import TransactionDetails from './modules/budgets/pages/TransactionDetails'
import CreateEditTransaction from './modules/budgets/pages/CreateEditTransaction'

// Budget Reconciliation
import ReconciliationDashboard from './components/budget/reconciliation/ReconciliationDashboard'

// Communications
import CommunicationsDashboard from './modules/communications/pages/CommunicationsDashboard'
import EnhancedCommunicationsDashboard from './modules/communications/pages/EnhancedCommunicationsDashboard'
import CreateCommunication from './modules/communications/pages/CreateCommunication'
import EmailComposer from './modules/communications/pages/EmailComposer'
import SmsComposer from './modules/communications/pages/SmsComposer'
import SocialPostComposer from './modules/communications/pages/SocialPostComposer'
import AiContentAssistant from './modules/communications/pages/AiContentAssistant'
import CommunicationAnalytics from './modules/communications/pages/CommunicationAnalytics'
import CommunicationSchedule from './modules/communications/pages/CommunicationSchedule'
import CommunicationAudiences from './modules/communications/pages/CommunicationAudiences'
import CommunicationDetails from './modules/communications/pages/CommunicationDetails'

// Phase 4 Communication Components
import CommunicationDashboard from './components/Communication/CommunicationDashboard'
import EmailTemplateBuilder from './components/Communication/EmailTemplateBuilder'
import SMSCampaignManager from './components/Communication/SMSCampaignManager'
import EmailTemplateManager from './components/Communication/EmailTemplateManager'

// Documents
import DocumentsDashboard from './modules/documents/pages/DocumentsDashboard'
import UploadDocument from './modules/documents/pages/UploadDocument'

// Shared Library & AI
import SharedLibraryDashboard from './modules/sharedLibrary/pages/SharedLibraryDashboard'
import AiEventIdeas from './modules/ai/pages/AiEventIdeas'
import EventWorkflowOrchestratorPage from './modules/ai/pages/EventWorkflowOrchestratorPage'
import AdvancedDesignStudioPage from './modules/communications/pages/AdvancedDesignStudioPage'

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
    <StellaProvider>
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Temporary Testing Routes - Remove in Production */}
      <Route path="/test-event-wizard" element={<CreateEvent />} />
      <Route path="/test-rsvp-system" element={<RSVPTestPage />} />
      
      {/* Onboarding Routes */}
      <Route path="/onboarding/create-pto" element={<CreatePtoPage />} />
      <Route path="/onboarding/pricing" element={<PricingPage />} />
      <Route path="/onboarding/complete-signup" element={<CompleteSignupPage />} />
      <Route path="/onboarding/simple-signup" element={<SimpleSignupPage />} />
      <Route path="/onboarding/next-steps" element={<NextStepPage />} />
      
      {/* Billing Success/Cancel Routes */}
      <Route path="/billing/success" element={<BillingSuccess />} />
      <Route path="/billing/cancel" element={<BillingCancel />} />

      {/* Enhanced Dashboard Route - Available to all authenticated users */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'board_member', 'committee_lead', 'volunteer', 'parent_member', 'teacher']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<EnhancedDashboard />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/admin/permissions" element={<PermissionManagement />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          <Route path="/billing" element={<BillingPage />} />

          <Route path="/events" element={<EnhancedEventsDashboard />} />
          <Route path="/events/legacy" element={<EventsDashboard />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/edit/:id" element={<EditEventPage />} />
          <Route path="/events/details/:id" element={<EventDetails />} />
          <Route path="/events/calendar" element={<EventsCalendarPage />} />

          <Route path="/fundraisers" element={<FundraiserDashboard />} />
          <Route path="/fundraisers/create" element={<CreateFundraiser />} />

          <Route path="/budget" element={<EnhancedBudgetDashboard />} />
          <Route path="/budget/legacy" element={<BudgetDashboard />} />
          <Route path="/budget/create" element={<CreateBudgetEntry />} />
          
          {/* Budget Child Pages */}
          <Route path="/budget/category/:id" element={<BudgetCategoryDetails />} />
          <Route path="/budget/category/create" element={<CreateEditBudgetCategory />} />
          <Route path="/budget/category/edit/:id" element={<CreateEditBudgetCategory />} />
          <Route path="/budget/category/optimize/:id" element={<CreateEditBudgetCategory />} />
          <Route path="/budget/subcategory/:id" element={<BudgetSubcategoryDetails />} />
          <Route path="/budget/subcategory/create" element={<CreateEditBudgetSubcategory />} />
          <Route path="/budget/subcategory/edit/:id" element={<CreateEditBudgetSubcategory />} />
          <Route path="/budget/transaction/:id" element={<TransactionDetails />} />
          <Route path="/budget/transaction/create" element={<CreateEditTransaction />} />
          <Route path="/budget/transaction/edit/:id" element={<CreateEditTransaction />} />
          
          {/* Budget Reconciliation Routes */}
          <Route path="/budget/reconciliation" element={<ReconciliationDashboard />} />

          <Route path="/communications" element={<EnhancedCommunicationsDashboard />} />
          <Route path="/communications/legacy" element={<CommunicationsDashboard />} />
          <Route path="/communications/create" element={<CreateCommunication />} />
          <Route path="/communications/details/:id" element={<CommunicationDetails />} />
          <Route path="/communications/email" element={<EmailComposer />} />
          <Route path="/communications/email/edit/:id" element={<EmailComposer />} />
          <Route path="/communications/sms" element={<SmsComposer />} />
          <Route path="/communications/sms/edit/:id" element={<SmsComposer />} />
          <Route path="/communications/social" element={<SocialPostComposer />} />
          <Route path="/communications/social/edit/:id" element={<SocialPostComposer />} />
          <Route path="/communications/ai" element={<AiContentAssistant />} />
          <Route path="/communications/analytics" element={<CommunicationAnalytics />} />
          <Route path="/communications/schedule" element={<CommunicationSchedule />} />
          <Route path="/communications/audiences" element={<CommunicationAudiences />} />
          <Route path="/communications/design-studio" element={<AdvancedDesignStudioPage />} />
          
          {/* New Phase 4 Communication Routes */}
          <Route path="/communications/dashboard" element={<CommunicationDashboard />} />
          <Route path="/communications/email-templates" element={<EmailTemplateManager />} />
          <Route path="/communications/email-templates/create" element={<EmailTemplateBuilder />} />
          <Route path="/communications/email-templates/edit/:id" element={<EmailTemplateBuilder />} />
          <Route path="/communications/sms-campaigns" element={<SMSCampaignManager />} />
          <Route path="/communications/sms-campaigns/create" element={<SMSCampaignManager />} />

          <Route path="/documents" element={<DocumentsDashboard />} />
          <Route path="/documents/upload" element={<UploadDocument />} />

          <Route path="/shared-library" element={<SharedLibraryDashboard />} />
          <Route path="/ai-event-ideas" element={<AiEventIdeas />} />
          <Route path="/ai-workflow-orchestrator" element={<EventWorkflowOrchestratorPage />} />
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
    </StellaProvider>
  )
}
