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

/*
 * Applicant endpoint.
 *
 * If your backend exposes a different applicant endpoint,
 * this is the only helper that needs to be changed.
 */
const listJobApplicants = (jobId) =>
  apiRequest(`/api/jobs/${jobId}/applications`);

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

/*
 * These fields support the program model while keeping
 * compatibility with the existing frontend where possible.
 */
const EMPTY_PROGRAM = {
  name: "",
  description: "",
  category: "",
  location: "",
  eligibility: "",
  start_date: "",
  end_date: "",
  funding_goal: "",
  progress_target: "",
  progress_value: "",
  progress_unit: "%",
};

const EMPTY_JOB = {
  title: "",
  description: "",
  requirements: "",
  minimum_education: "",
  experience: "",
  application_deadline: "",
};

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

const getOrganisationId = (organisation) =>
  organisation?.id ??
  organisation?.organisation_id ??
  organisation?.organization_id ??
  null;

const getProgramId = (program) =>
  program?.id ??
  program?.program_id ??
  null;

const getJobId = (job) =>
  job?.id ??
  job?.job_id ??
  null;

const isOrganisationApproved = (organisation) =>
  Boolean(
    organisation &&
      (
        organisation.verified === true ||
        organisation.verified === 1 ||
        organisation.verified === "true" ||
        organisation.status === "approved"
      )
  );

const getResponseList = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const getProgramTitle = (program) =>
  program?.title ||
  program?.name ||
  "Untitled Program";

const getProgramDescription = (program) =>
  program?.description ||
  program?.summary ||
  program?.long_description ||
  "";

const getProgramCategory = (program) =>
  program?.type ||
  program?.program_kind ||
  program?.category ||
  "";

const getApplicantStatus = (application) =>
  String(
    application?.status ||
      application?.application_status ||
      "pending"
  ).toLowerCase();

const getApplicantName = (application) =>
  application?.user?.name ||
  application?.user?.full_name ||
  application?.name ||
  application?.full_name ||
  application?.username ||
  application?.email ||
  "Applicant";

/* =========================================================
   COMPONENT
   ========================================================= */

