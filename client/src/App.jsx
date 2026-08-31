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
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import HomePage from "./Homepage";
import GetHelpPage from "./pages/GetHelpPage";
import OrganisationsPage from "./pages/OrganisationsPage";
import DonorsPage from "./pages/DonorsPage";
import LogisticsPage from "./pages/LogisticsPage";
import JobsPage from "./pages/JobsPage";

import "./App.css";

// Fallback placeholder view pending from teammates
const CommunityPlaceholder = () => (
  <div style={{ padding: "3rem", textAlign: "center" }}>
    <h2>Community Forum</h2>
    <p>This page is currently under development by the team.</p>
    <Link to="/get-help" style={{ color: "#0d6e6e" }}>
      &larr; Back to Get Help
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <main>
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Get Help */}
          <Route path="/get-help" element={<GetHelpPage />} />

          {/* Organisations Page */}
          <Route
            path="/organisations"
            element={<OrganisationsPage />}
          />

          <Route path="/donors" element={<DonorsPage />} />

          {/* <Route path="/jobs" element={<JobsPlaceholder />} /> */}
          {/* Logistics Page */}
          <Route
            path="/logistics"
            element={<LogisticsPage />}
          />

          {/* Jobs */}
          <Route
            path="/jobs"
            element={<JobsPage />}
          />

          {/* Community */}
          <Route
            path="/community"
            element={<CommunityPlaceholder />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
