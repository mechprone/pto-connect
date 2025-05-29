import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EventsDashboard from './pages/EventsDashboard'
import CreateEvent from './pages/CreateEvent'
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="text-blue-600 p-4">PTO Central is running!</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events" element={<EventsDashboard />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/fundraisers" element={<FundraiserDashboard />} />
        <Route path="/fundraisers/create" element={<CreateFundraiser />} />
	<Route path="/budget/create" element={<CreateBudgetEntry />} />
	<Route path="/budget" element={<BudgetDashboard />} />
	<Route path="/teacher-requests/create" element={<CreateTeacherRequest />} />
	<Route path="/teacher-requests" element={<TeacherRequestsDashboard />} />
	<Route path="/messages/create" element={<CreateMessage />} />
	<Route path="/messages" element={<MessagesDashboard />} />
	<Route path="/documents/upload" element={<UploadDocument />} />
	<Route path="/documents" element={<DocumentsDashboard />} />
      </Routes>
    </Router>
  )
}