function Organisations({
  onOpenPartnerApplication,
  onOpenLiveSimulation,
  onOpenLogin,
  onOpenDonate,
}) {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState("7d");

  const [isSimulatingDispatch, setIsSimulatingDispatch] =
    useState(false);

  // Controls the active Navbar item
  const [activeTab, setActiveTab] =
    useState("organisations");

  /* =========================================================
     AUTH / ORGANISATION STATE
     ========================================================= */

  const [currentUser, setCurrentUser] = useState(
    () => getCurrentUser()
  );

  const [, setOrganisations] = useState([]);

  const [selectedOrganisation, setSelectedOrganisation] =
    useState(null);

  const [organisationForm, setOrganisationForm] =
    useState(EMPTY_ORGANISATION);

  const [isOrganisationEditing, setIsOrganisationEditing] =
    useState(false);

  const [organisationLoading, setOrganisationLoading] =
    useState(false);

  const [organisationError, setOrganisationError] =
    useState("");

  /* =========================================================
     PARTNER DASHBOARD STATE
     ========================================================= */

  const [partnerDashboardTab, setPartnerDashboardTab] =
    useState("organisation");

  const [showPartnerDashboard, setShowPartnerDashboard] =
    useState(false);

  /* =========================================================
     PROGRAM STATE
     ========================================================= */

  const [programs, setPrograms] = useState([]);

  const [programForm, setProgramForm] =
    useState(EMPTY_PROGRAM);

  const [editingProgramId, setEditingProgramId] =
    useState(null);

  const [programLoading, setProgramLoading] =
    useState(false);

  const [programError, setProgramError] =
    useState("");

  const [showProgramModal, setShowProgramModal] =
    useState(false);

  /* =========================================================
     JOB STATE
     ========================================================= */

  const [jobs, setJobs] = useState([]);

  const [jobForm, setJobForm] =
    useState(EMPTY_JOB);

  const [editingJobId, setEditingJobId] =
    useState(null);

  const [jobLoading, setJobLoading] =
    useState(false);

  const [jobError, setJobError] =
    useState("");

  const [showJobModal, setShowJobModal] =
    useState(false);

  /* =========================================================
     APPLICANTS
     ========================================================= */

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [jobApplicants, setJobApplicants] =
    useState([]);

  const [applicantLoading, setApplicantLoading] =
    useState(false);

  const [applicantError, setApplicantError] =
    useState("");

  const [showApplicantCards, setShowApplicantCards] =
    useState(false);

  /* =========================================================
     NOTIFICATIONS
     ========================================================= */

  const [notifications, setNotifications] =
    useState([]);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [notificationError, setNotificationError] =
    useState("");

  const [showNotifications, setShowNotifications] =
    useState(false);

  /* =========================================================
     UI STATE
     ========================================================= */

  const [showManagement, setShowManagement] =
    useState(false);

  /* =========================================================
     AUTH ROLE CHECK
     ========================================================= */

  const isLoggedIn = Boolean(currentUser);

  const userRole = String(
    currentUser?.role || ""
  )
    .trim()
    .toLowerCase();

  const isPartner = userRole === "partner";

  const hasApprovedOrganisation =
    isOrganisationApproved(selectedOrganisation);

  const hasPendingOrganisation =
    Boolean(
      selectedOrganisation &&
        !hasApprovedOrganisation
    );

  /* =========================================================
     AUTH CHANGE LISTENER
     ========================================================= */

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener(
      "povertyline-auth-change",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "povertyline-auth-change",
        handleAuthChange
      );
    };
  }, []);

  /* =========================================================
     SAFE LOGIN HANDLER
     ========================================================= */

  const handleOpenLogin = () => {
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  /* =========================================================
     CHART DATA
     ========================================================= */

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

        const organisationList =
          getResponseList(response, [
            "organisations",
            "organizations",
          ]);

        setOrganisations(organisationList);

        const user = getCurrentUser();

        const userOrganisationId =
          user?.organisation_id ??
          user?.organization_id ??
          user?.organisationId ??
          user?.organizationId;

        if (userOrganisationId) {
          let matchedOrganisation =
            organisationList.find(
              (organisation) =>
                String(
                  getOrganisationId(
                    organisation
                  )
                ) ===
                String(userOrganisationId)
            );

          /*
           * If the organisation is not in the public list,
           * try loading it directly. This allows the owner
           * to see the pending status of their own request.
           */
          if (!matchedOrganisation) {
            try {
              const directResponse =
                await apiRequest(
                  `/api/organisations/${userOrganisationId}`
                );

              matchedOrganisation =
                directResponse?.organisation ||
                directResponse?.data ||
                directResponse;
            } catch (directError) {
              console.warn(
                "Could not load user's organisation directly:",
                directError
              );
            }
          }

          if (matchedOrganisation) {
            setSelectedOrganisation(
              matchedOrganisation
            );

            setOrganisationForm({
              name:
                matchedOrganisation.name || "",
              organisation_type:
                matchedOrganisation.organisation_type ||
                matchedOrganisation.organization_type ||
                "",
              description:
                matchedOrganisation.description ||
                "",
              email:
                matchedOrganisation.email || "",
              phone:
                matchedOrganisation.phone || "",
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
    const organisationId =
      getOrganisationId(
        selectedOrganisation
      );

    /*
     * Programs and jobs are only available to an approved
     * organisation.
     */
    if (
      !organisationId ||
      !hasApprovedOrganisation ||
      !isLoggedIn ||
      !isPartner
    ) {
      return;
    }

    const loadProgramsAndJobs = async () => {
      try {
        setProgramLoading(true);
        setJobLoading(true);

        setProgramError("");
        setJobError("");

        const [
          programResponse,
          jobResponse,
        ] = await Promise.all([
          listPrograms({
            organisation_id: organisationId,
          }),
          listJobs({
            organisation_id: organisationId,
          }),
        ]);

        const programList =
          getResponseList(programResponse, [
            "programs",
          ]);

        const jobList =
          getResponseList(jobResponse, [
            "jobs",
          ]);

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
  }, [
    selectedOrganisation,
    hasApprovedOrganisation,
    isLoggedIn,
    isPartner,
  ]);

  /* =========================================================
     LOAD NOTIFICATIONS
     ========================================================= */

  const loadNotifications = async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    try {
      setNotificationLoading(true);
      setNotificationError("");

      const response =
        await apiRequest("/notifications");

      const notificationList =
        getResponseList(response, [
          "notifications",
        ]);

      setNotifications(notificationList);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotificationError(
        error.message ||
          "Failed to load notifications."
      );
    } finally {
      setNotificationLoading(false);
    }
  };


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

/*
 * Applicant endpoint.
 *
 * If your backend exposes a different applicant endpoint,
 * this is the only helper that needs to be changed.
 */
const listJobApplicants = (jobId) =>
  apiRequest(`/api/jobs/${jobId}/applications`);

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

/*
 * These fields support the program model while keeping
 * compatibility with the existing frontend where possible.
 */
const EMPTY_PROGRAM = {
  name: "",
  description: "",
  category: "",
  location: "",
  eligibility: "",
  start_date: "",
  end_date: "",
  funding_goal: "",
  progress_target: "",
  progress_value: "",
  progress_unit: "%",
};

const EMPTY_JOB = {
  title: "",
  description: "",
  requirements: "",
  minimum_education: "",
  experience: "",
  application_deadline: "",
};

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

const getOrganisationId = (organisation) =>
  organisation?.id ??
  organisation?.organisation_id ??
  organisation?.organization_id ??
  null;

const getProgramId = (program) =>
  program?.id ??
  program?.program_id ??
  null;

const getJobId = (job) =>
  job?.id ??
  job?.job_id ??
  null;

const isOrganisationApproved = (organisation) =>
  Boolean(
    organisation &&
      (
        organisation.verified === true ||
        organisation.verified === 1 ||
        organisation.verified === "true" ||
        organisation.status === "approved"
      )
  );

const getResponseList = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const getProgramTitle = (program) =>
  program?.title ||
  program?.name ||
  "Untitled Program";

const getProgramDescription = (program) =>
  program?.description ||
  program?.summary ||
  program?.long_description ||
  "";

const getProgramCategory = (program) =>
  program?.type ||
  program?.program_kind ||
  program?.category ||
  "";

const getApplicantStatus = (application) =>
  String(
    application?.status ||
      application?.application_status ||
      "pending"
  ).toLowerCase();

const getApplicantName = (application) =>
  application?.user?.name ||
  application?.user?.full_name ||
  application?.name ||
  application?.full_name ||
  application?.username ||
  application?.email ||
  "Applicant";

/* =========================================================
   COMPONENT
   ========================================================= */

function Organisations({
  onOpenPartnerApplication,
  onOpenLiveSimulation,
  onOpenLogin,
  onOpenDonate,
}) {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState("7d");

  const [isSimulatingDispatch, setIsSimulatingDispatch] =
    useState(false);

  // Controls the active Navbar item
  const [activeTab, setActiveTab] =
    useState("organisations");

  /* =========================================================
     AUTH / ORGANISATION STATE
     ========================================================= */

  const [currentUser, setCurrentUser] = useState(
    () => getCurrentUser()
  );

  const [, setOrganisations] = useState([]);

  const [selectedOrganisation, setSelectedOrganisation] =
    useState(null);

  const [organisationForm, setOrganisationForm] =
    useState(EMPTY_ORGANISATION);

  const [isOrganisationEditing, setIsOrganisationEditing] =
    useState(false);

  const [organisationLoading, setOrganisationLoading] =
    useState(false);

  const [organisationError, setOrganisationError] =
    useState("");

  /* =========================================================
     PARTNER DASHBOARD STATE
     ========================================================= */

  const [partnerDashboardTab, setPartnerDashboardTab] =
    useState("organisation");

  const [showPartnerDashboard, setShowPartnerDashboard] =
    useState(false);

  /* =========================================================
     PROGRAM STATE
     ========================================================= */

  const [programs, setPrograms] = useState([]);

  const [programForm, setProgramForm] =
    useState(EMPTY_PROGRAM);

  const [editingProgramId, setEditingProgramId] =
    useState(null);

  const [programLoading, setProgramLoading] =
    useState(false);

  const [programError, setProgramError] =
    useState("");

  const [showProgramModal, setShowProgramModal] =
    useState(false);

  /* =========================================================
     JOB STATE
     ========================================================= */

  const [jobs, setJobs] = useState([]);

  const [jobForm, setJobForm] =
    useState(EMPTY_JOB);

  const [editingJobId, setEditingJobId] =
    useState(null);

  const [jobLoading, setJobLoading] =
    useState(false);

  const [jobError, setJobError] =
    useState("");

  const [showJobModal, setShowJobModal] =
    useState(false);

  /* =========================================================
     APPLICANTS
     ========================================================= */

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [jobApplicants, setJobApplicants] =
    useState([]);

  const [applicantLoading, setApplicantLoading] =
    useState(false);

  const [applicantError, setApplicantError] =
    useState("");

  const [showApplicantCards, setShowApplicantCards] =
    useState(false);

  /* =========================================================
     NOTIFICATIONS
     ========================================================= */

  const [notifications, setNotifications] =
    useState([]);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [notificationError, setNotificationError] =
    useState("");

  const [showNotifications, setShowNotifications] =
    useState(false);

  /* =========================================================
     UI STATE
     ========================================================= */

  const [showManagement, setShowManagement] =
    useState(false);

  /* =========================================================
     AUTH ROLE CHECK
     ========================================================= */

  const isLoggedIn = Boolean(currentUser);

  const userRole = String(
    currentUser?.role || ""
  )
    .trim()
    .toLowerCase();

  const isPartner = userRole === "partner";

  const hasApprovedOrganisation =
    isOrganisationApproved(selectedOrganisation);

  const hasPendingOrganisation =
    Boolean(
      selectedOrganisation &&
        !hasApprovedOrganisation
    );

  /* =========================================================
     AUTH CHANGE LISTENER
     ========================================================= */

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener(
      "povertyline-auth-change",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "povertyline-auth-change",
        handleAuthChange
      );
    };
  }, []);

  /* =========================================================
     SAFE LOGIN HANDLER
     ========================================================= */

  const handleOpenLogin = () => {
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  /* =========================================================
     CHART DATA
     ========================================================= */

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

        const organisationList =
          getResponseList(response, [
            "organisations",
            "organizations",
          ]);

        setOrganisations(organisationList);

        const user = getCurrentUser();

        const userOrganisationId =
          user?.organisation_id ??
          user?.organization_id ??
          user?.organisationId ??
          user?.organizationId;

        if (userOrganisationId) {
          let matchedOrganisation =
            organisationList.find(
              (organisation) =>
                String(
                  getOrganisationId(
                    organisation
                  )
                ) ===
                String(userOrganisationId)
            );

          /*
           * If the organisation is not in the public list,
           * try loading it directly. This allows the owner
           * to see the pending status of their own request.
           */
          if (!matchedOrganisation) {
            try {
              const directResponse =
                await apiRequest(
                  `/api/organisations/${userOrganisationId}`
                );

              matchedOrganisation =
                directResponse?.organisation ||
                directResponse?.data ||
                directResponse;
            } catch (directError) {
              console.warn(
                "Could not load user's organisation directly:",
                directError
              );
            }
          }

          if (matchedOrganisation) {
            setSelectedOrganisation(
              matchedOrganisation
            );

            setOrganisationForm({
              name:
                matchedOrganisation.name || "",
              organisation_type:
                matchedOrganisation.organisation_type ||
                matchedOrganisation.organization_type ||
                "",
              description:
                matchedOrganisation.description ||
                "",
              email:
                matchedOrganisation.email || "",
              phone:
                matchedOrganisation.phone || "",
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
    const organisationId =
      getOrganisationId(
        selectedOrganisation
      );

    /*
     * Programs and jobs are only available to an approved
     * organisation.
     */
    if (
      !organisationId ||
      !hasApprovedOrganisation ||
      !isLoggedIn ||
      !isPartner
    ) {
      return;
    }

    const loadProgramsAndJobs = async () => {
      try {
        setProgramLoading(true);
        setJobLoading(true);

        setProgramError("");
        setJobError("");

        const [
          programResponse,
          jobResponse,
        ] = await Promise.all([
          listPrograms({
            organisation_id: organisationId,
          }),
          listJobs({
            organisation_id: organisationId,
          }),
        ]);

        const programList =
          getResponseList(programResponse, [
            "programs",
          ]);

        const jobList =
          getResponseList(jobResponse, [
            "jobs",
          ]);

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
  }, [
    selectedOrganisation,
    hasApprovedOrganisation,
    isLoggedIn,
    isPartner,
  ]);

  /* =========================================================
     LOAD NOTIFICATIONS
     ========================================================= */

  const loadNotifications = async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    try {
      setNotificationLoading(true);
      setNotificationError("");

      const response =
        await apiRequest("/notifications");

      const notificationList =
        getResponseList(response, [
          "notifications",
        ]);

      setNotifications(notificationList);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotificationError(
        error.message ||
          "Failed to load notifications."
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    loadNotifications();

    /*
     * Refresh notifications periodically so that new
     * application and milestone notifications appear
     * without requiring a full page refresh.
     */
    const notificationInterval =
      window.setInterval(() => {
        loadNotifications();
      }, 30000);

    return () => {
      window.clearInterval(
        notificationInterval
      );
    };
  }, [isLoggedIn]);

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

  const handleOrganisationSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!isLoggedIn) {
      handleOpenLogin();
      return;
    }

    try {
      setOrganisationLoading(true);
      setOrganisationError("");

      if (
        selectedOrganisation &&
        getOrganisationId(
          selectedOrganisation
        )
      ) {
        const organisationId =
          getOrganisationId(
            selectedOrganisation
          );

        const response =
          await updateOrganisation(
            organisationId,
            organisationForm
          );

        const updatedOrganisation =
          response?.organisation ||
          response?.organization ||
          response?.data ||
          response;

        setSelectedOrganisation(
          updatedOrganisation
        );

        setOrganisations((previous) =>
          previous.map(
            (organisation) =>
              String(
                getOrganisationId(
                  organisation
                )
              ) === String(organisationId)
                ? updatedOrganisation
                : organisation
          )
        );

        setIsOrganisationEditing(false);
      } else {
        /*
         * The normal create endpoint creates the organisation
         * as unverified. Therefore this request is treated as
         * a pending admin approval request.
         */
        const response =
          await createOrganisation(
            organisationForm
          );

        const newOrganisation =
          response?.organisation ||
          response?.organization ||
          response?.data ||
          response;

        setSelectedOrganisation(
          newOrganisation
        );

        /*
         * Do not add an unverified organisation to the
         * public organisation list.
         */
        if (
          isOrganisationApproved(
            newOrganisation
          )
        ) {
          setOrganisations((previous) => [
            ...previous,
            newOrganisation,
          ]);
        }

        setIsOrganisationEditing(false);

        setOrganisationForm({
          name:
            newOrganisation.name || "",
          organisation_type:
            newOrganisation.organisation_type ||
            "",
          description:
            newOrganisation.description ||
            "",
          email:
            newOrganisation.email || "",
          phone:
            newOrganisation.phone || "",
          website:
            newOrganisation.website || "",
          location:
            newOrganisation.location || "",
        });
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
    const organisationId =
      getOrganisationId(
        selectedOrganisation
      );

    if (!organisationId) {
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

      await deleteOrganisation(
        organisationId
      );

      setOrganisations((previous) =>
        previous.filter(
          (organisation) =>
            String(
              getOrganisationId(
                organisation
              )
            ) !== String(organisationId)
        )
      );

      setSelectedOrganisation(null);
      setOrganisationForm(
        EMPTY_ORGANISATION
      );
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
     PROGRAM MODAL
     ========================================================= */

  const openCreateProgramModal = () => {
    if (!isLoggedIn) {
      handleOpenLogin();
      return;
    }

    if (!isPartner) {
      setProgramError(
        "Only partner accounts can manage programs."
      );
      return;
    }

    if (!hasApprovedOrganisation) {
      setProgramError(
        "Your organisation must be approved by an administrator before you can create programs."
      );
      return;
    }

    setEditingProgramId(null);
    setProgramForm(
      EMPTY_PROGRAM
    );
    setProgramError("");
    setShowProgramModal(true);
  };

  const closeProgramModal = () => {
    if (programLoading) {
      return;
    }

    setShowProgramModal(false);
    setEditingProgramId(null);
    setProgramForm(
      EMPTY_PROGRAM
    );
    setProgramError("");
  };

  const handleProgramChange = (event) => {
    const { name, value } = event.target;

    setProgramForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetProgramForm = () => {
    setProgramForm(
      EMPTY_PROGRAM
    );
    setEditingProgramId(null);
    setProgramError("");
    setShowProgramModal(false);
  };

  const handleProgramSubmit = async (
    event
  ) => {
    event.preventDefault();

    const organisationId =
      getOrganisationId(
        selectedOrganisation
      );

    if (!organisationId) {
      setProgramError(
        "Please create an organisation first."
      );
      return;
    }

    if (!hasApprovedOrganisation) {
      setProgramError(
        "Your organisation is still waiting for admin approval."
      );
      return;
    }

    try {
      setProgramLoading(true);
      setProgramError("");

      /*
       * Map the existing frontend fields to the backend
       * program fields while keeping the existing form.
       */
      const programPayload = {
        title:
          programForm.name,
        summary:
          programForm.description,
        description:
          programForm.description,
        type:
          programForm.category,
        program_kind:
          programForm.category,
        location:
          programForm.location,
        organisation_id:
          organisationId,
      };

      if (
        programForm.funding_goal !== ""
      ) {
        programPayload.funding_goal =
          Number(
            programForm.funding_goal
          );
      }

      if (
        programForm.progress_target !== ""
      ) {
        programPayload.progress_target =
          Number(
            programForm.progress_target
          );
      }

      if (
        programForm.progress_value !== ""
      ) {
        programPayload.progress_value =
          Number(
            programForm.progress_value
          );
      }

      if (
        programForm.progress_unit
      ) {
        programPayload.progress_unit =
          programForm.progress_unit;
      }

      if (editingProgramId) {
        const response =
          await updateProgram(
            editingProgramId,
            programPayload
          );

        const updatedProgram =
          response?.program ||
          response?.data ||
          response;

        setPrograms((previous) =>
          previous.map((program) =>
            String(
              getProgramId(program)
            ) ===
            String(editingProgramId)
              ? updatedProgram
              : program
          )
        );
      } else {
        const response =
          await createProgram(
            programPayload
          );

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

  const handleEditProgram = (
    program
  ) => {
    if (!hasApprovedOrganisation) {
      setProgramError(
        "Your organisation must be approved before programs can be edited."
      );
      return;
    }

    setEditingProgramId(
      getProgramId(program)
    );

    setProgramForm({
      name:
        program?.title ||
        program?.name ||
        "",
      description:
        program?.description ||
        program?.summary ||
        program?.long_description ||
        "",
      category:
        program?.type ||
        program?.program_kind ||
        program?.category ||
        "",
      location:
        program?.location || "",
      eligibility:
        program?.eligibility || "",
      start_date:
        program?.start_date
          ? String(
              program.start_date
            ).slice(0, 10)
          : "",
      end_date:
        program?.end_date
          ? String(
              program.end_date
            ).slice(0, 10)
          : "",
      funding_goal:
        program?.funding_goal ??
        "",
      progress_target:
        program?.progress_target ??
        "",
      progress_value:
        program?.progress_value ??
        "",
      progress_unit:
        program?.progress_unit ||
        "%",
    });

    setProgramError("");
    setShowProgramModal(true);
  };

  const handleDeleteProgram = async (
    programId
  ) => {
    if (!hasApprovedOrganisation) {
      setProgramError(
        "Your organisation must be approved before programs can be deleted."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this program?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProgramLoading(true);
      setProgramError("");

      await deleteProgram(
        programId
      );

      setPrograms((previous) =>
        previous.filter(
          (program) =>
            String(
              getProgramId(program)
            ) !== String(programId)
        )
      );

      if (
        String(editingProgramId) ===
        String(programId)
      ) {
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
     JOB MODAL
     ========================================================= */

  const openCreateJobModal = () => {
    if (!isLoggedIn) {
      handleOpenLogin();
      return;
    }

    if (!isPartner) {
      setJobError(
        "Only partner accounts can manage job opportunities."
      );
      return;
    }

    if (!hasApprovedOrganisation) {
      setJobError(
        "Your organisation must be approved by an administrator before you can create job opportunities."
      );
      return;
    }

    setEditingJobId(null);
    setJobForm(
      EMPTY_JOB
    );
    setJobError("");
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    if (jobLoading) {
      return;
    }

    setShowJobModal(false);
    setEditingJobId(null);
    setJobForm(
      EMPTY_JOB
    );
    setJobError("");
  };

  const handleJobChange = (event) => {
    const { name, value } = event.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetJobForm = () => {
    setJobForm(
      EMPTY_JOB
    );
    setEditingJobId(null);
    setJobError("");
    setShowJobModal(false);
  };

  const handleJobSubmit = async (
    event
  ) => {
    event.preventDefault();

    const organisationId =
      getOrganisationId(
        selectedOrganisation
      );

    if (!organisationId) {
      setJobError(
        "Please create an organisation first."
      );
      return;
    }

    if (!hasApprovedOrganisation) {
      setJobError(
        "Your organisation is still waiting for admin approval."
      );
      return;
    }

    try {
      setJobLoading(true);
      setJobError("");

      const jobPayload = {
        ...jobForm,
        organisation_id:
          organisationId,
      };

      if (editingJobId) {
        const response =
          await updateJob(
            editingJobId,
            jobPayload
          );

        const updatedJob =
          response?.job ||
          response?.data ||
          response;

        setJobs((previous) =>
          previous.map((job) =>
            String(
              getJobId(job)
            ) ===
            String(editingJobId)
              ? updatedJob
              : job
          )
        );
      } else {
        const response =
          await createJob(
            jobPayload
          );

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
    if (!hasApprovedOrganisation) {
      setJobError(
        "Your organisation must be approved before jobs can be edited."
      );
      return;
    }

    setEditingJobId(
      getJobId(job)
    );

    setJobForm({
      title:
        job?.title || "",
      description:
        job?.description || "",
      requirements:
        job?.requirements || "",
      minimum_education:
        job?.minimum_education ||
        "",
      experience:
        job?.experience || "",
      application_deadline:
        job?.application_deadline
          ? String(
              job.application_deadline
            ).slice(0, 10)
          : "",
    });

    setJobError("");
    setShowJobModal(true);
  };

  const handleDeleteJob = async (
    jobId
  ) => {
    if (!hasApprovedOrganisation) {
      setJobError(
        "Your organisation must be approved before jobs can be deleted."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this job opportunity?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setJobLoading(true);
      setJobError("");

      await deleteJob(
        jobId
      );

      setJobs((previous) =>
        previous.filter(
          (job) =>
            String(
              getJobId(job)
            ) !== String(jobId)
        )
      );

      if (
        String(editingJobId) ===
        String(jobId)
      ) {
        resetJobForm();
      }

      if (
        String(
          getJobId(selectedJob)
        ) === String(jobId)
      ) {
        setSelectedJob(null);
        setJobApplicants([]);
        setShowApplicantCards(false);
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
     JOB APPLICANTS
     ========================================================= */

  const handleViewApplicants = async (
    job
  ) => {
    const jobId =
      getJobId(job);

    if (!jobId) {
      return;
    }

    setSelectedJob(job);
    setShowApplicantCards(true);
    setApplicantLoading(true);
    setApplicantError("");
    setJobApplicants([]);

    try {
      const response =
        await listJobApplicants(
          jobId
        );

      const applicants =
        getResponseList(
          response,
          [
            "applications",
            "applicants",
          ]
        );

      setJobApplicants(
        applicants
      );
    } catch (error) {
      console.error(
        "Failed to load job applicants:",
        error
      );

      /*
       * The UI remains functional even if the applicant
       * endpoint is not yet available in the backend.
       */
      if (
        error?.status === 404
      ) {
        setApplicantError(
          "Applicant details are not available from the current API yet."
        );
      } else if (
        error?.status === 401 ||
        error?.status === 403
      ) {
        setApplicantError(
          "You do not have permission to view these applicants."
        );
      } else {
        setApplicantError(
          error.message ||
            "Failed to load applicants."
        );
      }
    } finally {
      setApplicantLoading(false);
    }
  };

  const closeApplicantCards = () => {
    setShowApplicantCards(false);
    setSelectedJob(null);
    setJobApplicants([]);
    setApplicantError("");
  };

  const getApplicantStatistics = () => {
    const total =
      jobApplicants.length;

    const pending =
      jobApplicants.filter(
        (application) =>
          [
            "pending",
            "submitted",
            "new",
          ].includes(
            getApplicantStatus(
              application
            )
          )
      ).length;

    const accepted =
      jobApplicants.filter(
        (application) =>
          [
            "accepted",
            "approved",
            "hired",
          ].includes(
            getApplicantStatus(
              application
            )
          )
      ).length;

    const rejected =
      jobApplicants.filter(
        (application) =>
          [
            "rejected",
            "declined",
          ].includes(
            getApplicantStatus(
              application
            )
          )
      ).length;

    const reviewing =
      jobApplicants.filter(
        (application) =>
          [
            "reviewing",
            "shortlisted",
            "under_review",
          ].includes(
            getApplicantStatus(
              application
            )
          )
      ).length;

    return {
      total,
      pending,
      reviewing,
      accepted,
      rejected,
    };
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
    const element =
      document.getElementById(
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
    if (!isLoggedIn) {
      handleOpenLogin();
      return;
    }

    setShowManagement(
      (previous) => !previous
    );

    setTimeout(() => {
      document
        .getElementById(
          "organisation-management"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /* =========================================================
     PARTNER DASHBOARD
     ========================================================= */

  const handleOpenPartnerDashboard = () => {
    if (!isLoggedIn) {
      handleOpenLogin();
      return;
    }

    if (!isPartner) {
      setOrganisationError(
        "The Partner Dashboard is only available to partner accounts."
      );
      return;
    }

    if (!hasApprovedOrganisation) {
      setOrganisationError(
        "Your organisation must be approved before the Partner Dashboard becomes available."
      );
      return;
    }

    setShowPartnerDashboard(true);
    setPartnerDashboardTab(
      "organisation"
    );

    setTimeout(() => {
      document
        .getElementById(
          "partner-dashboard"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /* =========================================================
     NOTIFICATION HELPERS
     ========================================================= */

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.is_read
    );

  const getNotificationIcon = (
    notification
  ) => {
    const type = String(
      notification?.type || ""
    ).toLowerCase();

    if (
      type.includes("job") ||
      type.includes("application")
    ) {
      return "work";
    }

    if (
      type.includes("milestone") ||
      type.includes("funding")
    ) {
      return "trending_up";
    }

    if (
      type.includes("partner") ||
      type.includes("organisation") ||
      type.includes("organization")
    ) {
      return "business";
    }

    return "notifications";
  };

  /* =========================================================
     MODAL STYLES
     ========================================================= */

  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    overflowY: "auto",
  };

  const modalStyle = {
    width: "100%",
    maxWidth: "680px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "1.5rem",
    boxShadow:
      "0 25px 60px rgba(15, 23, 42, 0.25)",
  };

  const modalHeaderStyle = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1.25rem",
  };

  const modalCloseStyle = {
    border: "none",
    background: "#f1f5f9",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const modalFieldStyle = {
    display: "grid",
    gap: "0.4rem",
  };

  const modalInputStyle = {
    width: "100%",
    padding: "0.8rem 0.9rem",
    border: "1px solid #dbe3ea",
    borderRadius: "10px",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
  };

  const modalTextareaStyle = {
    ...modalInputStyle,
    resize: "vertical",
    minHeight: "100px",
  };

  const dashboardNavButtonStyle = (
    active
  ) => ({
    border: "none",
    cursor: "pointer",
    padding:
      "0.7rem 1rem",
    borderRadius: "9px",
    background: active
      ? "#0f172a"
      : "#f1f5f9",
    color: active
      ? "#ffffff"
      : "#334155",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
  });

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
                <span>
                  Streamline Operations.
                </span>
              </h1>

              <p className="org-hero-description">
                Connect your non-profit, NGO, or
                community initiative with our open
                logistics infrastructure. Coordinate
                resources, volunteers, and distribution
                in real-time.
              </p>

              <div className="org-hero-actions">
                <button
                  type="button"
                  className="org-primary-button"
                  id="org-hero-partner-btn"
                  onClick={
                    onOpenPartnerApplication
                  }
                >
                  <span>
                    Become a Partner
                  </span>

                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>

                <button
                  type="button"
                  className="org-secondary-button"
                  id="org-hero-preview-btn"
                  onClick={
                    handleDashboardPreview
                  }
                >
                  View Dashboard Preview
                </button>

                {/* DONATE - LOGIN ONLY */}

                {isLoggedIn && (
                  <button
                    type="button"
                    className="org-secondary-button"
                    onClick={
                      onOpenDonate
                    }
                  >
                    <span className="material-symbols-outlined">
                      volunteer_activism
                    </span>
                    Donate
                  </button>
                )}

                {/* MANAGE - LOGIN ONLY */}

                {isLoggedIn && (
                  <button
                    type="button"
                    className="org-secondary-button"
                    onClick={
                      handleOpenManagement
                    }
                  >
                    <span className="material-symbols-outlined">
                      dashboard_customize
                    </span>
                    Manage Organisation
                  </button>
                )}

                {/* PARTNER DASHBOARD */}

                {isLoggedIn &&
                  isPartner &&
                  hasApprovedOrganisation && (
                    <button
                      type="button"
                      className="org-primary-button"
                      onClick={
                        handleOpenPartnerDashboard
                      }
                    >
                      <span className="material-symbols-outlined">
                        dashboard
                      </span>

                      <span>
                        Partner Dashboard
                      </span>
                    </button>
                  )}
              </div>
            </div>

            <div className="org-hero-image-wrapper">
              <img
                src={
                  organisationsHeroImage
                }
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
                <h2>
                  How We Partner
                </h2>

                <p>
                  Our simple three-step integration
                  allows organizations of any size to
                  onboard quickly without disrupting
                  existing ground operations.
                </p>
              </div>

              <div className="org-steps-grid">
                <article className="org-step-card">
                  <div className="org-step-number">
                    1
                  </div>

                  <h3>
                    Application &amp; Verification
                  </h3>

                  <p>
                    Submit your organization's mission,
                    service area, and non-profit
                    credentials for our streamlined
                    48-hour verification.
                  </p>
                </article>

                <article className="org-step-card">
                  <div className="org-step-number">
                    2
                  </div>

                  <h3>
                    System Integration
                  </h3>

                  <p>
                    Connect your existing supply
                    inventories, warehouse hubs, and
                    volunteer rosters into our
                    centralized dashboard.
                  </p>
                </article>

                <article className="org-step-card">
                  <div className="org-step-number">
                    3
                  </div>

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
            PENDING ORGANISATION REQUEST
            ===================================================== */}

        {isLoggedIn &&
          hasPendingOrganisation && (
            <section className="org-section">
              <div className="org-container">
                <article
                  className="org-stat-card"
                  style={{
                    border:
                      "1px solid #fbbf24",
                    background:
                      "#fffbeb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems:
                        "flex-start",
                    }}
                  >
                    <div
                      className="org-stat-icon warning-icon"
                    >
                      <span className="material-symbols-outlined">
                        hourglass_top
                      </span>
                    </div>

                    <div>
                      <h3
                        style={{
                          marginTop: 0,
                        }}
                      >
                        Organisation Request
                        Pending Approval
                      </h3>

                      <p>
                        Your organisation request for{" "}
                        <strong>
                          {
                            selectedOrganisation?.name
                          }
                        </strong>{" "}
                        has been submitted to the
                        administrator.
                      </p>

                      <p>
                        You will be able to create
                        programs and job opportunities
                        once an administrator approves
                        your organisation.
                      </p>

                      <span
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: "0.4rem",
                          padding:
                            "0.45rem 0.75rem",
                          borderRadius:
                            "999px",
                          background:
                            "#fef3c7",
                          color:
                            "#92400e",
                          fontWeight: 700,
                        }}
                      >
                        <span className="material-symbols-outlined">
                          schedule
                        </span>
                        Awaiting Admin Approval
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          )}

        {/* =====================================================
            PARTNER DASHBOARD
            ===================================================== */}

        {showPartnerDashboard &&
          isLoggedIn &&
          isPartner &&
          hasApprovedOrganisation && (
            <section
              id="partner-dashboard"
              className="org-section"
            >
              <div className="org-container">
                <div className="org-command-header">
                  <div>
                    <div className="org-live-label">
                      <span className="org-live-dot"></span>
                      Partner Account
                    </div>

                    <h2>
                      {selectedOrganisation?.name ||
                        "Partner Dashboard"}
                    </h2>

                    <p>
                      Manage your organisation,
                      programs, job opportunities,
                      applicants and notifications.
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      alignItems:
                        "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="org-dashboard-button org-light-button"
                      onClick={() =>
                        setShowNotifications(
                          (previous) =>
                            !previous
                        )
                      }
                    >
                      <span className="material-symbols-outlined">
                        notifications
                      </span>

                      Notifications

                      {unreadNotifications.length >
                        0 && (
                        <span
                          style={{
                            marginLeft:
                              "0.2rem",
                            minWidth:
                              "22px",
                            height:
                              "22px",
                            borderRadius:
                              "50%",
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              "#dc2626",
                            color:
                              "#ffffff",
                            fontSize:
                              "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {
                            unreadNotifications.length
                          }
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      className="org-dashboard-button org-dark-button"
                      onClick={() =>
                        setShowPartnerDashboard(
                          false
                        )
                      }
                    >
                      Close Dashboard
                    </button>
                  </div>
                </div>

                {/* ================= DASHBOARD NAV ================= */}

                <div
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    flexWrap: "wrap",
                    margin:
                      "1.5rem 0",
                    padding:
                      "0.75rem",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                >
                  <button
                    type="button"
                    style={dashboardNavButtonStyle(
                      partnerDashboardTab ===
                        "organisation"
                    )}
                    onClick={() =>
                      setPartnerDashboardTab(
                        "organisation"
                      )
                    }
                  >
                    <span className="material-symbols-outlined">
                      business
                    </span>
                    Organisation
                  </button>

                  <button
                    type="button"
                    style={dashboardNavButtonStyle(
                      partnerDashboardTab ===
                        "programs"
                    )}
                    onClick={() =>
                      setPartnerDashboardTab(
                        "programs"
                      )
                    }
                  >
                    <span className="material-symbols-outlined">
                      account_tree
                    </span>
                    Programs
                  </button>

                  <button
                    type="button"
                    style={dashboardNavButtonStyle(
                      partnerDashboardTab ===
                        "jobs"
                    )}
                    onClick={() =>
                      setPartnerDashboardTab(
                        "jobs"
                      )
                    }
                  >
                    <span className="material-symbols-outlined">
                      work
                    </span>
                    Jobs
                  </button>
                </div>

                {/* ================= NOTIFICATIONS ================= */}

                {showNotifications && (
                  <article
                    className="org-stat-card"
                    style={{
                      marginBottom:
                        "1.5rem",
                    }}
                  >
                    <div className="org-card-heading">
                      <div>
                        <h3>
                          Notifications
                        </h3>

                        <p>
                          Job application and
                          program milestone updates.
                        </p>
                      </div>
                    </div>

                    {notificationError && (
                      <div
                        style={{
                          marginBottom:
                            "1rem",
                          padding:
                            "0.75rem",
                          borderRadius:
                            "8px",
                          background:
                            "#fee2e2",
                          color:
                            "#991b1b",
                        }}
                      >
                        {
                          notificationError
                        }
                      </div>
                    )}

                    {notificationLoading &&
                      notifications.length ===
                        0 && (
                        <p>
                          Loading
                          notifications...
                        </p>
                      )}

                    {!notificationLoading &&
                      notifications.length ===
                        0 && (
                        <div
                          style={{
                            padding:
                              "1.5rem",
                            textAlign:
                              "center",
                            border:
                              "1px dashed #cbd5e1",
                            borderRadius:
                              "12px",
                          }}
                        >
                          <span className="material-symbols-outlined">
                            notifications_none
                          </span>

                          <p>
                            No notifications
                            yet.
                          </p>
                        </div>
                      )}

                    <div
                      style={{
                        display:
                          "grid",
                        gap: "0.75rem",
                      }}
                    >
                      {notifications.map(
                        (
                          notification,
                          index
                        ) => (
                          <div
                            key={
                              notification?.notification_id ||
                              notification?.id ||
                              index
                            }
                            style={{
                              display:
                                "flex",
                              gap:
                                "0.9rem",
                              padding:
                                "1rem",
                              border:
                                "1px solid #e5e7eb",
                              borderRadius:
                                "12px",
                              background:
                                notification?.is_read
                                  ? "#ffffff"
                                  : "#f8fafc",
                            }}
                          >
                            <div
                              style={{
                                width:
                                  "42px",
                                height:
                                  "42px",
                                borderRadius:
                                  "10px",
                                background:
                                  "#eef2ff",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                flexShrink:
                                  0,
                              }}
                            >
                              <span className="material-symbols-outlined">
                                {getNotificationIcon(
                                  notification
                                )}
                              </span>
                            </div>

                            <div
                              style={{
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  gap:
                                    "1rem",
                                }}
                              >
                                <strong>
                                  {notification?.title ||
                                    "Notification"}
                                </strong>

                                {!notification?.is_read && (
                                  <span
                                    style={{
                                      fontSize:
                                        "0.75rem",
                                      fontWeight:
                                        700,
                                      color:
                                        "#2563eb",
                                    }}
                                  >
                                    NEW
                                  </span>
                                )}
                              </div>

                              <p
                                style={{
                                  margin:
                                    "0.35rem 0",
                                }}
                              >
                                {notification?.message ||
                                  "You have a new notification."}
                              </p>

                              {notification?.type && (
                                <small
                                  style={{
                                    color:
                                      "#64748b",
                                  }}
                                >
                                  {
                                    notification.type
                                  }
                                </small>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </article>
                )}

                {/* =================================================
                    ORGANISATION TAB
                    ================================================= */}

                {partnerDashboardTab ===
                  "organisation" && (
                  <article className="org-stat-card">
                    <div className="org-card-heading">
                      <div>
                        <h3>
                          Organisation Overview
                        </h3>

                        <p>
                          Your approved organisation
                          profile.
                        </p>
                      </div>

                      <span
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap:
                            "0.35rem",
                          padding:
                            "0.45rem 0.7rem",
                          borderRadius:
                            "999px",
                          background:
                            "#dcfce7",
                          color:
                            "#166534",
                          fontWeight: 700,
                        }}
                      >
                        <span className="material-symbols-outlined">
                          verified
                        </span>
                        Approved
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap:
                          "1rem",
                        marginTop:
                          "1rem",
                      }}
                    >
                      <div>
                        <small>
                          Organisation
                        </small>

                        <h4>
                          {
                            selectedOrganisation?.name
                          }
                        </h4>
                      </div>

                      <div>
                        <small>
                          Type
                        </small>

                        <h4>
                          {
                            selectedOrganisation?.organisation_type ||
                            selectedOrganisation?.organization_type ||
                            "Organisation"
                          }
                        </h4>
                      </div>

                      <div>
                        <small>
                          Email
                        </small>

                        <h4>
                          {
                            selectedOrganisation?.email ||
                            currentUser?.email ||
                            "Not provided"
                          }
                        </h4>
                      </div>

                      <div>
                        <small>
                          Location
                        </small>

                        <h4>
                          {
                            selectedOrganisation?.location ||
                            "Not provided"
                          }
                        </h4>
                      </div>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "0.75rem",
                        flexWrap:
                          "wrap",
                        marginTop:
                          "1.5rem",
                      }}
                    >
                      <button
                        type="button"
                        className="org-dashboard-button org-dark-button"
                        onClick={() => {
                          setShowManagement(
                            true
                          );

                          setTimeout(() => {
                            document
                              .getElementById(
                                "organisation-management"
                              )
                              ?.scrollIntoView({
                                behavior:
                                  "smooth",
                                block:
                                  "start",
                              });
                          }, 50);
                        }}
                      >
                        <span className="material-symbols-outlined">
                          edit
                        </span>
                        Edit Organisation
                      </button>

                      <button
                        type="button"
                        className="org-dashboard-button org-light-button"
                        onClick={() =>
                          setPartnerDashboardTab(
                            "programs"
                          )
                        }
                      >
                        View Programs
                      </button>

                      <button
                        type="button"
                        className="org-dashboard-button org-light-button"
                        onClick={() =>
                          setPartnerDashboardTab(
                            "jobs"
                          )
                        }
                      >
                        View Jobs
                      </button>
                    </div>
                  </article>
                )}

                {/* =================================================
                    PROGRAMS TAB
                    ================================================= */}

                {partnerDashboardTab ===
                  "programs" && (
                  <article className="org-efficiency-card">
                    <div className="org-card-heading">
                      <div>
                        <h3>
                          Programs
                        </h3>

                        <p>
                          Preview and manage all
                          programs created by your
                          organisation.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="org-dashboard-button org-dark-button"
                        onClick={
                          openCreateProgramModal
                        }
                      >
                        <span className="material-symbols-outlined">
                          add
                        </span>
                        Create Program
                      </button>
                    </div>

                    {programError && (
                      <div
                        style={{
                          marginBottom:
                            "1rem",
                          padding:
                            "0.75rem",
                          borderRadius:
                            "8px",
                          background:
                            "#fee2e2",
                          color:
                            "#991b1b",
                        }}
                      >
                        {
                          programError
                        }
                      </div>
                    )}

                    {programLoading &&
                      programs.length ===
                        0 && (
                        <p>
                          Loading
                          programs...
                        </p>
                      )}

                    {!programLoading &&
                      programs.length ===
                        0 && (
                        <div
                          style={{
                            padding:
                              "2rem",
                            textAlign:
                              "center",
                            border:
                              "1px dashed #cbd5e1",
                            borderRadius:
                              "12px",
                            marginTop:
                              "1rem",
                          }}
                        >
                          <span className="material-symbols-outlined">
                            account_tree
                          </span>

                          <h4>
                            No programs yet
                          </h4>

                          <p>
                            Create your first
                            program using the
                            button above.
                          </p>
                        </div>
                      )}

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(260px, 1fr))",
                        gap:
                          "1rem",
                        marginTop:
                          "1.25rem",
                      }}
                    >
                      {programs.map(
                        (program) => {
                          const fundingGoal =
                            Number(
                              program?.funding_goal ||
                                0
                            );

                          const progressValue =
                            Number(
                              program?.progress_value ||
                                0
                            );

                          const percentage =
                            fundingGoal >
                            0
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (progressValue /
                                      fundingGoal) *
                                      100
                                  )
                                )
                              : Number(
                                  program?.progress_percentage ||
                                    0
                                );

                          return (
                            <div
                              key={getProgramId(
                                program
                              )}
                              style={{
                                padding:
                                  "1.15rem",
                                border:
                                  "1px solid #e5e7eb",
                                borderRadius:
                                  "12px",
                                background:
                                  "#ffffff",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  gap:
                                    "0.75rem",
                                  alignItems:
                                    "flex-start",
                                }}
                              >
                                <div>
                                  <h4>
                                    {getProgramTitle(
                                      program
                                    )}
                                  </h4>

                                  {getProgramCategory(
                                    program
                                  ) && (
                                    <small>
                                      {
                                        getProgramCategory(
                                          program
                                        )
                                      }
                                    </small>
                                  )}
                                </div>

                                <span className="material-symbols-outlined">
                                  account_tree
                                </span>
                              </div>

                              <p>
                                {getProgramDescription(
                                  program
                                )}
                              </p>

                              {program?.location && (
                                <p>
                                  <strong>
                                    Location:
                                  </strong>{" "}
                                  {
                                    program.location
                                  }
                                </p>
                              )}

                              {fundingGoal >
                                0 && (
                                <div
                                  style={{
                                    marginTop:
                                      "1rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      justifyContent:
                                        "space-between",
                                      fontSize:
                                        "0.85rem",
                                      marginBottom:
                                        "0.4rem",
                                    }}
                                  >
                                    <span>
                                      Goal
                                    </span>

                                    <strong>
                                      {
                                        percentage
                                      }
                                      %
                                    </strong>
                                  </div>

                                  <div
                                    style={{
                                      height:
                                        "8px",
                                      borderRadius:
                                        "999px",
                                      background:
                                        "#e5e7eb",
                                      overflow:
                                        "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${percentage}%`,
                                        height:
                                          "100%",
                                        background:
                                          "#0f766e",
                                        borderRadius:
                                          "999px",
                                      }}
                                    />
                                  </div>

                                  <small>
                                    {
                                      progressValue
                                    }{" "}
                                    /{" "}
                                    {
                                      fundingGoal
                                    }
                                  </small>
                                </div>
                              )}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap:
                                    "0.6rem",
                                  flexWrap:
                                    "wrap",
                                  marginTop:
                                    "1rem",
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
                                  <span className="material-symbols-outlined">
                                    edit
                                  </span>
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="org-dashboard-button"
                                  onClick={() =>
                                    handleDeleteProgram(
                                      getProgramId(
                                        program
                                      )
                                    )
                                  }
                                >
                                  <span className="material-symbols-outlined">
                                    delete
                                  </span>
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </article>
                )}

                {/* =================================================
                    JOBS TAB
                    ================================================= */}

                {partnerDashboardTab ===
                  "jobs" && (
                  <article className="org-efficiency-card">
                    <div className="org-card-heading">
                      <div>
                        <h3>
                          Job Opportunities
                        </h3>

                        <p>
                          Preview jobs, manage
                          opportunities and review
                          applicants.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="org-dashboard-button org-dark-button"
                        onClick={
                          openCreateJobModal
                        }
                      >
                        <span className="material-symbols-outlined">
                          add
                        </span>
                        Create Job
                      </button>
                    </div>

                    {jobError && (
                      <div
                        style={{
                          marginBottom:
                            "1rem",
                          padding:
                            "0.75rem",
                          borderRadius:
                            "8px",
                          background:
                            "#fee2e2",
                          color:
                            "#991b1b",
                        }}
                      >
                        {jobError}
                      </div>
                    )}

                    {jobLoading &&
                      jobs.length ===
                        0 && (
                        <p>
                          Loading jobs...
                        </p>
                      )}

                    {!jobLoading &&
                      jobs.length ===
                        0 && (
                        <div
                          style={{
                            padding:
                              "2rem",
                            textAlign:
                              "center",
                            border:
                              "1px dashed #cbd5e1",
                            borderRadius:
                              "12px",
                            marginTop:
                              "1rem",
                          }}
                        >
                          <span className="material-symbols-outlined">
                            work_off
                          </span>

                          <h4>
                            No job opportunities
                            yet
                          </h4>

                          <p>
                            Create your first job
                            opportunity using the
                            button above.
                          </p>
                        </div>
                      )}

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap:
                          "1rem",
                        marginTop:
                          "1.25rem",
                      }}
                    >
                      {jobs.map(
                        (job) => {
                          const applicantCount =
                            job?.applicant_count ??
                            job?.applications_count ??
                            job?.application_count ??
                            0;

                          return (
                            <div
                              key={getJobId(
                                job
                              )}
                              style={{
                                padding:
                                  "1.15rem",
                                border:
                                  "1px solid #e5e7eb",
                                borderRadius:
                                  "12px",
                                background:
                                  "#ffffff",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  gap:
                                    "0.75rem",
                                  alignItems:
                                    "flex-start",
                                }}
                              >
                                <div>
                                  <h4>
                                    {
                                      job.title
                                    }
                                  </h4>

                                  <span
                                    style={{
                                      display:
                                        "inline-flex",
                                      alignItems:
                                        "center",
                                      gap:
                                        "0.35rem",
                                      fontSize:
                                        "0.85rem",
                                      color:
                                        "#64748b",
                                    }}
                                  >
                                    <span className="material-symbols-outlined">
                                      group
                                    </span>
                                    {
                                      applicantCount
                                    }{" "}
                                    applicants
                                  </span>
                                </div>

                                <span className="material-symbols-outlined">
                                  work
                                </span>
                              </div>

                              <p>
                                {
                                  job.description
                                }
                              </p>

                              {job?.requirements && (
                                <p>
                                  <strong>
                                    Requirements:
                                  </strong>{" "}
                                  {
                                    job.requirements
                                  }
                                </p>
                              )}

                              {job?.application_deadline && (
                                <p>
                                  <strong>
                                    Deadline:
                                  </strong>{" "}
                                  {String(
                                    job.application_deadline
                                  ).slice(
                                    0,
                                    10
                                  )}
                                </p>
                              )}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap:
                                    "0.6rem",
                                  flexWrap:
                                    "wrap",
                                  marginTop:
                                    "1rem",
                                }}
                              >
                                <button
                                  type="button"
                                  className="org-dashboard-button org-dark-button"
                                  onClick={() =>
                                    handleViewApplicants(
                                      job
                                    )
                                  }
                                >
                                  <span className="material-symbols-outlined">
                                    group
                                  </span>
                                  View Applicants
                                </button>

                                <button
                                  type="button"
                                  className="org-dashboard-button org-light-button"
                                  onClick={() =>
                                    handleEditJob(
                                      job
                                    )
                                  }
                                >
                                  <span className="material-symbols-outlined">
                                    edit
                                  </span>
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="org-dashboard-button"
                                  onClick={() =>
                                    handleDeleteJob(
                                      getJobId(
                                        job
                                      )
                                    )
                                  }
                                >
                                  <span className="material-symbols-outlined">
                                    delete
                                  </span>
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </article>
                )}

                {/* =================================================
                    APPLICANT STATISTICS
                    ================================================= */}

                {showApplicantCards &&
                  selectedJob && (
                    <article
                      className="org-stat-card"
                      style={{
                        marginTop:
                          "1.5rem",
                      }}
                    >
                      <div className="org-card-heading">
                        <div>
                          <h3>
                            Applicants for{" "}
                            {
                              selectedJob.title
                            }
                          </h3>

                          <p>
                            Applicant statistics and
                            candidate details.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="org-dashboard-button org-light-button"
                          onClick={
                            closeApplicantCards
                          }
                        >
                          Close
                        </button>
                      </div>

                      {applicantLoading && (
                        <p>
                          Loading applicants...
                        </p>
                      )}

                      {applicantError && (
                        <div
                          style={{
                            marginBottom:
                              "1rem",
                            padding:
                              "0.75rem",
                            borderRadius:
                              "8px",
                            background:
                              "#fff7ed",
                            color:
                              "#9a3412",
                          }}
                        >
                          {
                            applicantError
                          }
                        </div>
                      )}

                      {!applicantLoading &&
                        !applicantError &&
                        jobApplicants.length ===
                          0 && (
                          <div
                            style={{
                              padding:
                                "1.5rem",
                              textAlign:
                                "center",
                              border:
                                "1px dashed #cbd5e1",
                              borderRadius:
                                "12px",
                            }}
                          >
                            <span className="material-symbols-outlined">
                              group_off
                            </span>

                            <p>
                              No applicants have
                              been recorded for
                              this job yet.
                            </p>
                          </div>
                        )}

                      {jobApplicants.length >
                        0 && (
                        <>
                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(150px, 1fr))",
                              gap:
                                "0.9rem",
                              margin:
                                "1rem 0 1.5rem",
                            }}
                          >
                            {[
                              [
                                "Total",
                                getApplicantStatistics()
                                  .total,
                                "group",
                              ],
                              [
                                "Pending",
                                getApplicantStatistics()
                                  .pending,
                                "schedule",
                              ],
                              [
                                "Reviewing",
                                getApplicantStatistics()
                                  .reviewing,
                                "visibility",
                              ],
                              [
                                "Accepted",
                                getApplicantStatistics()
                                  .accepted,
                                "check_circle",
                              ],
                              [
                                "Rejected",
                                getApplicantStatistics()
                                  .rejected,
                                "cancel",
                              ],
                            ].map(
                              (stat) => (
                                <div
                                  key={
                                    stat[0]
                                  }
                                  style={{
                                    padding:
                                      "1rem",
                                    border:
                                      "1px solid #e5e7eb",
                                    borderRadius:
                                      "12px",
                                    background:
                                      "#f8fafc",
                                  }}
                                >
                                  <span className="material-symbols-outlined">
                                    {
                                      stat[2]
                                    }
                                  </span>

                                  <p
                                    style={{
                                      margin:
                                        "0.4rem 0",
                                    }}
                                  >
                                    {
                                      stat[0]
                                    }
                                  </p>

                                  <h3
                                    style={{
                                      margin:
                                        0,
                                    }}
                                  >
                                    {
                                      stat[1]
                                    }
                                  </h3>
                                </div>
                              )
                            )}
                          </div>

                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
                              gap:
                                "1rem",
                            }}
                          >
                            {jobApplicants.map(
                              (
                                applicant,
                                index
                              ) => (
                                <div
                                  key={
                                    applicant?.application_id ||
                                    applicant?.id ||
                                    index
                                  }
                                  style={{
                                    padding:
                                      "1.15rem",
                                    border:
                                      "1px solid #e5e7eb",
                                    borderRadius:
                                      "12px",
                                    background:
                                      "#ffffff",
                                  }}
                                >
                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      gap:
                                        "0.8rem",
                                      alignItems:
                                        "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width:
                                          "46px",
                                        height:
                                          "46px",
                                        borderRadius:
                                          "50%",
                                        background:
                                          "#e2e8f0",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                        flexShrink:
                                          0,
                                      }}
                                    >
                                      <span className="material-symbols-outlined">
                                        person
                                      </span>
                                    </div>

                                    <div>
                                      <h4
                                        style={{
                                          margin:
                                            0,
                                        }}
                                      >
                                        {getApplicantName(
                                          applicant
                                        )}
                                      </h4>

                                      {applicant?.email && (
                                        <small>
                                          {
                                            applicant.email
                                          }
                                        </small>
                                      )}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      marginTop:
                                        "1rem",
                                      display:
                                        "grid",
                                      gap:
                                        "0.45rem",
                                    }}
                                  >
                                    <div>
                                      <strong>
                                        Status:
                                      </strong>{" "}
                                      {
                                        getApplicantStatus(
                                          applicant
                                        )
                                      }
                                    </div>

                                    {applicant?.application_date && (
                                      <div>
                                        <strong>
                                          Applied:
                                        </strong>{" "}
                                        {String(
                                          applicant.application_date
                                        ).slice(
                                          0,
                                          10
                                        )}
                                      </div>
                                    )}

                                    {applicant?.user?.phone && (
                                      <div>
                                        <strong>
                                          Phone:
                                        </strong>{" "}
                                        {
                                          applicant
                                            .user
                                            .phone
                                        }
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </>
                      )}
                    </article>
                  )}
              </div>
            </section>
          )}

        {/* =====================================================
            ORGANISATION MANAGEMENT
            LOGIN ONLY
            ===================================================== */}

        {showManagement &&
          isLoggedIn && (
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
                    Create, update, view and manage
                    your organisation's programs and
                    job opportunities.
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
                        marginBottom:
                          "1rem",
                        padding:
                          "0.75rem",
                        borderRadius:
                          "8px",
                        background:
                          "#fee2e2",
                        color:
                          "#991b1b",
                      }}
                    >
                      {
                        organisationError
                      }
                    </div>
                  )}

                  {selectedOrganisation && (
                    <div
                      style={{
                        marginBottom:
                          "1rem",
                        padding:
                          "0.75rem",
                        borderRadius:
                          "8px",
                        background:
                          hasApprovedOrganisation
                            ? "#ecfdf5"
                            : "#fffbeb",
                        color:
                          hasApprovedOrganisation
                            ? "#065f46"
                            : "#92400e",
                      }}
                    >
                      Managing:{" "}
                      <strong>
                        {
                          selectedOrganisation.name
                        }
                      </strong>

                      <span
                        style={{
                          marginLeft:
                            "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {hasApprovedOrganisation
                          ? "Approved"
                          : "Pending Approval"}
                      </span>
                    </div>
                  )}

                  {!selectedOrganisation && (
                    <div
                      style={{
                        marginBottom:
                          "1rem",
                        padding:
                          "0.75rem",
                        borderRadius:
                          "8px",
                        background:
                          "#eff6ff",
                        color:
                          "#1e40af",
                      }}
                    >
                      Creating an organisation
                      sends a request to the
                      administrator. The organisation
                      becomes active only after approval.
                    </div>
                  )}

                  <form
                    onSubmit={
                      handleOrganisationSubmit
                    }
                    style={{
                      display:
                        "grid",
                      gap:
                        "1rem",
                    }}
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Organisation name"
                      value={
                        organisationForm.name
                      }
                      onChange={
                        handleOrganisationChange
                      }
                      required
                    />

                    <input
                      type="text"
                      name="organisation_type"
                      placeholder="Organisation type"
                      value={
                        organisationForm.organisation_type
                      }
                      onChange={
                        handleOrganisationChange
                      }
                    />

                    <textarea
                      name="description"
                      placeholder="Description"
                      value={
                        organisationForm.description
                      }
                      onChange={
                        handleOrganisationChange
                      }
                      rows="4"
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="Organisation email"
                      value={
                        organisationForm.email
                      }
                      onChange={
                        handleOrganisationChange
                      }
                      required
                    />

                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone"
                      value={
                        organisationForm.phone
                      }
                      onChange={
                        handleOrganisationChange
                      }
                    />

                    <input
                      type="url"
                      name="website"
                      placeholder="Website"
                      value={
                        organisationForm.website
                      }
                      onChange={
                        handleOrganisationChange
                      }
                    />

                    <input
                      type="text"
                      name="location"
                      placeholder="Location"
                      value={
                        organisationForm.location
                      }
                      onChange={
                        handleOrganisationChange
                      }
                    />

                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "0.75rem",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <button
                        type="submit"
                        className="org-dashboard-button org-dark-button"
                        disabled={
                          organisationLoading
                        }
                      >
                        {organisationLoading
                          ? "Submitting..."
                          : selectedOrganisation
                          ? "Update Organisation"
                          : "Submit Organisation Request"}
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

                {isPartner &&
                  hasApprovedOrganisation && (
                    <article
                      className="org-efficiency-card"
                      style={{
                        marginTop:
                          "1.5rem",
                      }}
                    >
                      <div className="org-card-heading">
                        <div>
                          <h3>
                            Programs
                          </h3>

                          <p>
                            Create and manage your
                            organisation's programs.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="org-dashboard-button org-dark-button"
                          onClick={
                            openCreateProgramModal
                          }
                        >
                          <span className="material-symbols-outlined">
                            add
                          </span>
                          Create Program
                        </button>
                      </div>

                      {programError && (
                        <div
                          style={{
                            marginBottom:
                              "1rem",
                            padding:
                              "0.75rem",
                            borderRadius:
                              "8px",
                            background:
                              "#fee2e2",
                            color:
                              "#991b1b",
                          }}
                        >
                          {
                            programError
                          }
                        </div>
                      )}

                      <div
                        style={{
                          display:
                            "grid",
                          gap:
                            "1rem",
                        }}
                      >
                        <h4>
                          Existing Programs
                        </h4>

                        {programLoading &&
                          programs.length ===
                            0 && (
                            <p>
                              Loading
                              programs...
                            </p>
                          )}

                        {!programLoading &&
                          programs.length ===
                            0 && (
                            <p>
                              No programs found for
                              this organisation.
                            </p>
                          )}

                        {programs.map(
                          (program) => (
                            <div
                              key={getProgramId(
                                program
                              )}
                              style={{
                                padding:
                                  "1rem",
                                border:
                                  "1px solid #e5e7eb",
                                borderRadius:
                                  "10px",
                              }}
                            >
                              <h4>
                                {getProgramTitle(
                                  program
                                )}
                              </h4>

                              <p>
                                {getProgramDescription(
                                  program
                                )}
                              </p>

                              {getProgramCategory(
                                program
                              ) && (
                                <p>
                                  <strong>
                                    Category:
                                  </strong>{" "}
                                  {
                                    getProgramCategory(
                                      program
                                    )
                                  }
                                </p>
                              )}

                              {program.location && (
                                <p>
                                  <strong>
                                    Location:
                                  </strong>{" "}
                                  {
                                    program.location
                                  }
                                </p>
                              )}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap:
                                    "0.75rem",
                                  flexWrap:
                                    "wrap",
                                  marginTop:
                                    "1rem",
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
                                      getProgramId(
                                        program
                                      )
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </article>
                  )}

                {/* ================= JOBS ================= */}

                {isPartner &&
                  hasApprovedOrganisation && (
                    <article
                      className="org-efficiency-card"
                      style={{
                        marginTop:
                          "1.5rem",
                      }}
                    >
                      <div className="org-card-heading">
                        <div>
                          <h3>
                            Job Opportunities
                          </h3>

                          <p>
                            Create and manage job
                            opportunities for your
                            organisation.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="org-dashboard-button org-dark-button"
                          onClick={
                            openCreateJobModal
                          }
                        >
                          <span className="material-symbols-outlined">
                            add
                          </span>
                          Create Job
                        </button>
                      </div>

                      {jobError && (
                        <div
                          style={{
                            marginBottom:
                              "1rem",
                            padding:
                              "0.75rem",
                            borderRadius:
                              "8px",
                            background:
                              "#fee2e2",
                            color:
                              "#991b1b",
                          }}
                        >
                          {jobError}
                        </div>
                      )}

                      <div
                        style={{
                          display:
                            "grid",
                          gap:
                            "1rem",
                        }}
                      >
                        <h4>
                          Existing Job Opportunities
                        </h4>

                        {jobLoading &&
                          jobs.length ===
                            0 && (
                            <p>
                              Loading jobs...
                            </p>
                          )}

                        {!jobLoading &&
                          jobs.length ===
                            0 && (
                            <p>
                              No job opportunities
                              found for this
                              organisation.
                            </p>
                          )}

                        {jobs.map(
                          (job) => (
                            <div
                              key={getJobId(
                                job
                              )}
                              style={{
                                padding:
                                  "1rem",
                                border:
                                  "1px solid #e5e7eb",
                                borderRadius:
                                  "10px",
                              }}
                            >
                              <h4>
                                {
                                  job.title
                                }
                              </h4>

                              <p>
                                {
                                  job.description
                                }
                              </p>

                              {job.requirements && (
                                <p>
                                  <strong>
                                    Requirements:
                                  </strong>{" "}
                                  {
                                    job.requirements
                                  }
                                </p>
                              )}

                              {job.minimum_education && (
                                <p>
                                  <strong>
                                    Minimum
                                    education:
                                  </strong>{" "}
                                  {
                                    job.minimum_education
                                  }
                                </p>
                              )}

                              {job.experience && (
                                <p>
                                  <strong>
                                    Experience:
                                  </strong>{" "}
                                  {
                                    job.experience
                                  }
                                </p>
                              )}

                              {job.application_deadline && (
                                <p>
                                  <strong>
                                    Application
                                    deadline:
                                  </strong>{" "}
                                  {String(
                                    job.application_deadline
                                  ).slice(
                                    0,
                                    10
                                  )}
                                </p>
                              )}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap:
                                    "0.75rem",
                                  flexWrap:
                                    "wrap",
                                  marginTop:
                                    "1rem",
                                }}
                              >
                                <button
                                  type="button"
                                  className="org-dashboard-button org-dark-button"
                                  onClick={() =>
                                    handleViewApplicants(
                                      job
                                    )
                                  }
                                >
                                  View Applicants
                                </button>

                                <button
                                  type="button"
                                  className="org-dashboard-button org-light-button"
                                  onClick={() =>
                                    handleEditJob(
                                      job
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="org-dashboard-button"
                                  onClick={() =>
                                    handleDeleteJob(
                                      getJobId(
                                        job
                                      )
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </article>
                  )}
              </div>
            </section>
          )}

        {/* =====================================================
            PROGRAM CREATE / EDIT MODAL
            ===================================================== */}

        {showProgramModal &&
          isLoggedIn &&
          isPartner &&
          hasApprovedOrganisation && (
            <div
              style={modalOverlayStyle}
              onMouseDown={(event) => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeProgramModal();
                }
              }}
            >
              <div
                style={modalStyle}
                role="dialog"
                aria-modal="true"
                aria-labelledby="program-modal-title"
              >
                <div
                  style={
                    modalHeaderStyle
                  }
                >
                  <div>
                    <p
                      className="org-small-heading"
                      style={{
                        margin:
                          "0 0 0.3rem",
                      }}
                    >
                      Partner Dashboard
                    </p>

                    <h2
                      id="program-modal-title"
                      style={{
                        margin: 0,
                      }}
                    >
                      {editingProgramId
                        ? "Edit Program"
                        : "Create Program"}
                    </h2>

                    <p>
                      {editingProgramId
                        ? "Update the selected program using the pre-filled fields."
                        : "Create a new program for your approved organisation."}
                    </p>
                  </div>

                  <button
                    type="button"
                    style={
                      modalCloseStyle
                    }
                    onClick={
                      closeProgramModal
                    }
                    aria-label="Close program form"
                  >
                    <span className="material-symbols-outlined">
                      close
                    </span>
                  </button>
                </div>

                {programError && (
                  <div
                    style={{
                      marginBottom:
                        "1rem",
                      padding:
                        "0.75rem",
                      borderRadius:
                        "8px",
                      background:
                        "#fee2e2",
                      color:
                        "#991b1b",
                    }}
                  >
                    {
                      programError
                    }
                  </div>
                )}

                <form
                  onSubmit={
                    handleProgramSubmit
                  }
                  style={{
                    display:
                      "grid",
                    gap:
                      "1rem",
                  }}
                >
                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Program Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Program name"
                      value={
                        programForm.name
                      }
                      onChange={
                        handleProgramChange
                      }
                      style={
                        modalInputStyle
                      }
                      required
                    />
                  </div>

                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      placeholder="Program description"
                      value={
                        programForm.description
                      }
                      onChange={
                        handleProgramChange
                      }
                      rows="4"
                      style={
                        modalTextareaStyle
                      }
                      required
                    />
                  </div>

                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Category
                    </label>

                    <input
                      type="text"
                      name="category"
                      placeholder="Category"
                      value={
                        programForm.category
                      }
                      onChange={
                        handleProgramChange
                      }
                      style={
                        modalInputStyle
                      }
                    />
                  </div>

                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Location
                    </label>

                    <input
                      type="text"
                      name="location"
                      placeholder="Location"
                      value={
                        programForm.location
                      }
                      onChange={
                        handleProgramChange
                      }
                      style={
                        modalInputStyle
                      }
                    />
                  </div>

                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Eligibility
                    </label>

                    <textarea
                      name="eligibility"
                      placeholder="Eligibility requirements"
                      value={
                        programForm.eligibility
                      }
                      onChange={
                        handleProgramChange
                      }
                      rows="3"
                      style={
                        modalTextareaStyle
                      }
                    />
                  </div>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap:
                        "1rem",
                    }}
                  >
                    <div
                      style={
                        modalFieldStyle
                      }
                    >
                      <label>
                        Start Date
                      </label>

                      <input
                        type="date"
                        name="start_date"
                        value={
                          programForm.start_date
                        }
                        onChange={
                          handleProgramChange
                        }
                        style={
                          modalInputStyle
                        }
                      />
                    </div>

                    <div
                      style={
                        modalFieldStyle
                      }
                    >
                      <label>
                        End Date
                      </label>

                      <input
                        type="date"
                        name="end_date"
                        value={
                          programForm.end_date
                        }
                        onChange={
                          handleProgramChange
                        }
                        style={
                          modalInputStyle
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop:
                        "1px solid #e5e7eb",
                      paddingTop:
                        "1rem",
                    }}
                  >
                    <h4>
                      Funding Goal
                    </h4>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(160px, 1fr))",
                        gap:
                          "1rem",
                      }}
                    >
                      <div
                        style={
                          modalFieldStyle
                        }
                      >
                        <label>
                          Funding Goal
                        </label>

                        <input
                          type="number"
                          min="0"
                          name="funding_goal"
                          placeholder="e.g. 100000"
                          value={
                            programForm.funding_goal
                          }
                          onChange={
                            handleProgramChange
                          }
                          style={
                            modalInputStyle
                          }
                        />
                      </div>

                      <div
                        style={
                          modalFieldStyle
                        }
                      >
                        <label>
                          Current Progress
                        </label>

                        <input
                          type="number"
                          min="0"
                          name="progress_value"
                          placeholder="Current amount"
                          value={
                            programForm.progress_value
                          }
                          onChange={
                            handleProgramChange
                          }
                          style={
                            modalInputStyle
                          }
                        />
                      </div>

                      <div
                        style={
                          modalFieldStyle
                        }
                      >
                        <label>
                          Progress Unit
                        </label>

                        <input
                          type="text"
                          name="progress_unit"
                          value={
                            programForm.progress_unit
                          }
                          onChange={
                            handleProgramChange
                          }
                          style={
                            modalInputStyle
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "0.75rem",
                      justifyContent:
                        "flex-end",
                      flexWrap:
                        "wrap",
                      marginTop:
                        "0.5rem",
                    }}
                  >
                    <button
                      type="button"
                      className="org-dashboard-button org-light-button"
                      onClick={
                        closeProgramModal
                      }
                      disabled={
                        programLoading
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="org-dashboard-button org-dark-button"
                      disabled={
                        programLoading
                      }
                    >
                      {programLoading
                        ? "Saving..."
                        : editingProgramId
                        ? "Update Program"
                        : "Create Program"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        {/* =====================================================
            JOB CREATE / EDIT MODAL
            ===================================================== */}

        {showJobModal &&
          isLoggedIn &&
          isPartner &&
          hasApprovedOrganisation && (
            <div
              style={modalOverlayStyle}
              onMouseDown={(event) => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeJobModal();
                }
              }}
            >
              <div
                style={modalStyle}
                role="dialog"
                aria-modal="true"
                aria-labelledby="job-modal-title"
              >
                <div
                  style={
                    modalHeaderStyle
                  }
                >
                  <div>
                    <p
                      className="org-small-heading"
                      style={{
                        margin:
                          "0 0 0.3rem",
                      }}
                    >
                      Partner Dashboard
                    </p>

                    <h2
                      id="job-modal-title"
                      style={{
                        margin: 0,
                      }}
                    >
                      {editingJobId
                        ? "Edit Job Opportunity"
                        : "Create Job Opportunity"}
                    </h2>

                    <p>
                      {editingJobId
                        ? "Update the selected job using the pre-filled fields."
                        : "Create a new job opportunity for your approved organisation."}
                    </p>
                  </div>

                  <button
                    type="button"
                    style={
                      modalCloseStyle
                    }
                    onClick={
                      closeJobModal
                    }
                    aria-label="Close job form"
                  >
                    <span className="material-symbols-outlined">
                      close
                    </span>
                  </button>
                </div>

                {jobError && (
                  <div
                    style={{
                      marginBottom:
                        "1rem",
                      padding:
                        "0.75rem",
                      borderRadius:
                        "8px",
                      background:
                        "#fee2e2",
                      color:
                        "#991b1b",
                    }}
                  >
                    {jobError}
                  </div>
                )}

                <form
                  onSubmit={
                    handleJobSubmit
                  }
                  style={{
                    display:
                      "grid",
                    gap:
                      "1rem",
                  }}
                >
                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Job Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      placeholder="Job title"
                      value={
                        jobForm.title
                      }
                      onChange={
                        handleJobChange
                      }
                      style={
                        modalInputStyle
                      }
                      required
                    />
                  </div>

                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      placeholder="Job description"
                      value={
                        jobForm.description
                      }
                      onChange={
                        handleJobChange
                      }
                      rows="5"
                      style={
                        modalTextareaStyle
                      }
                      required
                    />
                  </div>

                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Requirements
                    </label>

                    <textarea
                      name="requirements"
                      placeholder="Requirements"
                      value={
                        jobForm.requirements
                      }
                      onChange={
                        handleJobChange
                      }
                      rows="4"
                      style={
                        modalTextareaStyle
                      }
                    />
                  </div>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap:
                        "1rem",
                    }}
                  >
                    <div
                      style={
                        modalFieldStyle
                      }
                    >
                      <label>
                        Minimum Education
                      </label>

                      <input
                        type="text"
                        name="minimum_education"
                        placeholder="e.g. Diploma"
                        value={
                          jobForm.minimum_education
                        }
                        onChange={
                          handleJobChange
                        }
                        style={
                          modalInputStyle
                        }
                      />
                    </div>

                    <div
                      style={
                        modalFieldStyle
                      }
                    >
                      <label>
                        Experience
                      </label>

                      <input
                        type="text"
                        name="experience"
                        placeholder="e.g. 2 years"
                        value={
                          jobForm.experience
                        }
                        onChange={
                          handleJobChange
                        }
                        style={
                          modalInputStyle
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={
                      modalFieldStyle
                    }
                  >
                    <label>
                      Application Deadline
                    </label>

                    <input
                      type="date"
                      name="application_deadline"
                      value={
                        jobForm.application_deadline
                      }
                      onChange={
                        handleJobChange
                      }
                      style={
                        modalInputStyle
                      }
                    />
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "0.75rem",
                      justifyContent:
                        "flex-end",
                      flexWrap:
                        "wrap",
                      marginTop:
                        "0.5rem",
                    }}
                  >
                    <button
                      type="button"
                      className="org-dashboard-button org-light-button"
                      onClick={
                        closeJobModal
                      }
                      disabled={
                        jobLoading
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="org-dashboard-button org-dark-button"
                      disabled={
                        jobLoading
                      }
                    >
                      {jobLoading
                        ? "Saving..."
                        : editingJobId
                        ? "Update Job"
                        : "Create Job"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
                      <span>
                        units
                      </span>
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
                      <span>
                        on duty
                      </span>
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
                      <span>
                        queues
                      </span>
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
                          key={
                            timeframe
                          }
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
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="org-chart-column"
                        key={
                          index
                        }
                      >
                        <div className="org-chart-value">
                          {
                            item.value
                          }
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
                          {
                            item.day
                          }
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
                  {logs.map(
                    (log) => {
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
                          key={
                            log.id
                          }
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
                    }
                  )}
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
                  (
                    testimonial
                  ) => (
                    <article
                      className="org-testimonial-card"
                      key={
                        testimonial.id
                      }
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
            src={
              heroSupportImage
            }
            alt=""
          />
        </div>
      </main>
    </>
  ); 
}
export default Organisations;