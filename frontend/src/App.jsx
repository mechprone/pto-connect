import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Unauthorized from './pages/Unauthorized'

// Modular Page Imports
import EventsDashboard from './modules/events/pages/EventsDashboard'
import CreateEvent from './modules/events/pages/CreateEvent'
import EditEventPage from './modules/events/pages/EditEventPage'
import EventsCalendarPage from './modules/events/pages/EventsCalendarPage'

import FundraiserDashboard from './modules/fundraisers/pages/FundraiserDashboard'
import CreateFundraiser from './modules/fundraisers/pages/CreateFundraiser'

import BudgetDashboard from './modules/budgets/pages/BudgetDashboard'
import CreateBudgetEntry from './modules/budgets/pages/CreateBudgetEntry'

import MessagesDashboard from './modules/messages/pages/MessagesDashboard'
import CreateMessage from './modules/messages/pages/CreateMessage'

import DocumentsDashboard from './modules/documents/pages/DocumentsDashboard'
import UploadDocument from './modules/documents/pages/UploadDocument'

import SharedLibraryDashboard from './modules/sharedLibrary/pages/SharedLibraryDashboard'
import AiEventIdeas from './modules/ai/pages/AiEventIdeas'
import AdminUsersDashboard from './modules/adminUsers/pages/AdminUsersDashboard'

import TeacherRequestsDashboard from './modules/teacherRequests/pages/TeacherRequestsDashboard'
import CreateTeacherRequest from './modules/teacherRequests/pages/CreateTeacherRequest'

import BillingPage from './modules/billing/pages/BillingPage'

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
        <Route path="/events" element={<DashboardLayout><EventsDashboard /></DashboardLayout>} />
        <Route path="/events/create" element={<DashboardLayout><CreateEvent /></DashboardLayout>} />
        <Route path="/events/edit/:id" element={<DashboardLayout><EditEventPage /></DashboardLayout>} />
        <Route path="/events/calendar" element={<DashboardLayout><EventsCalendarPage /></DashboardLayout>} />
        
        <Route path="/fundraisers" element={<DashboardLayout><FundraiserDashboard /></DashboardLayout>} />
        <Route path="/fundraisers/create" element={<DashboardLayout><CreateFundraiser /></DashboardLayout>} />
        
        <Route path="/budget" element={<DashboardLayout><BudgetDashboard /></DashboardLayout>} />
        <Route path="/budget/create" element={<DashboardLayout><CreateBudgetEntry /></DashboardLayout>} />
        
        <Route path="/messages" element={<DashboardLayout><MessagesDashboard /></DashboardLayout>} />
        <Route path="/messages/create" element={<DashboardLayout><CreateMessage /></DashboardLayout>} />
        
        <Route path="/documents" element={<DashboardLayout><DocumentsDashboard /></DashboardLayout>} />
        <Route path="/documents/upload" element={<DashboardLayout><UploadDocument /></DashboardLayout>} />
        
        <Route path="/shared-library" element={<DashboardLayout><SharedLibraryDashboard /></DashboardLayout>} />
        <Route path="/ai-event-ideas" element={<DashboardLayout><AiEventIdeas /></DashboardLayout>} />
        <Route path="/admin/users" element={<DashboardLayout><AdminUsersDashboard /></DashboardLayout>} />
        <Route path="/billing" element={<DashboardLayout><BillingPage /></DashboardLayout>} />
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher-requests" element={<DashboardLayout><TeacherRequestsDashboard /></DashboardLayout>} />
        <Route path="/teacher-requests/create" element={<DashboardLayout><CreateTeacherRequest /></DashboardLayout>} />
      </Route>
    </Routes>
  )
}
