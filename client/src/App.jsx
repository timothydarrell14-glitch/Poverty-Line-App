import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import AccessDeniedPage from './pages/AccessDeniedPage'
import LoginPage from './pages/LoginPage'
import Chats from './pages/Admin/Chats'
import Deliveries from './pages/Admin/Deliveries'
import Home from './pages/Admin/Home'
import Programs from './pages/Admin/Programs'
import Settings from './pages/Admin/Settings'
import Users from './pages/Admin/Users'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Home />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/programs" element={<Programs />} />
        <Route path="/admin/deliveries" element={<Deliveries />} />
        <Route path="/admin/chats" element={<Chats />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/admin" />} />
    </Routes>
  )
}

export default App
