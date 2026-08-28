import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./Homepage";
import GetHelpPage from "./pages/GetHelpPage";
import OrganisationsPage from "./pages/OrganisationsPage";
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
          <Route path="/" element={<HomePage />} />

          <Route path="/get-help" element={<GetHelpPage />} />

          {/* Organisations Page */}
          <Route
            path="/organisations"
            element={<OrganisationsPage />}
          />

          <Route path="/jobs" element={<JobsPage />} />

          <Route path="/community" element={<CommunityPlaceholder />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;