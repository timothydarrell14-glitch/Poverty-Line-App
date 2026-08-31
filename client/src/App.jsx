import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./Homepage";
import GetHelpPage from "./pages/GetHelpPage";
import CommunityPage from "./pages/CommunityPage";
import OrganisationsPage from "./pages/OrganisationsPage";
import DonorsPage from "./pages/DonorsPage";
import LogisticsPage from "./pages/LogisticsPage";
import JobsPage from "./pages/JobsPage";

import "./App.css";

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
          <Route path="/organisations" element={<OrganisationsPage />} />

          <Route path="/donors" element={<DonorsPage />} />

          {/* Logistics Page */}
          <Route path="/logistics" element={<LogisticsPage />} />

          {/* Jobs */}
          <Route path="/jobs" element={<JobsPage />} />

          {/* Community */}
          <Route path="/community" element={<CommunityPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
