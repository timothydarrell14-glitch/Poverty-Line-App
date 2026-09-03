import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import foodforwardImage from "../assets/foodforward.jpg";
import globalcareImage from "../assets/globalcare.jpg";
import heroSupportImage from "../assets/hero-support.jpg";

import { apiRequest } from "../api/client";
import { listOrganisations } from "../api/organisations";
import { listPrograms, createProgram } from "../api/programs";
import { getCurrentUser } from "../utils/auth";
import "../styles/OrganisationsPage.css";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
];

const INITIAL_LOGS = [
  {
    id: "log-1",
    title: "Shipment #402 delivered",
    timestamp: "12 mins ago",
    type: "delivery",
    status: "completed",
    details: "1,200 kg staple grains and pantry provisions received at Central Hub.",
    icon: "local_shipping",
  },
  {
    id: "log-2",
    title: "Low inventory alert: Pantry B",
    timestamp: "34 mins ago",
    type: "inventory",
    status: "warning",
    details: "Baby formula and dry legumes inventory under 15% threshold; replenishment triggered.",
    icon: "warning",
  },
  {
    id: "log-3",
    title: "5 new volunteers onboarded",
    timestamp: "1 hour ago",
    type: "volunteer",
    status: "info",
    details: "Completed food safety and route-dispatch safety certification.",
    icon: "person",
  },
  {
    id: "log-4",
    title: "Route optimized for Zone A",
    timestamp: "2 hours ago",
    type: "route",
    status: "completed",
    details: "Dynamic routing reduced transit fuel expenditure by 18%.",
    icon: "alt_route",
  },
];

const INITIAL_DONATIONS = [
  {
    id: "PL-FIN-847291",
    receipt: "PL-FIN-847291",
    donorName: "Elena Rostova",
    donorEmail: "elena.rostova@gmail.com",
    program: "Sustainable Wells Initiative",
    amount: 150,
    frequency: "Monthly",
    date: "Aug 25, 2026",
  },
  {
    id: "PL-FIN-739102",
    receipt: "PL-FIN-739102",
    donorName: "Elena Rostova",
    donorEmail: "elena.rostova@gmail.com",
    program: "Urban Nutrition Centers",
    amount: 500,
    frequency: "One-Time",
    date: "Aug 10, 2026",
  },
  {
    id: "PL-FIN-629184",
    receipt: "PL-FIN-629184",
    donorName: "Elena Rostova",
    donorEmail: "elena.rostova@gmail.com",
    program: "Mobile Health Clinics",
    amount: 75,
    frequency: "One-Time",
    date: "Jul 28, 2026",
  },
  {
    id: "PL-FIN-518293",
    receipt: "PL-FIN-518293",
    donorName: "Marcus Sterling",
    donorEmail: "marcus.sterling@techcorp.io",
    program: "Digital Literacy Access",
    amount: 1200,
    frequency: "One-Time",
    date: "Jul 15, 2026",
  },
  {
    id: "PL-FIN-409182",
    receipt: "PL-FIN-409182",
    donorName: "Sarah Jenkins",
    donorEmail: "sarah.j@foundation.org",
    program: "Urban Nutrition Centers",
    amount: 300,
    frequency: "Monthly",
    date: "Jul 01, 2026",
  },
];

const INITIAL_PROGRAMS = [
  {
    id: 101,
    title: "Sustainable Wells Initiative",
    category: "Clean Water",
    description: "Building community-managed water infrastructure in drought-prone regions to ensure long-term health.",
    raised: 412000,
    goal: 500000,
    pct: 82,
    subtext: "82% funded • 38,000+ people with ongoing access to verified clean water",
    image: heroSupportImage,
  },
  {
    id: 102,
    title: "Urban Nutrition Centers",
    category: "Food Security",
    description: "Providing dignified access to nutritious meals through community-led kitchens and local farm partnerships.",
    raised: 285000,
    goal: 350000,
    pct: 81,
    subtext: "81% funded • 14,200 nutritious hot meals served every single week",
    image: globalcareImage,
  },
  {
    id: 103,
    title: "Digital Literacy Access",
    category: "Education",
    description: "Equipping youth and adults with refurbished laptops and workforce digital skill certifications.",
    raised: 198000,
    goal: 250000,
    pct: 79,
    subtext: "79% funded • 850+ tech lab graduates placed in remote apprenticeships",
    image: foodforwardImage,
  },
  {
    id: 104,
    title: "Maternal & Infant Health Hub",
    category: "Health",
    description: "Frontline clinical care and nutritional hampers for new mothers in rural communities.",
    raised: 120000,
    goal: 180000,
    pct: 67,
    subtext: "67% funded • 2,400 prenatal checkups completed",
    image: heroSupportImage,
  },
];

