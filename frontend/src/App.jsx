import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Unauthorized from './pages/Unauthorized'

import EventsDashboard from './pages/EventsDashboard'
import CreateEvent from './pages/CreateEvent'
import EditEventPage from './pages/EditEventPage'
import EventsCalendarPage from './pages/EventsCalendarPage'

import CreateFundraiser from './pages/CreateFundraiser'
import FundraiserDashboard from './pages/FundraiserDashboard'
import CreateBudgetEntry from './pages/CreateBudgetEntry'
import BudgetDashboard from './pages/BudgetDashboard'
import CreateTeacherRequest from './pages/CreateTeacherRequest'
import TeacherRequestsDashboard from './pages/TeacherRequestsDashboard'
import CreateMessage from './pages/CreateMessage'
import MessagesDashboard from './pages/MessagesDashboard'
import UploadDocument from './pages/UploadDocument'
import DocumentsDashboard from './pages/DocumentsDashboard'
import SharedLibraryDashboard from './pages/SharedLibraryDashboard'
import AiEventIdeas from './pages/AiEventIdeas'
import AdminUsersDashboard from './pages/AdminUsersDashboard'

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
        <Route
          path="/events"
          element={
            <DashboardLayout>
              <EventsDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/events/create"
          element={
            <DashboardLayout>
              <CreateEvent />
            </DashboardLayout>
          }
        />
        <Route
          path="/events/edit/:id"
          element={
            <DashboardLayout>
              <EditEventPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/events/calendar"
          element={
            <DashboardLayout>
              <EventsCalendarPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/fundraisers"
          element={
            <DashboardLayout>
              <FundraiserDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/fundraisers/create"
          element={
            <DashboardLayout>
              <CreateFundraiser />
            </DashboardLayout>
          }
        />
        <Route
          path="/budget"
          element={
            <DashboardLayout>
              <BudgetDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/budget/create"
          element={
            <DashboardLayout>
              <CreateBudgetEntry />
            </DashboardLayout>
          }
        />
        <Route
          path="/messages"
          element={
            <DashboardLayout>
              <MessagesDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/messages/create"
          element={
            <DashboardLayout>
              <CreateMessage />
            </DashboardLayout>
          }
        />
        <Route
          path="/documents"
          element={
            <DashboardLayout>
              <DocumentsDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/documents/upload"
          element={
            <DashboardLayout>
              <UploadDocument />
            </DashboardLayout>
          }
        />
        <Route
          path="/shared-library"
          element={
            <DashboardLayout>
              <SharedLibraryDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/ai-event-ideas"
          element={
            <DashboardLayout>
              <AiEventIdeas />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <DashboardLayout>
              <AdminUsersDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route
          path="/teacher-requests"
          element={
            <DashboardLayout>
              <TeacherRequestsDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/teacher-requests/create"
          element={
            <DashboardLayout>
              <CreateTeacherRequest />
            </DashboardLayout>
          }
        />
      </Route>
    </Routes>
  )
}
