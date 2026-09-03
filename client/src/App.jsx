import './App.css'
import { useLayoutEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import AccessDeniedPage from './pages/AccessDeniedPage'
import LoginPage from './pages/LoginPage'
import Chats from './pages/Admin/Chats'
import Deliveries from './pages/Admin/Deliveries'
import Home from './pages/Admin/Home'
import Programs from './pages/Admin/Programs'
import Settings from './pages/Admin/Settings'
import Users from './pages/Admin/Users'
import HomePage from './pages/Homepage'
import GetHelpPage from './pages/GetHelpPage'
import CommunityPage from './pages/CommunityPage'
import OrganisationsPage from './pages/OrganisationsPage'
import DonorsPage from './pages/DonorsPage'
import LogisticsPage from './pages/LogisticsPage'
import JobsPage from './pages/JobsPage'
import ContactPage from './pages/ContactPage'
import './styles/Admin/Scrollbar.css'
import ComingSoon from './components/Admin/ComingSoon'

function PreviewGate({ feature, children }) {
  const [isPreviewing, setIsPreviewing] = useState(false)

  return isPreviewing ? children : <ComingSoon feature={feature} onPreview={() => setIsPreviewing(true)} />
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/get-help" element={<GetHelpPage />} />
        <Route path="/organisations" element={<OrganisationsPage />} />
        <Route path="/donors" element={<DonorsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/logistics" element={<LogisticsPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Home />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/programs" element={<Programs />} />
          <Route path="/admin/deliveries" element={<PreviewGate feature="Deliveries"><Deliveries /></PreviewGate>} />
          <Route path="/admin/chats" element={<PreviewGate feature="Chats"><Chats /></PreviewGate>} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  )
}

export default App