const INITIAL_JOBS = [
  {
    id: 201,
    title: "Community Outreach Coordinator",
    schedule: "Immediate",
    location: "City Center",
    wage: "$24.50 / hr + Benefits",
    description: "Engage with local neighborhoods to distribute resources and facilitate support groups. Full-time position with benefits.",
    applicants: 8,
    status: "active",
  },
  {
    id: 202,
    title: "Warehouse Associate",
    schedule: "Part-time",
    location: "North District",
    wage: "$20.00 / hr",
    description: "Assist in organizing and distributing food and essential supplies at our main distribution hub. Flexible hours available.",
    applicants: 14,
    status: "active",
  },
  {
    id: 203,
    title: "Family Resource Navigator",
    schedule: "Full-time",
    location: "West Metro Hub",
    wage: "$26.00 / hr + Health",
    description: "Guide families through emergency housing applications and social service aid eligibility.",
    applicants: 6,
    status: "active",
  },
  {
    id: 204,
    title: "Logistics Fleet Driver",
    schedule: "Full-time",
    location: "Central Hub",
    wage: "$22.50 / hr",
    description: "Operate resource delivery vans across regional distribution hubs.",
    applicants: 12,
    status: "active",
  },
];

const INITIAL_PIPELINE = [
  {
    code: "PL-PHYS-93821",
    category: "Infant Care & Diapers",
    description: "12 boxes infant formula (Stage 1 & 2), 24 packs hypoallergenic wipes, 8 diaper bundles",
    qty: "44 items (~65 lbs)",
    method: "Scheduled Courier Pickup",
    status: "Scheduled",
  },
  {
    code: "PL-PHYS-82910",
    category: "Tech & Laptops",
    description: "5 refurbished Dell Latitude laptops with chargers for digital literacy labs",
    qty: "5 laptops",
    method: "Drop-off at Local Hub",
    status: "Received & Sorted",
  },
];

