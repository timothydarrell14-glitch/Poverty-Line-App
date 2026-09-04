import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

import foodforwardImage from "../assets/foodforward.jpg";
import globalcareImage from "../assets/globalcare.jpg";
import heroSupportImage from "../assets/hero-support.jpg";
import organisationsHeroImage from "../assets/organisations-hero.jpg";

import { apiRequest } from "../api/client";
import {
  listOrganisations,
  createOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from "../api/organisations";

import {
  listPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../api/programs";

import { getCurrentUser } from "../utils/auth";

const INITIAL_LOGS = [
  {
    id: "log-1",
    title: "Shipment #402 delivered",
    timestamp: "12 mins ago",
    type: "delivery",
    status: "completed",
    details:
      "1,200 kg staple grains and pantry provisions received at Central Hub.",
  },
  {
    id: "log-2",
    title: "Low inventory alert: Pantry B",
    timestamp: "34 mins ago",
    type: "inventory",
    status: "warning",
    details:
      "Baby formula and dry legumes inventory under 15% threshold; replenishment triggered.",
  },
  {
    id: "log-3",
    title: "5 new volunteers onboarded",
    timestamp: "1 hour ago",
    type: "volunteer",
    status: "info",
    details:
      "Completed food safety and route-dispatch safety certification.",
  },
  {
    id: "log-4",
    title: "Route optimized for Zone A",
    timestamp: "2 hours ago",
    type: "route",
    status: "completed",
    details:
      "Dynamic routing reduced transit fuel expenditure by 18%.",
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "Integrating with Poverty Line's platform allowed us to reduce our resource wastage by 30% in the first quarter. The dashboard provides clarity in high-pressure situations.",
    author: "Sarah Jenkins",
    role: "Director of Operations",
    organization: "FoodForward",
    image: foodforwardImage,
  },
  {
    id: 2,
    quote:
      "The onboarding process was incredibly structured. We were able to sync our volunteer database within days and immediately saw an improvement in allocation efficiency.",
    author: "David Chen",
    role: "Community Lead",
    organization: "GlobalCare",
    image: globalcareImage,
  },
];

/* =========================================================
   JOB API HELPERS
   ========================================================= */

const listJobs = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  ).toString();

  return apiRequest(`/api/jobs${query ? `?${query}` : ""}`);
};

const createJob = (job) =>
  apiRequest("/api/jobs", {
    method: "POST",
    body: job,
  });

const updateJob = (jobId, changes) =>
  apiRequest(`/api/jobs/${jobId}`, {
    method: "PATCH",
    body: changes,
  });

const deleteJob = (jobId) =>
  apiRequest(`/api/jobs/${jobId}`, {
    method: "DELETE",
  });

/* =========================================================
   EMPTY FORMS
   ========================================================= */

const EMPTY_ORGANISATION = {
  name: "",
  organisation_type: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  location: "",
};

const EMPTY_PROGRAM = {
  name: "",
  description: "",
  category: "",
  location: "",
  eligibility: "",
  start_date: "",
  end_date: "",
};

const EMPTY_JOB = {
  title: "",
  description: "",
  requirements: "",
  minimum_education: "",
  experience: "",
  application_deadline: "",
};

