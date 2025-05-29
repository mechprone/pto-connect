import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EventsDashboard from './pages/EventsDashboard'
import CreateEvent from './pages/CreateEvent'
import CreateFundraiser from './pages/CreateFundraiser'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="text-blue-600 p-4">PTO Central is running!</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events" element={<EventsDashboard />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/fundraisers/create" element={<CreateFundraiser />} />
      </Routes>
    </Router>
  )
}
