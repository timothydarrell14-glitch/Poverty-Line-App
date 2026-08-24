// client/src/App.jsx
import { useState } from "react";
import "./App.css";

// ==========================================
// [ADDED] Routing & Page Imports
// ==========================================
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import GetHelpPage from "./pages/GetHelpPage";

// [ADDED] Fallback placeholder views for routes pending from teammates
const JobsPlaceholder = () => (
  <div style={{ padding: "3rem", textAlign: "center" }}>
    <h2>Jobs Page</h2>
    <p>This page is currently under development by the team.</p>
    <Link to="/get-help" style={{ color: "#0d6e6e" }}>
      &larr; Back to Get Help
    </Link>
  </div>
);

const CommunityPlaceholder = () => (
  <div style={{ padding: "3rem", textAlign: "center" }}>
    <h2>Community Forum</h2>
    <p>This page is currently under development by the team.</p>
    <Link to="/get-help" style={{ color: "#0d6e6e" }}>
      &larr; Back to Get Help
    </Link>
  </div>
);

// ==========================================
// [ADDED] Main Application Router Root
// ==========================================
function App() {
  return (
    <Router>
      <main>
        <Routes>
          {/* Default entrypoint and Get Help page */}
          <Route path="/" element={<GetHelpPage />} />
          <Route path="/get-help" element={<GetHelpPage />} />

          {/* Placeholders for upcoming teammate routes */}
          <Route path="/jobs" element={<JobsPlaceholder />} />
          <Route path="/community" element={<CommunityPlaceholder />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