export function OrganisationPortalPage({
  onOpenPartnerApplication,
  onOpenLiveSimulation,
  onOpenLogin,
  onOpenDonate,
}) {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [isSimulatingDispatch, setIsSimulatingDispatch] =
    useState(false);

  // Controls the active Navbar item
  const [activeTab, setActiveTab] = useState("organisations");

  /* =========================================================
     AUTH / ORGANISATION STATE
     ========================================================= */

  // Initialize directly instead of calling setState inside useEffect.
  const [currentUser] = useState(() => getCurrentUser());

  /*
   * The organisation array itself is not rendered anywhere
   * in this component. Only the setter is needed for CRUD
   * operations, so the state value is intentionally ignored.
   */
  const [, setOrganisations] = useState([]);

  const [selectedOrganisation, setSelectedOrganisation] =
    useState(null);

  const [organisationForm, setOrganisationForm] = useState(
    EMPTY_ORGANISATION
  );

  const [isOrganisationEditing, setIsOrganisationEditing] =
    useState(false);

  const [organisationLoading, setOrganisationLoading] =
    useState(false);

  const [organisationError, setOrganisationError] =
    useState("");

  /* =========================================================
     PROGRAM STATE
     ========================================================= */

  const [programs, setPrograms] = useState([]);
  const [programForm, setProgramForm] = useState(EMPTY_PROGRAM);

  const [editingProgramId, setEditingProgramId] =
    useState(null);

  const [programLoading, setProgramLoading] = useState(false);
  const [programError, setProgramError] = useState("");

  /* =========================================================
     JOB STATE
     ========================================================= */

  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState(EMPTY_JOB);

  const [editingJobId, setEditingJobId] = useState(null);

  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState("");

  /* =========================================================
     UI STATE
     ========================================================= */

  const [showManagement, setShowManagement] = useState(false);

  // Safe handlers in case these functions are not passed from App.jsx
  const handleOpenLogin = () => {
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  const chartData = {
    "7d": [
      { day: "Mon", height: "68%", value: "18.4K units" },
      { day: "Tue", height: "82%", value: "22.1K units" },
      { day: "Wed", height: "74%", value: "19.8K units" },
      { day: "Thu", height: "94%", value: "25.6K units" },
      { day: "Fri", height: "88%", value: "24.0K units" },
      { day: "Sat", height: "98%", value: "26.8K units" },
      { day: "Sun", height: "62%", value: "16.5K units" },
    ],

    "30d": [
      { day: "Wk 1", height: "72%", value: "88.2K units" },
      { day: "Wk 2", height: "86%", value: "104.5K units" },
      { day: "Wk 3", height: "91%", value: "112.0K units" },
      { day: "Wk 4", height: "95%", value: "118.4K units" },
    ],

    ytd: [
      { day: "Q1", height: "65%", value: "310K units" },
      { day: "Q2", height: "78%", value: "375K units" },
      { day: "Q3", height: "90%", value: "430K units" },
      { day: "Q4", height: "96%", value: "462K units" },
    ],
  };

  /* =========================================================
     LOAD ORGANISATIONS
     ========================================================= */

  useEffect(() => {
    const loadOrganisations = async () => {
      try {
        setOrganisationLoading(true);
        setOrganisationError("");

        const response = await listOrganisations();

        const organisationList = Array.isArray(response)
          ? response
          : response?.organisations ||
            response?.data ||
            [];

        setOrganisations(organisationList);

        /*
         * If the logged-in user contains an organisation id,
         * use it to select the organisation.
         */
        const user = getCurrentUser();

        const userOrganisationId =
          user?.organisation_id ??
          user?.organization_id ??
          user?.organisationId ??
          user?.organizationId;

        if (userOrganisationId) {
          const matchedOrganisation =
            organisationList.find(
              (organisation) =>
                String(
                  organisation.id ??
                    organisation.organisation_id
                ) === String(userOrganisationId)
            );

          if (matchedOrganisation) {
            setSelectedOrganisation(
              matchedOrganisation
            );

            setOrganisationForm({
              name: matchedOrganisation.name || "",
              organisation_type:
                matchedOrganisation.organisation_type ||
                "",
              description:
                matchedOrganisation.description ||
                "",
              email: matchedOrganisation.email || "",
              phone: matchedOrganisation.phone || "",
              website:
                matchedOrganisation.website || "",
              location:
                matchedOrganisation.location || "",
            });
          }
        }
      } catch (error) {
        console.error(
          "Failed to load organisations:",
          error
        );

        setOrganisationError(
          error.message ||
            "Failed to load organisations."
        );
      } finally {
        setOrganisationLoading(false);
      }
    };

    loadOrganisations();
  }, []);

  /* =========================================================
     LOAD PROGRAMS AND JOBS
     ========================================================= */

  useEffect(() => {
    /*
     * Do not synchronously call setPrograms/setJobs here.
     * The lint rule react-hooks/set-state-in-effect rejects
     * synchronous state updates directly inside an effect.
     */
    if (!selectedOrganisation?.id) {
      return;
    }

    const organisationId = selectedOrganisation.id;

    const loadProgramsAndJobs = async () => {
      try {
        setProgramLoading(true);
        setJobLoading(true);

        setProgramError("");
        setJobError("");

        const [programResponse, jobResponse] =
          await Promise.all([
            listPrograms({
              organisation_id: organisationId,
            }),
            listJobs({
              organisation_id: organisationId,
            }),
          ]);

        const programList = Array.isArray(
          programResponse
        )
          ? programResponse
          : programResponse?.programs ||
            programResponse?.data ||
            [];

        const jobList = Array.isArray(jobResponse)
          ? jobResponse
          : jobResponse?.jobs ||
            jobResponse?.data ||
            [];

        setPrograms(programList);
        setJobs(jobList);
      } catch (error) {
        console.error(
          "Failed to load organisation resources:",
          error
        );

        setProgramError(
          error.message ||
            "Failed to load programs."
        );

        setJobError(
          error.message ||
            "Failed to load jobs."
        );
      } finally {
        setProgramLoading(false);
        setJobLoading(false);
      }
    };

    loadProgramsAndJobs();
  }, [selectedOrganisation]);

  /* =========================================================
     ORGANISATION FORM HANDLERS
     ========================================================= */

  const handleOrganisationChange = (event) => {
    const { name, value } = event.target;

    setOrganisationForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleOrganisationSubmit = async (event) => {
    event.preventDefault();

    try {
      setOrganisationLoading(true);
      setOrganisationError("");

      if (selectedOrganisation?.id) {
        const response = await updateOrganisation(
          selectedOrganisation.id,
          organisationForm
        );

        const updatedOrganisation =
          response?.organisation ||
          response?.data ||
          response;

        setSelectedOrganisation(updatedOrganisation);

        setOrganisations((previous) =>
          previous.map((organisation) =>
            organisation.id === selectedOrganisation.id
              ? updatedOrganisation
              : organisation
          )
        );

        setIsOrganisationEditing(false);
      } else {
        const response = await createOrganisation(
          organisationForm
        );

        const newOrganisation =
          response?.organisation ||
          response?.data ||
          response;

        setSelectedOrganisation(newOrganisation);

        setOrganisations((previous) => [
          ...previous,
          newOrganisation,
        ]);

        setIsOrganisationEditing(false);
      }
    } catch (error) {
      console.error(
        "Failed to save organisation:",
        error
      );

      setOrganisationError(
        error.message ||
          "Failed to save organisation."
      );
    } finally {
      setOrganisationLoading(false);
    }
  };

  const handleDeleteOrganisation = async () => {
    if (!selectedOrganisation?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this organisation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setOrganisationLoading(true);
      setOrganisationError("");

      await deleteOrganisation(selectedOrganisation.id);

      setOrganisations((previous) =>
        previous.filter(
          (organisation) =>
            organisation.id !== selectedOrganisation.id
        )
      );

      setSelectedOrganisation(null);
      setOrganisationForm(EMPTY_ORGANISATION);
      setPrograms([]);
      setJobs([]);
    } catch (error) {
      console.error(
        "Failed to delete organisation:",
        error
      );

      setOrganisationError(
        error.message ||
          "Failed to delete organisation."
      );
    } finally {
      setOrganisationLoading(false);
    }
  };

  /* =========================================================
     PROGRAM FORM HANDLERS
     ========================================================= */

  const handleProgramChange = (event) => {
    const { name, value } = event.target;

    setProgramForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetProgramForm = () => {
    setProgramForm(EMPTY_PROGRAM);
    setEditingProgramId(null);
    setProgramError("");
  };

  const handleProgramSubmit = async (event) => {
    event.preventDefault();

    if (!selectedOrganisation?.id) {
      setProgramError(
        "Please select or create an organisation first."
      );
      return;
    }

    try {
      setProgramLoading(true);
      setProgramError("");

      if (editingProgramId) {
        const response = await updateProgram(
          editingProgramId,
          programForm
        );

        const updatedProgram =
          response?.program ||
          response?.data ||
          response;

        setPrograms((previous) =>
          previous.map((program) =>
            program.id === editingProgramId
              ? updatedProgram
              : program
          )
        );
      } else {
        const response = await createProgram({
          ...programForm,
          organisation_id: selectedOrganisation.id,
        });

        const newProgram =
          response?.program ||
          response?.data ||
          response;

        setPrograms((previous) => [
          newProgram,
          ...previous,
        ]);
      }

      resetProgramForm();
    } catch (error) {
      console.error(
        "Failed to save program:",
        error
      );

      setProgramError(
        error.message ||
          "Failed to save program."
      );
    } finally {
      setProgramLoading(false);
    }
  };

  const handleEditProgram = (program) => {
    setEditingProgramId(program.id);

    setProgramForm({
      name: program.name || "",
      description: program.description || "",
      category: program.category || "",
      location: program.location || "",
      eligibility: program.eligibility || "",
      start_date: program.start_date
        ? String(program.start_date).slice(0, 10)
        : "",
      end_date: program.end_date
        ? String(program.end_date).slice(0, 10)
        : "",
    });

    document
      .getElementById("organisation-management")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const handleDeleteProgram = async (programId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this program?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProgramLoading(true);
      setProgramError("");

      await deleteProgram(programId);

      setPrograms((previous) =>
        previous.filter(
          (program) => program.id !== programId
        )
      );

      if (editingProgramId === programId) {
        resetProgramForm();
      }
    } catch (error) {
      console.error(
        "Failed to delete program:",
        error
      );

      setProgramError(
        error.message ||
          "Failed to delete program."
      );
    } finally {
      setProgramLoading(false);
    }
  };

  /* =========================================================
     JOB FORM HANDLERS
     ========================================================= */

  const handleJobChange = (event) => {
    const { name, value } = event.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetJobForm = () => {
    setJobForm(EMPTY_JOB);
    setEditingJobId(null);
    setJobError("");
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();

    if (!selectedOrganisation?.id) {
      setJobError(
        "Please select or create an organisation first."
      );
      return;
    }

    try {
      setJobLoading(true);
      setJobError("");

      if (editingJobId) {
        const response = await updateJob(
          editingJobId,
          jobForm
        );

        const updatedJob =
          response?.job ||
          response?.data ||
          response;

        setJobs((previous) =>
          previous.map((job) =>
            job.id === editingJobId
              ? updatedJob
              : job
          )
        );
      } else {
        const response = await createJob({
          ...jobForm,
          organisation_id: selectedOrganisation.id,
        });

        const newJob =
          response?.job ||
          response?.data ||
          response;

        setJobs((previous) => [
          newJob,
          ...previous,
        ]);
      }

      resetJobForm();
    } catch (error) {
      console.error(
        "Failed to save job:",
        error
      );

      setJobError(
        error.message ||
          "Failed to save job."
      );
    } finally {
      setJobLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJobId(job.id);

    setJobForm({
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
      minimum_education:
        job.minimum_education || "",
      experience: job.experience || "",
      application_deadline: job.application_deadline
        ? String(job.application_deadline).slice(0, 10)
        : "",
    });

    document
      .getElementById("organisation-management")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job opportunity?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setJobLoading(true);
      setJobError("");

      await deleteJob(jobId);

      setJobs((previous) =>
        previous.filter((job) => job.id !== jobId)
      );

      if (editingJobId === jobId) {
        resetJobForm();
      }
    } catch (error) {
      console.error(
        "Failed to delete job:",
        error
      );

      setJobError(
        error.message ||
          "Failed to delete job."
      );
    } finally {
      setJobLoading(false);
    }
  };

  /* =========================================================
     SIMULATED LOG ENTRY
     ========================================================= */

  const handleSimulateNewEntry = () => {
    setIsSimulatingDispatch(true);

    setTimeout(() => {
      const newEntry = {
        id: `log-${Date.now()}`,
        title: `Dispatch #${Math.floor(
          405 + Math.random() * 50
        )} completed`,
        timestamp: "Just now",
        type: "delivery",
        status: "completed",
        details:
          "850 nutrition packs successfully routed to East Community Shelter.",
      };

      setLogs((previousLogs) => [
        newEntry,
        ...previousLogs,
      ]);

      setIsSimulatingDispatch(false);
    }, 600);
  };

  /* =========================================================
     DASHBOARD PREVIEW
     ========================================================= */

  const handleDashboardPreview = () => {
    const element = document.getElementById(
      "command-center-preview"
    );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================================================
     MANAGEMENT TOGGLE
     ========================================================= */

  const handleOpenManagement = () => {
    setShowManagement((previous) => !previous);

    setTimeout(() => {
      document
        .getElementById("organisation-management")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={handleOpenLogin}
      />

      <main className="organisations-page">
        {/* ================= HERO ================= */}
        <section className="org-hero">
          <div className="org-container org-hero-grid">
            <div className="org-hero-content">
              <div className="org-eyebrow">
                <span className="material-symbols-outlined">
                  hub
                </span>
                Institutional Logistics Network
              </div>

              <h1 className="org-hero-title">
                Amplify Your Impact.
                <br />
                <span>Streamline Operations.</span>
              </h1>

              <p className="org-hero-description">
                Connect your non-profit, NGO, or community
                initiative with our open logistics
                infrastructure. Coordinate resources,
                volunteers, and distribution in real-time.
              </p>

              <div className="org-hero-actions">
                <button
                  type="button"
                  className="org-primary-button"
                  id="org-hero-partner-btn"
                  onClick={onOpenPartnerApplication}
                >
                  <span>Become a Partner</span>

                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>

                <button
                  type="button"
                  className="org-secondary-button"
                  id="org-hero-preview-btn"
                  onClick={handleDashboardPreview}
                >
                  View Dashboard Preview
                </button>

                <button
                  type="button"
                  className="org-secondary-button"
                  onClick={onOpenDonate}
                >
                  <span className="material-symbols-outlined">
                    volunteer_activism
                  </span>
                  Donate
                </button>

                <button
                  type="button"
                  className="org-secondary-button"
                  onClick={handleOpenManagement}
                >
                  <span className="material-symbols-outlined">
                    dashboard_customize
                  </span>
                  Manage Organisation
                </button>
              </div>
            </div>

            <div className="org-hero-image-wrapper">
              <img
                src={organisationsHeroImage}
                alt="Nonprofit director coordinating distribution and routes on tablet"
                className="org-hero-image"
              />
            </div>
          </div>
        </section>

        {/* ================= HOW WE PARTNER ================= */}
        <section className="org-section">
          <div className="org-container">
            <div className="org-partner-section">
              <div className="org-section-heading">
                <h2>How We Partner</h2>

                <p>
                  Our simple three-step integration allows
                  organizations of any size to onboard quickly
                  without disrupting existing ground
                  operations.
                </p>
              </div>

              <div className="org-steps-grid">
                <article className="org-step-card">
                  <div className="org-step-number">1</div>

                  <h3>
                    Application &amp; Verification
                  </h3>

                  <p>
                    Submit your organization's mission,
                    service area, and non-profit credentials
                    for our streamlined 48-hour
                    verification.
                  </p>
                </article>

                <article className="org-step-card">
                  <div className="org-step-number">2</div>

                  <h3>System Integration</h3>

                  <p>
                    Connect your existing supply
                    inventories, warehouse hubs, and
                    volunteer rosters into our centralized
                    dashboard.
                  </p>
                </article>

                <article className="org-step-card">
                  <div className="org-step-number">3</div>

                  <h3>
                    Impact Tracking &amp; Delivery
                  </h3>

                  <p>
                    Deploy optimized delivery routes,
                    receive donor support transparently,
                    and track verified impact in
                    real-time.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ORGANISATION MANAGEMENT
            ===================================================== */}

        {showManagement && (
          <section
            id="organisation-management"
            className="org-section"
          >
            <div className="org-container">
              <div className="org-section-heading">
                <p className="org-small-heading">
                  Organisation Dashboard
                </p>

                <h2>
                  Manage Your Organisation
                </h2>

                <p>
                  Create, update, view and manage your
                  organisation's programs and job
                  opportunities.
                </p>
              </div>

              {/* ================= ORGANISATION ================= */}

              <article className="org-stat-card">
                <div className="org-card-heading">
                  <div>
                    <h3>
                      Organisation Details
                    </h3>

                    <p>
                      Logged in as{" "}
                      {currentUser?.email ||
                        currentUser?.username ||
                        "organisation user"}
                    </p>
                  </div>
                </div>

                {organisationError && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      background: "#fee2e2",
                      color: "#991b1b",
                    }}
                  >
                    {organisationError}
                  </div>
                )}

                {selectedOrganisation && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      background: "#ecfdf5",
                      color: "#065f46",
                    }}
                  >
                    Managing:{" "}
                    <strong>
                      {selectedOrganisation.name}
                    </strong>
                  </div>
                )}

                <form
                  onSubmit={handleOrganisationSubmit}
                  style={{
                    display: "grid",
                    gap: "1rem",
                  }}
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Organisation name"
                    value={organisationForm.name}
                    onChange={handleOrganisationChange}
                    required
                  />

                  <input
                    type="text"
                    name="organisation_type"
                    placeholder="Organisation type"
                    value={
                      organisationForm.organisation_type
                    }
                    onChange={handleOrganisationChange}
                  />

                  <textarea
                    name="description"
                    placeholder="Description"
                    value={
                      organisationForm.description
                    }
                    onChange={handleOrganisationChange}
                    rows="4"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Organisation email"
                    value={organisationForm.email}
                    onChange={handleOrganisationChange}
                    required
                  />

                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={organisationForm.phone}
                    onChange={handleOrganisationChange}
                  />

                  <input
                    type="url"
                    name="website"
                    placeholder="Website"
                    value={organisationForm.website}
                    onChange={handleOrganisationChange}
                  />

                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={organisationForm.location}
                    onChange={handleOrganisationChange}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="submit"
                      className="org-dashboard-button org-dark-button"
                      disabled={organisationLoading}
                    >
                      {organisationLoading
                        ? "Saving..."
                        : selectedOrganisation
                        ? "Update Organisation"
                        : "Create Organisation"}
                    </button>

                    {selectedOrganisation && (
                      <>
                        <button
                          type="button"
                          className="org-dashboard-button org-light-button"
                          onClick={() => {
                            setIsOrganisationEditing(
                              !isOrganisationEditing
                            );
                          }}
                        >
                          {isOrganisationEditing
                            ? "Cancel Editing"
                            : "Edit Details"}
                        </button>

                        <button
                          type="button"
                          className="org-dashboard-button"
                          onClick={
                            handleDeleteOrganisation
                          }
                        >
                          Delete Organisation
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </article>

              {/* ================= PROGRAMS ================= */}

              <article
                className="org-efficiency-card"
                style={{ marginTop: "1.5rem" }}
              >
                <div className="org-card-heading">
                  <div>
                    <h3>
                      Programs
                    </h3>

                    <p>
                      Create and manage your organisation's
                      programs.
                    </p>
                  </div>
                </div>

                {programError && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      background: "#fee2e2",
                      color: "#991b1b",
                    }}
                  >
                    {programError}
                  </div>
                )}

                <form
                  onSubmit={handleProgramSubmit}
                  style={{
                    display: "grid",
                    gap: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  <h4>
                    {editingProgramId
                      ? "Update Program"
                      : "Create Program"}
                  </h4>

                  <input
                    type="text"
                    name="name"
                    placeholder="Program name"
                    value={programForm.name}
                    onChange={handleProgramChange}
                    required
                  />

                  <textarea
                    name="description"
                    placeholder="Program description"
                    value={
                      programForm.description
                    }
                    onChange={handleProgramChange}
                    rows="4"
                    required
                  />

                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={programForm.category}
                    onChange={handleProgramChange}
                  />

                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={programForm.location}
                    onChange={handleProgramChange}
                  />

                  <textarea
                    name="eligibility"
                    placeholder="Eligibility requirements"
                    value={
                      programForm.eligibility
                    }
                    onChange={handleProgramChange}
                    rows="3"
                  />

                  <label>
                    Start Date
                    <input
                      type="date"
                      name="start_date"
                      value={programForm.start_date}
                      onChange={handleProgramChange}
                    />
                  </label>

                  <label>
                    End Date
                    <input
                      type="date"
                      name="end_date"
                      value={programForm.end_date}
                      onChange={handleProgramChange}
                    />
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="submit"
                      className="org-dashboard-button org-dark-button"
                      disabled={
                        programLoading ||
                        !selectedOrganisation
                      }
                    >
                      {programLoading
                        ? "Saving..."
                        : editingProgramId
                        ? "Update Program"
                        : "Create Program"}
                    </button>

                    {editingProgramId && (
                      <button
                        type="button"
                        className="org-dashboard-button org-light-button"
                        onClick={resetProgramForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div
                  style={{
                    display: "grid",
                    gap: "1rem",
                  }}
                >
                  <h4>
                    Existing Programs
                  </h4>

                  {programLoading &&
                    programs.length === 0 && (
                      <p>Loading programs...</p>
                    )}

                  {!programLoading &&
                    programs.length === 0 && (
                      <p>
                        No programs found for this
                        organisation.
                      </p>
                    )}

                  {programs.map((program) => (
                    <div
                      key={program.id}
                      style={{
                        padding: "1rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                      }}
                    >
                      <h4>
                        {program.name}
                      </h4>

                      <p>
                        {program.description}
                      </p>

                      {program.category && (
                        <p>
                          <strong>
                            Category:
                          </strong>{" "}
                          {program.category}
                        </p>
                      )}

                      {program.location && (
                        <p>
                          <strong>
                            Location:
                          </strong>{" "}
                          {program.location}
                        </p>
                      )}

                      {program.eligibility && (
                        <p>
                          <strong>
                            Eligibility:
                          </strong>{" "}
                          {program.eligibility}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                          marginTop: "1rem",
                        }}
                      >
                        <button
                          type="button"
                          className="org-dashboard-button org-light-button"
                          onClick={() =>
                            handleEditProgram(
                              program
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="org-dashboard-button"
                          onClick={() =>
                            handleDeleteProgram(
                              program.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* ================= JOBS ================= */}

              <article
                className="org-efficiency-card"
                style={{ marginTop: "1.5rem" }}
              >
                <div className="org-card-heading">
                  <div>
                    <h3>
                      Job Opportunities
                    </h3>

                    <p>
                      Create and manage job opportunities
                      for your organisation.
                    </p>
                  </div>
                </div>

                {jobError && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      background: "#fee2e2",
                      color: "#991b1b",
                    }}
                  >
                    {jobError}
                  </div>
                )}

                <form
                  onSubmit={handleJobSubmit}
                  style={{
                    display: "grid",
                    gap: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  <h4>
                    {editingJobId
                      ? "Update Job Opportunity"
                      : "Create Job Opportunity"}
                  </h4>

                  <input
                    type="text"
                    name="title"
                    placeholder="Job title"
                    value={jobForm.title}
                    onChange={handleJobChange}
                    required
                  />

                  <textarea
                    name="description"
                    placeholder="Job description"
                    value={
                      jobForm.description
                    }
                    onChange={handleJobChange}
                    rows="4"
                    required
                  />

                  <textarea
                    name="requirements"
                    placeholder="Requirements"
                    value={
                      jobForm.requirements
                    }
                    onChange={handleJobChange}
                    rows="4"
                  />

                  <input
                    type="text"
                    name="minimum_education"
                    placeholder="Minimum education"
                    value={
                      jobForm.minimum_education
                    }
                    onChange={handleJobChange}
                  />

                  <input
                    type="text"
                    name="experience"
                    placeholder="Experience"
                    value={jobForm.experience}
                    onChange={handleJobChange}
                  />

                  <label>
                    Application Deadline
                    <input
                      type="date"
                      name="application_deadline"
                      value={
                        jobForm.application_deadline
                      }
                      onChange={handleJobChange}
                    />
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="submit"
                      className="org-dashboard-button org-dark-button"
                      disabled={
                        jobLoading ||
                        !selectedOrganisation
                      }
                    >
                      {jobLoading
                        ? "Saving..."
                        : editingJobId
                        ? "Update Job"
                        : "Create Job"}
                    </button>

                    {editingJobId && (
                      <button
                        type="button"
                        className="org-dashboard-button org-light-button"
                        onClick={resetJobForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div
                  style={{
                    display: "grid",
                    gap: "1rem",
                  }}
                >
                  <h4>
                    Existing Job Opportunities
                  </h4>

                  {jobLoading &&
                    jobs.length === 0 && (
                      <p>Loading jobs...</p>
                    )}

                  {!jobLoading &&
                    jobs.length === 0 && (
                      <p>
                        No job opportunities found for
                        this organisation.
                      </p>
                    )}

                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      style={{
                        padding: "1rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                      }}
                    >
                      <h4>
                        {job.title}
                      </h4>

                      <p>
                        {job.description}
                      </p>

                      {job.requirements && (
                        <p>
                          <strong>
                            Requirements:
                          </strong>{" "}
                          {job.requirements}
                        </p>
                      )}

                      {job.minimum_education && (
                        <p>
                          <strong>
                            Minimum education:
                          </strong>{" "}
                          {job.minimum_education}
                        </p>
                      )}

                      {job.experience && (
                        <p>
                          <strong>
                            Experience:
                          </strong>{" "}
                          {job.experience}
                        </p>
                      )}

                      {job.application_deadline && (
                        <p>
                          <strong>
                            Application deadline:
                          </strong>{" "}
                          {String(
                            job.application_deadline
                          ).slice(0, 10)}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                          marginTop: "1rem",
                        }}
                      >
                        <button
                          type="button"
                          className="org-dashboard-button org-light-button"
                          onClick={() =>
                            handleEditJob(job)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="org-dashboard-button"
                          onClick={() =>
                            handleDeleteJob(
                              job.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        )}

        {/* ================= COMMAND CENTER ================= */}
        <section
          id="command-center-preview"
          className="org-section org-command-section"
        >
          <div className="org-container">
            <div className="org-command-header">
              <div>
                <div className="org-live-label">
                  <span className="org-live-dot"></span>
                  Live Operational Telemetry
                </div>

                <h2>
                  Partner Command Center
                </h2>
              </div>

              <div className="org-command-actions">
                <button
                  type="button"
                  className="org-dashboard-button org-light-button"
                  id="simulate-dispatch-btn"
                  onClick={
                    handleSimulateNewEntry
                  }
                  disabled={
                    isSimulatingDispatch
                  }
                >
                  <span className="material-symbols-outlined">
                    bolt
                  </span>

                  <span>
                    {isSimulatingDispatch
                      ? "Simulating..."
                      : "Simulate Live Dispatch"}
                  </span>
                </button>

                <button
                  type="button"
                  className="org-dashboard-button org-dark-button"
                  onClick={
                    onOpenLiveSimulation
                  }
                >
                  <span>
                    Explore Full System
                  </span>

                  <span className="material-symbols-outlined">
                    open_in_new
                  </span>
                </button>
              </div>
            </div>

            <div className="org-dashboard-grid">
              {/* STAT CARD 1 */}
              <article className="org-stat-card">
                <div className="org-stat-top">
                  <div>
                    <p>
                      Total Resources
                      Distributed (YTD)
                    </p>

                    <h3>
                      142,500{" "}
                      <span>units</span>
                    </h3>
                  </div>

                  <div className="org-stat-icon teal-icon">
                    <span className="material-symbols-outlined">
                      inventory_2
                    </span>
                  </div>
                </div>

                <div className="org-stat-footer success-text">
                  <span className="material-symbols-outlined">
                    trending_up
                  </span>

                  <span>
                    +12% compared to last
                    quarter
                  </span>
                </div>
              </article>

              {/* STAT CARD 2 */}
              <article className="org-stat-card">
                <div className="org-stat-top">
                  <div>
                    <p>
                      Active Volunteers
                    </p>

                    <h3>
                      342{" "}
                      <span>on duty</span>
                    </h3>
                  </div>

                  <div className="org-stat-icon green-icon">
                    <span className="material-symbols-outlined">
                      group
                    </span>
                  </div>
                </div>

                <div className="org-stat-footer">
                  <span>
                    Capacity utilization:
                    86%
                  </span>

                  <strong>
                    24 teams deployed
                  </strong>
                </div>
              </article>

              {/* STAT CARD 3 */}
              <article className="org-stat-card">
                <div className="org-stat-top">
                  <div>
                    <p>
                      Pending Requests
                    </p>

                    <h3 className="warning-number">
                      48{" "}
                      <span>queues</span>
                    </h3>
                  </div>

                  <div className="org-stat-icon warning-icon">
                    <span className="material-symbols-outlined">
                      schedule
                    </span>
                  </div>
                </div>

                <div className="org-stat-footer warning-text">
                  <span className="material-symbols-outlined">
                    priority_high
                  </span>

                  <span>
                    All requests triaged
                    under 4 hours
                  </span>
                </div>
              </article>

              {/* DISTRIBUTION EFFICIENCY */}
              <article className="org-efficiency-card">
                <div className="org-card-heading">
                  <div>
                    <h3>
                      Distribution
                      Efficiency
                    </h3>

                    <p>
                      Weekly throughput
                      across regional
                      distribution centers
                    </p>
                  </div>

                  <div className="org-timeframe-selector">
                    {[
                      "7d",
                      "30d",
                      "ytd",
                    ].map(
                      (timeframe) => (
                        <button
                          type="button"
                          key={timeframe}
                          className={
                            selectedTimeframe ===
                            timeframe
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setSelectedTimeframe(
                              timeframe
                            )
                          }
                        >
                          {timeframe ===
                          "7d"
                            ? "7 Days"
                            : timeframe ===
                              "30d"
                            ? "30 Days"
                            : "YTD"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="org-chart">
                  {chartData[
                    selectedTimeframe
                  ].map(
                    (item, index) => (
                      <div
                        className="org-chart-column"
                        key={index}
                      >
                        <div className="org-chart-value">
                          {item.value}
                        </div>

                        <div className="org-bar-wrapper">
                          <div
                            className="org-bar"
                            style={{
                              height:
                                item.height,
                            }}
                          ></div>
                        </div>

                        <span>
                          {item.day}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="org-efficiency-footer">
                  <span>
                    Average Delivery Route
                    Time:{" "}
                    <strong>
                      42 minutes
                    </strong>
                  </span>

                  <strong className="success-text">
                    98.4% On-Time
                    Delivery Rate
                  </strong>
                </div>
              </article>

              {/* RECENT LOGISTICS LOG */}
              <article className="org-log-card">
                <div className="org-log-header">
                  <h3>
                    Recent Logistics
                    Log
                  </h3>

                  <span>
                    Live Feed
                  </span>
                </div>

                <div className="org-log-list">
                  {logs.map((log) => {
                    let icon =
                      "local_shipping";
                    let statusClass =
                      "delivery";

                    if (
                      log.status ===
                      "warning"
                    ) {
                      icon =
                        "warning";
                      statusClass =
                        "warning";
                    } else if (
                      log.status ===
                      "info"
                    ) {
                      icon =
                        "person_add";
                      statusClass =
                        "info";
                    } else if (
                      log.type ===
                      "route"
                    ) {
                      icon =
                        "alt_route";
                      statusClass =
                        "route";
                    }

                    return (
                      <div
                        className="org-log-item"
                        key={log.id}
                      >
                        <div className="org-log-item-top">
                          <span className="org-log-title">
                            <span
                              className={`org-log-icon ${statusClass}`}
                            >
                              <span className="material-symbols-outlined">
                                {
                                  icon
                                }
                              </span>
                            </span>

                            {
                              log.title
                            }
                          </span>

                          <span className="org-log-time">
                            {
                              log.timestamp
                            }
                          </span>
                        </div>

                        {log.details && (
                          <p>
                            {
                              log.details
                            }
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="org-api-button"
                  onClick={
                    onOpenPartnerApplication
                  }
                >
                  Connect your warehouse API
                  →
                </button>
              </article>
            </div>
          </div>
        </section>

        {/* ================= TRUSTED ORGANIZATIONS ================= */}
        <section className="org-section">
          <div className="org-container">
            <div className="org-trusted-section">
              <div className="org-section-heading">
                <p className="org-small-heading">
                  Proven Field Collaboration
                </p>

                <h2>
                  Trusted by Leading
                  Organizations
                </h2>
              </div>

              <div className="org-partner-logos">
                <div>
                  <span className="material-symbols-outlined">
                    public
                  </span>
                  GlobalCare
                </div>

                <div>
                  <span className="material-symbols-outlined">
                    medical_information
                  </span>
                  HealthNet
                </div>

                <div>
                  <span className="material-symbols-outlined">
                    eco
                  </span>
                  FoodForward
                </div>

                <div>
                  <span className="material-symbols-outlined">
                    cottage
                  </span>
                  ShelterOrg
                </div>
              </div>

              {/* TESTIMONIALS */}
              <div className="org-testimonials">
                {TESTIMONIALS.map(
                  (testimonial) => (
                    <article
                      className="org-testimonial-card"
                      key={testimonial.id}
                    >
                      <div className="org-testimonial-content">
                        <span className="material-symbols-outlined org-quote-icon">
                          format_quote
                        </span>

                        <p>
                          "
                          {
                            testimonial.quote
                          }
                          "
                        </p>
                      </div>

                      <div className="org-testimonial-person">
                        <img
                          src={
                            testimonial.image
                          }
                          alt={
                            testimonial.author
                          }
                        />

                        <div>
                          <h4>
                            {
                              testimonial.author
                            }
                          </h4>

                          <p>
                            {
                              testimonial.role
                            }
                            ,{" "}
                            <strong>
                              {
                                testimonial.organization
                              }
                            </strong>
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Hidden image references are intentionally not displayed. */}
        <div
          className="org-image-preload"
          aria-hidden="true"
        >
          <img
            src={heroSupportImage}
            alt=""
          />
        </div>
      </main>
    </>
  );
}

export default OrganisationPortalPage;