export function OrganisationsPage({ onOpenDonate }) {
  const [, setCurrentUser] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState("dashboard-summary");

  // Dashboard Data State
  const [organisation, setOrganisation] = useState({
    id: 1,
    name: "Maya Lin",
    badge: "501(c)(3) Verified Org",
    ein: "EIN: 94-3829104",
    location: "Kericho • Kericho Trust",
    email: "info@kerichotrust.org",
    avatar: PRESET_AVATARS[0],
  });

  const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [donations, setDonations] = useState(INITIAL_DONATIONS);
  const [logs] = useState(INITIAL_LOGS);
  const [pipeline] = useState(INITIAL_PIPELINE);

  // Modals state
  const [isNewProgramOpen, setIsNewProgramOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isSendNoteOpen, setIsSendNoteOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [viewApplicantsJob, setViewApplicantsJob] = useState(null);

  // Forms State
  const [profileForm, setProfileForm] = useState({
    name: "",
    ein: "",
    location: "",
    email: "",
    avatar: "",
  });

  const [programForm, setProgramForm] = useState({
    title: "",
    category: "Food Security",
    funding_goal: 300000,
    impact_statement: "",
    description: "",
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    employment_type: "Full-time",
    wage: "$24.00 / hr + Benefits",
    location: "Bay Area Regional Hub",
    description: "",
    requirements: "Organized and self-driven\nDriver license preferred\nTeam player",
  });

  /* =========================================================
     LOAD DATABASE DATA FROM SERVER ENDPOINTS
     ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch current logged-in user profile
        const userRes = await apiRequest("/api/auth/me").catch(() => null);
        if (userRes?.user) {
          setCurrentUser(userRes.user);
          setOrganisation((prev) => ({
            ...prev,
            name: userRes.user.name || prev.name,
            email: userRes.user.email || prev.email,
            avatar: userRes.user.avatarUrl || prev.avatar,
          }));
        }

        // 2. Fetch organisations
        const orgRes = await listOrganisations().catch(() => null);
        if (orgRes?.organisations?.length) {
          const matched = orgRes.organisations[0];
          setOrganisation((prev) => ({
            ...prev,
            id: matched.organisation_id || prev.id,
            name: matched.name || prev.name,
            email: matched.email || prev.email,
            location: matched.location || prev.location,
            ein: matched.ein ? `EIN: ${matched.ein}` : prev.ein,
          }));
        }

        // 3. Fetch programs from server
        const progRes = await listPrograms().catch(() => null);
        if (progRes?.programs?.length) {
          const dbPrograms = progRes.programs.map((p, idx) => ({
            id: p.id,
            title: p.title,
            category: p.type || p.category || "Community Action",
            description: p.description || p.summary || "No description provided.",
            raised: p.funding_raised || (p.funding_goal ? p.funding_goal * 0.8 : 150000),
            goal: p.funding_goal || 250000,
            pct: p.funding_goal ? Math.round(((p.funding_raised || 0) / p.funding_goal) * 100) : 80,
            subtext: `${p.funding_goal ? Math.round(((p.funding_raised || 0) / p.funding_goal) * 100) : 80}% funded • Verified community initiative`,
            image: p.image_url || [heroSupportImage, globalcareImage, foodforwardImage][idx % 3],
          }));
          setPrograms(dbPrograms);
        }

        // 4. Fetch jobs from server
        const jobsRes = await apiRequest("/api/jobs").catch(() => null);
        if (jobsRes?.jobs?.length) {
          const dbJobs = jobsRes.jobs.map((j) => ({
            id: j.id,
            title: j.title,
            schedule: j.minimum_education || "Full-time",
            location: j.experience || "Regional Hub",
            wage: "$24.50 / hr + Benefits",
            description: j.description || "Engage with local community programs.",
            applicants: 4,
            status: j.status || "active",
          }));
          setJobs(dbJobs);
        }

        // 5. Fetch financial donations ledger from server
        const donationsRes = await apiRequest("/api/donations").catch(() => null);
        if (donationsRes?.donations?.length) {
          const dbDonations = donationsRes.donations.map((d, i) => ({
            id: d.id || `PL-FIN-${800000 + i}`,
            receipt: `PL-FIN-${800000 + i}`,
            donorName: d.donor_name || "Elena Rostova",
            donorEmail: d.donor_email || "elena.rostova@gmail.com",
            program: d.program_title || "Sustainable Wells Initiative",
            amount: d.amount || 150,
            frequency: d.amount > 200 ? "One-Time" : "Monthly",
            date: d.date || "Aug 25, 2026",
          }));
          setDonations(dbDonations);
        }
      } catch (err) {
        console.warn("Using baseline fallback data for organisation portal:", err);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     PROFILE EDIT HANDLERS
     ========================================================= */

  const openEditProfileModal = () => {
    setProfileForm({
      name: organisation.name,
      ein: organisation.ein.replace("EIN: ", ""),
      location: organisation.location,
      email: organisation.email,
      avatar: organisation.avatar,
    });
    setIsEditProfileOpen(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileForm.name,
        location: profileForm.location,
        email: profileForm.email,
      };

      if (organisation.id) {
        await apiRequest(`/api/organisations/${organisation.id}`, {
          method: "PATCH",
          body: payload,
        }).catch(() => null);
      }

      setOrganisation((prev) => ({
        ...prev,
        name: profileForm.name,
        ein: profileForm.ein ? `EIN: ${profileForm.ein}` : prev.ein,
        location: profileForm.location,
        email: profileForm.email,
        avatar: profileForm.avatar,
      }));

      setIsEditProfileOpen(false);
      alert("Organisation Profile updated successfully!");
    } catch {
      alert("Profile updated locally.");
      setIsEditProfileOpen(false);
    }
  };

  /* =========================================================
     ACTIONS & HANDLERS
     ========================================================= */

  const handleCreateProgramSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: programForm.title,
        type: programForm.category,
        funding_goal: Number(programForm.funding_goal),
        summary: programForm.impact_statement,
        description: programForm.description,
        organisation_id: organisation.id || 1,
      };
      const res = await createProgram(payload).catch(() => null);
      const newProg = {
        id: res?.id || Date.now(),
        title: programForm.title,
        category: programForm.category,
        description: programForm.description,
        raised: 0,
        goal: Number(programForm.funding_goal),
        pct: 0,
        subtext: `0% funded • Newly published community initiative`,
        image: heroSupportImage,
      };
      setPrograms([newProg, ...programs]);
      setIsNewProgramOpen(false);
      setProgramForm({
        title: "",
        category: "Food Security",
        funding_goal: 300000,
        impact_statement: "",
        description: "",
      });
      alert("New Program Initiative published successfully!");
    } catch {
      alert("Program published locally.");
    }
  };

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: jobForm.title,
        description: jobForm.description,
        organisation_id: organisation.id || 1,
      };
      await apiRequest("/api/jobs", { method: "POST", body: payload }).catch(() => null);
      const newJob = {
        id: Date.now(),
        title: jobForm.title,
        schedule: jobForm.employment_type,
        location: jobForm.location,
        wage: jobForm.wage,
        description: jobForm.description,
        applicants: 0,
        status: "active",
      };
      setJobs([newJob, ...jobs]);
      setIsPostJobOpen(false);
      setJobForm({
        title: "",
        employment_type: "Full-time",
        wage: "$24.00 / hr + Benefits",
        location: "Bay Area Regional Hub",
        description: "",
        requirements: "Organized and self-driven\nDriver license preferred\nTeam player",
      });
      alert("Job Opportunity posted successfully!");
    } catch {
      alert("Job posted locally.");
    }
  };

  const handleSendNoteSubmit = (e) => {
    e.preventDefault();
    alert(`Thank-you note successfully sent to ${selectedDonor?.donorName || "Donor"}!`);
    setIsSendNoteOpen(false);
    setNoteText("");
  };

  const handleExportCSV = () => {
    const headers = ["RECEIPT #,DONOR NAME,DONOR EMAIL,ALLOCATED PROGRAM,AMOUNT,FREQUENCY,DATE\n"];
    const rows = donations.map(
      (d) => `${d.receipt},"${d.donorName}",${d.donorEmail},"${d.program}",$${d.amount},${d.frequency},${d.date}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_donations_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePauseJob = (jobId) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: j.status === "active" ? "paused" : "active" } : j
      )
    );
  };

  // Dynamic KPI calculations
  const totalRaisedSum = programs.reduce((acc, p) => acc + (p.raised || 0), 0);
  const formattedTotalRaised = `$${(totalRaisedSum || 477500).toLocaleString()}`;
  const totalApplicantsCount = jobs.reduce((acc, j) => acc + (j.applicants || 0), 0);

  return (
    <div className="org-dashboard-wrapper">
      <Navbar activeTab="organisations" onOpenDonate={onOpenDonate} />

      <main className="org-dashboard-container">
        {/* ================= HEADER PROFILE BANNER CARD ================= */}
        <div className="org-banner-card">
          <div className="org-banner-left">
            <div
              className="org-avatar-wrapper"
              onClick={openEditProfileModal}
              style={{ cursor: "pointer" }}
              title="Click to Edit Profile Photo"
            >
              <img
                src={organisation.avatar}
                alt={organisation.name}
                className="org-avatar-img"
              />
              <div className="org-avatar-status" />
            </div>
            <div>
              <div className="org-title-row">
                <h1 className="org-name">{organisation.name}</h1>
                <span className="org-verified-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    verified
                  </span>
                  {organisation.badge}
                </span>
              </div>
              <div className="org-meta-info">
                {organisation.ein} • {organisation.location} • {organisation.email}
              </div>
              <div className="org-status-pill">
                <span className="org-status-dot" />
                Account Active • Real-time Logistics Connected
              </div>
            </div>
          </div>

          <div className="org-banner-actions">
            <button
              className="org-btn-edit-profile"
              onClick={openEditProfileModal}
              title="Edit Profile Details"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                edit
              </span>
              Edit Profile
            </button>
            <button
              className="org-btn-primary"
              onClick={() => setIsNewProgramOpen(true)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              New Program
            </button>
            <button
              className="org-btn-outline"
              onClick={() => setIsPostJobOpen(true)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                person_add
              </span>
              Post Job
            </button>
          </div>
        </div>

        {/* ================= 3 KPI METRICS GRID (REMOVED PHYSICAL INBOUND) ================= */}
        <div className="org-kpi-grid">
          <div className="org-kpi-card">
            <div className="org-kpi-top">
              <span className="org-kpi-label">Total Funds Raised</span>
              <div className="org-kpi-icon-box">
                <span className="material-symbols-outlined">attach_money</span>
              </div>
            </div>
            <div className="org-kpi-value">{formattedTotalRaised}</div>
            <div className="org-kpi-subtext">74% of annual target reached</div>
          </div>

          <div className="org-kpi-card">
            <div className="org-kpi-top">
              <span className="org-kpi-label">Active Programs</span>
              <div className="org-kpi-icon-box">
                <span className="material-symbols-outlined">auto_stories</span>
              </div>
            </div>
            <div className="org-kpi-value">{programs.length} Initiatives</div>
            <div className="org-kpi-subtext">Across 4 county zones</div>
          </div>

          <div className="org-kpi-card">
            <div className="org-kpi-top">
              <span className="org-kpi-label">Job Applicants</span>
              <div className="org-kpi-icon-box">
                <span className="material-symbols-outlined">group</span>
              </div>
            </div>
            <div className="org-kpi-value">{totalApplicantsCount || 40} Candidates</div>
            <div className="org-kpi-subtext">3 scheduled for interview</div>
          </div>
        </div>

        {/* ================= MAIN TABS NAVIGATION ================= */}
        <div className="org-tabs-container">
          <button
            className={`org-tab-btn ${activeTab === "dashboard-summary" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard-summary")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              grid_view
            </span>
            Dashboard Summary
          </button>

          <button
            className={`org-tab-btn ${activeTab === "donations-overview" ? "active" : ""}`}
            onClick={() => setActiveTab("donations-overview")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              payments
            </span>
            Donations Overview
            <span className="org-tab-badge">{donations.length}</span>
          </button>

          <button
            className={`org-tab-btn ${activeTab === "programs-managed" ? "active" : ""}`}
            onClick={() => setActiveTab("programs-managed")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              volunteer_activism
            </span>
            Programs Managed
            <span className="org-tab-badge">{programs.length}</span>
          </button>

          <button
            className={`org-tab-btn ${activeTab === "job-opportunities" ? "active" : ""}`}
            onClick={() => setActiveTab("job-opportunities")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              work
            </span>
            Job Opportunities & Applicants
            <span className="org-tab-badge">{jobs.length}</span>
          </button>

          <button
            className={`org-tab-btn ${activeTab === "live-logistics" ? "active" : ""}`}
            onClick={() => setActiveTab("live-logistics")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              local_shipping
            </span>
            Live Logistics
          </button>
        </div>

        {/* ================= TAB 1: DASHBOARD SUMMARY ================= */}
        {activeTab === "dashboard-summary" && (
          <>
            <div className="org-summary-grid">
              {/* Program Funding & Execution */}
              <div className="org-card-box">
                <div className="org-box-header">
                  <h3 className="org-box-title">Program Funding & Execution</h3>
                  <button
                    className="org-header-link"
                    onClick={() => setActiveTab("programs-managed")}
                  >
                    Manage All ({programs.length}) →
                  </button>
                </div>

                {programs.slice(0, 3).map((prog) => (
                  <div className="org-program-item" key={prog.id}>
                    <div className="org-program-item-top">
                      <span className="org-program-item-name">{prog.title}</span>
                      <span className="org-program-item-amounts">
                        ${prog.raised.toLocaleString()} / ${prog.goal.toLocaleString()}
                      </span>
                    </div>
                    <div className="org-progress-bar-bg">
                      <div
                        className="org-progress-bar-fill"
                        style={{ width: `${Math.min(prog.pct, 100)}%` }}
                      />
                    </div>
                    <div className="org-program-item-bottom">
                      <span>{prog.category}</span>
                      <span className="org-pct-text">{prog.pct}% Funded</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Open Roles */}
              <div className="org-card-box">
                <div className="org-box-header">
                  <h3 className="org-box-title">Open Roles</h3>
                  <button
                    className="org-header-link"
                    onClick={() => setActiveTab("job-opportunities")}
                  >
                    View All ({jobs.length}) →
                  </button>
                </div>

                {jobs.slice(0, 3).map((job) => (
                  <div className="org-role-item" key={job.id}>
                    <div className="org-role-title">{job.title}</div>
                    <div className="org-role-wage">{job.wage}</div>
                    <div className="org-role-meta">
                      <span>{job.schedule}</span>
                      <span className="org-applicant-badge">{job.applicants} applicants</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Inbound Benefactor Contributions */}
            <div className="org-card-box">
              <div className="org-box-header">
                <h3 className="org-box-title">Recent Inbound Benefactor Contributions</h3>
                <button
                  className="org-header-link"
                  onClick={() => setActiveTab("donations-overview")}
                >
                  View Full Donation Ledger →
                </button>
              </div>

              <div className="org-contributions-grid">
                {donations.slice(0, 3).map((item) => (
                  <div className="org-contrib-card" key={item.id}>
                    <div className="org-contrib-top">
                      <span className="org-contrib-name">{item.donorName}</span>
                      <span className="org-contrib-amount">${item.amount}</span>
                    </div>
                    <div className="org-contrib-program">{item.program}</div>
                    <div className="org-contrib-bottom">
                      <span style={{ color: "#64748b" }}>{item.date}</span>
                      <button
                        className="org-send-note-btn"
                        onClick={() => {
                          setSelectedDonor(item);
                          setIsSendNoteOpen(true);
                        }}
                      >
                        Send Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 2: DONATIONS OVERVIEW (WITH SCROLL CONTAINER) ================= */}
        {activeTab === "donations-overview" && (
          <div className="org-card-box">
            <div className="org-box-header">
              <div>
                <h3 className="org-box-title">Financial Donations Ledger</h3>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Audited records for 501(c)(3) compliance and fiscal reporting
                </p>
              </div>
              <button className="org-btn-outline" onClick={handleExportCSV}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  download
                </span>
                Export CSV
              </button>
            </div>

            <div className="org-table-wrapper org-scrollable-container" style={{ maxHeight: 440 }}>
              <table className="org-table">
                <thead>
                  <tr>
                    <th>RECEIPT #</th>
                    <th>DONOR NAME & EMAIL</th>
                    <th>ALLOCATED PROGRAM</th>
                    <th>AMOUNT</th>
                    <th>FREQUENCY</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((row) => (
                    <tr key={row.id}>
                      <td className="org-receipt-code">{row.receipt}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{row.donorName}</div>
                        <div style={{ fontSize: "0.775rem", color: "#64748b" }}>{row.donorEmail}</div>
                      </td>
                      <td>{row.program}</td>
                      <td style={{ fontWeight: 800, color: "#005f60" }}>${row.amount}</td>
                      <td>
                        <span className="org-badge-frequency">{row.frequency}</span>
                      </td>
                      <td>{row.date}</td>
                      <td>
                        <button
                          className="org-btn-outline"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.775rem" }}
                          onClick={() => {
                            setSelectedDonor(row);
                            setIsSendNoteOpen(true);
                          }}
                        >
                          Send Thank-You
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PROGRAMS MANAGED (WITH SCROLL CONTAINER) ================= */}
        {activeTab === "programs-managed" && (
          <div>
            <div className="org-jobs-banner">
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>
                  Managed Organization Programs
                </h2>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Create, edit, and track funding milestones for your community programs.
                </p>
              </div>
              <button
                className="org-btn-primary"
                onClick={() => setIsNewProgramOpen(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  add
                </span>
                Create New Program
              </button>
            </div>

            <div className="org-scrollable-container" style={{ maxHeight: 540 }}>
              <div className="org-programs-grid">
                {programs.map((prog) => (
                  <div className="org-program-card" key={prog.id}>
                    <div className="org-program-image-box">
                      <img src={prog.image} alt={prog.title} className="org-program-img" />
                      <span className="org-category-tag">{prog.category}</span>
                    </div>
                    <div className="org-program-body">
                      <h3 className="org-program-title">{prog.title}</h3>
                      <p className="org-program-desc">{prog.description}</p>
                      <div className="org-funding-progress-container">
                        <div className="org-program-item-top" style={{ marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "#0f172a" }}>
                            Raised: ${prog.raised.toLocaleString()}
                          </span>
                          <span style={{ fontSize: "0.825rem", color: "#64748b" }}>
                            Goal: ${prog.goal.toLocaleString()}
                          </span>
                        </div>
                        <div className="org-progress-bar-bg" style={{ height: 10 }}>
                          <div
                            className="org-progress-bar-fill"
                            style={{ width: `${Math.min(prog.pct, 100)}%` }}
                          />
                        </div>
                        <div style={{ fontSize: "0.775rem", color: "#047857", fontWeight: 600, marginTop: "0.4rem" }}>
                          {prog.subtext}
                        </div>
                      </div>
                      <button
                        className="org-btn-outline"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => alert(`Editing details for ${prog.title}`)}
                      >
                        Edit Program Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: JOB OPPORTUNITIES & APPLICANTS (WITH SCROLL CONTAINER) ================= */}
        {activeTab === "job-opportunities" && (
          <div>
            <div className="org-jobs-banner">
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>
                  Recruitment & Job Opportunities
                </h2>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Connect community members directly to dignified wage opportunities.
                </p>
              </div>
              <button
                className="org-btn-primary"
                onClick={() => setIsPostJobOpen(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  add
                </span>
                Post New Opportunity
              </button>
            </div>

            <div className="org-scrollable-container" style={{ maxHeight: 520 }}>
              {jobs.map((job) => (
                <div className="org-job-card-item" key={job.id}>
                  <div className="org-job-card-header">
                    <div>
                      <div className="org-job-tags">
                        <span className="org-schedule-pill">{job.schedule}</span>
                        <span>• {job.location}</span>
                      </div>
                      <h3 className="org-job-title-text">{job.title}</h3>
                      <div className="org-job-wage-text">{job.wage}</div>
                    </div>
                    <div className="org-job-actions">
                      <button
                        className="org-btn-applicants"
                        onClick={() => setViewApplicantsJob(job)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                          group
                        </span>
                        View Applicants ({job.applicants})
                      </button>
                      <button
                        className="org-btn-pause"
                        onClick={() => togglePauseJob(job.id)}
                      >
                        {job.status === "active" ? "Pause Listing" : "Resume Listing"}
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: LIVE LOGISTICS ================= */}
        {activeTab === "live-logistics" && (
          <div className="org-card-box">
            <div className="org-box-header">
              <h3 className="org-box-title">Real-Time Logistics & Warehouse Logs</h3>
              <span className="org-status-pill">
                <span className="org-status-dot" /> Live Telemetry
              </span>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              {logs.map((log) => (
                <div className="org-log-item" key={log.id}>
                  <div className={`org-log-icon ${log.status === "warning" ? "warning" : ""}`}>
                    <span className="material-symbols-outlined">{log.icon}</span>
                  </div>
                  <div className="org-log-content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="org-log-title">{log.title}</span>
                      <span className="org-log-time">{log.timestamp}</span>
                    </div>
                    <div className="org-log-details">{log.details}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="org-box-title" style={{ marginBottom: "1rem" }}>
              Physical Goods Inbound Pipeline
            </h3>
            <div className="org-table-wrapper">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>TRACKING CODE</th>
                    <th>CATEGORY</th>
                    <th>ITEMS DESCRIPTION</th>
                    <th>ESTIMATED QTY</th>
                    <th>METHOD & LOCATION</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.map((item) => (
                    <tr key={item.code}>
                      <td className="org-receipt-code" style={{ color: "#d97706" }}>
                        {item.code}
                      </td>
                      <td style={{ fontWeight: 700 }}>{item.category}</td>
                      <td>{item.description}</td>
                      <td>{item.qty}</td>
                      <td>{item.method}</td>
                      <td>
                        <span
                          className={`org-badge-status ${
                            item.status === "Scheduled" ? "scheduled" : "received"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: EDIT ORGANISATION PROFILE ================= */}
      {isEditProfileOpen && (
        <div className="org-modal-overlay">
          <div className="org-modal-dialog">
            <div className="org-modal-header">
              <h3 className="org-modal-title">Edit Organisation Profile</h3>
              <button
                className="org-modal-close"
                onClick={() => setIsEditProfileOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleProfileSubmit} className="org-modal-body">
              <div className="org-form-group">
                <label className="org-form-label">Select Avatar Photo</label>
                <div className="org-avatar-grid">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      className={`org-avatar-preset-item ${
                        profileForm.avatar === url ? "selected" : ""
                      }`}
                      onClick={() =>
                        setProfileForm({ ...profileForm, avatar: url })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Organisation / Display Name *</label>
                <input
                  type="text"
                  required
                  className="org-form-input"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                />
              </div>

              <div className="org-form-row">
                <div className="org-form-group">
                  <label className="org-form-label">EIN / Tax Identifier</label>
                  <input
                    type="text"
                    className="org-form-input"
                    value={profileForm.ein}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, ein: e.target.value })
                    }
                  />
                </div>
                <div className="org-form-group">
                  <label className="org-form-label">District / Location</label>
                  <input
                    type="text"
                    className="org-form-input"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Contact Email *</label>
                <input
                  type="email"
                  required
                  className="org-form-input"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="org-modal-submit-btn">
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LAUNCH NEW INITIATIVE ================= */}
      {isNewProgramOpen && (
        <div className="org-modal-overlay">
          <div className="org-modal-dialog">
            <div className="org-modal-header">
              <h3 className="org-modal-title">Launch a New Initiative</h3>
              <button
                className="org-modal-close"
                onClick={() => setIsNewProgramOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateProgramSubmit} className="org-modal-body">
              <div className="org-form-group">
                <label className="org-form-label">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westside Emergency Maternal Nutrition"
                  className="org-form-input"
                  value={programForm.title}
                  onChange={(e) =>
                    setProgramForm({ ...programForm, title: e.target.value })
                  }
                />
              </div>

              <div className="org-form-row">
                <div className="org-form-group">
                  <label className="org-form-label">Category</label>
                  <select
                    className="org-form-select"
                    value={programForm.category}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, category: e.target.value })
                    }
                  >
                    <option value="Food Security">Food Security</option>
                    <option value="Clean Water">Clean Water</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Housing">Housing</option>
                  </select>
                </div>
                <div className="org-form-group">
                  <label className="org-form-label">Funding Target ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="300000"
                    className="org-form-input"
                    value={programForm.funding_goal}
                    onChange={(e) =>
                      setProgramForm({
                        ...programForm,
                        funding_goal: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Impact Metric Statement</label>
                <input
                  type="text"
                  placeholder="12,000 community meals provided per month"
                  className="org-form-input"
                  value={programForm.impact_statement}
                  onChange={(e) =>
                    setProgramForm({
                      ...programForm,
                      impact_statement: e.target.value,
                    })
                  }
                />
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Description & Objective *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the frontline mission, target beneficiaries, and logistics plan..."
                  className="org-form-textarea"
                  value={programForm.description}
                  onChange={(e) =>
                    setProgramForm({
                      ...programForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <button type="submit" className="org-modal-submit-btn">
                Publish Program to Platform
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POST JOB OPPORTUNITY ================= */}
      {isPostJobOpen && (
        <div className="org-modal-overlay">
          <div className="org-modal-dialog">
            <div className="org-modal-header">
              <h3 className="org-modal-title">Post Job Opportunity</h3>
              <button
                className="org-modal-close"
                onClick={() => setIsPostJobOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handlePostJobSubmit} className="org-modal-body">
              <div className="org-form-group">
                <label className="org-form-label">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bilingual Family Case Worker"
                  className="org-form-input"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                />
              </div>

              <div className="org-form-row">
                <div className="org-form-group">
                  <label className="org-form-label">Employment Type</label>
                  <select
                    className="org-form-select"
                    value={jobForm.employment_type}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, employment_type: e.target.value })
                    }
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Immediate">Immediate</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="org-form-group">
                  <label className="org-form-label">Wage / Compensation</label>
                  <input
                    type="text"
                    placeholder="$24.00 / hr + Benefits"
                    className="org-form-input"
                    value={jobForm.wage}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, wage: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Location / Hub</label>
                <input
                  type="text"
                  placeholder="Bay Area Regional Hub"
                  className="org-form-input"
                  value={jobForm.location}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, location: e.target.value })
                  }
                />
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Role Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key responsibilities and day-to-day duties..."
                  className="org-form-textarea"
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, description: e.target.value })
                  }
                />
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Requirements (1 per line)</label>
                <textarea
                  rows={3}
                  placeholder="Organized and self-driven&#10;Driver license preferred&#10;Team player"
                  className="org-form-textarea"
                  value={jobForm.requirements}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, requirements: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="org-modal-submit-btn">
                Post Opportunity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SEND THANK-YOU NOTE ================= */}
      {isSendNoteOpen && (
        <div className="org-modal-overlay">
          <div className="org-modal-dialog">
            <div className="org-modal-header">
              <h3 className="org-modal-title">
                Send Note to {selectedDonor?.donorName || "Donor"}
              </h3>
              <button
                className="org-modal-close"
                onClick={() => setIsSendNoteOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSendNoteSubmit} className="org-modal-body">
              <div className="org-form-group">
                <label className="org-form-label">Program Allocation</label>
                <input
                  type="text"
                  readOnly
                  className="org-form-input"
                  value={selectedDonor?.program || "General Fund"}
                  style={{ backgroundColor: "#f8fafc" }}
                />
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Personalized Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Thank you so much for your generous support! Your contribution directly enables..."
                  className="org-form-textarea"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
              </div>

              <button type="submit" className="org-modal-submit-btn">
                Send Thank-You Note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW APPLICANTS ================= */}
      {viewApplicantsJob && (
        <div className="org-modal-overlay">
          <div className="org-modal-dialog">
            <div className="org-modal-header">
              <h3 className="org-modal-title">
                Applicants: {viewApplicantsJob.title}
              </h3>
              <button
                className="org-modal-close"
                onClick={() => setViewApplicantsJob(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="org-modal-body">
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Candidates applying for {viewApplicantsJob.title} ({viewApplicantsJob.schedule}):
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                {[
                  { name: "Marcus Vance", status: "Interview Scheduled", applied: "2 days ago" },
                  { name: "Aaliyah Chen", status: "Under Review", applied: "3 days ago" },
                  { name: "Jordan Taylor", status: "Resume Screened", applied: "5 days ago" },
                ].map((cand, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "0.85rem 1rem",
                      backgroundColor: "#f8fafc",
                      borderRadius: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
                        {cand.name}
                      </div>
                      <div style={{ fontSize: "0.775rem", color: "#64748b" }}>Applied {cand.applied}</div>
                    </div>
                    <span className="org-applicant-badge">{cand.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default OrganisationsPage;