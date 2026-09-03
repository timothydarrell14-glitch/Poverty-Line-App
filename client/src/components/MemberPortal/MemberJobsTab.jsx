import { useState, useEffect } from "react";
import { apiRequest } from "../../api/client";
import { useToast } from "../../context/ToastContext";

const MemberJobsTab = () => {
  const [activeApplications, setActiveApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        apiRequest("/api/job-applications"),
        apiRequest("/api/jobs"),
      ]);
      setActiveApplications(appsRes.applications || []);
      setJobs(jobsRes.jobs || []);
    } catch (err) {
      showToast(err.message || "Failed to load job data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const appliedJobIds = new Set(
    activeApplications.map((app) => app.job_id)
  );

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    try {
      await apiRequest("/api/job-applications", {
        method: "POST",
        body: { job_id: jobId },
      });
      showToast("Job application submitted successfully!", "success");
      fetchData();
    } catch (err) {
      showToast(err.message || "Failed to submit application.", "error");
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(search.toLowerCase()));
    
    if (filterType === "All") return matchesSearch;
    if (filterType === "Immediate") return matchesSearch && job.status === "open";
    if (filterType === "Part-time") return matchesSearch && job.description?.toLowerCase().includes("part-time");
    if (filterType === "Full-time") return matchesSearch && !job.description?.toLowerCase().includes("part-time");
    return matchesSearch;
  });

  return (
    <div className="member-jobs-tab">
      {/* Active Job Applications Banner */}
      <div className="active-applications-section">
        <div className="section-subtitle-row">
          <span className="material-symbols-outlined" style={{ color: "#0f6258" }}>check_circle</span>
          <h3>Your Active Job Applications ({activeApplications.length})</h3>
        </div>

        {activeApplications.length === 0 ? (
          <p style={{ color: "#64748b", margin: 0 }}>
            You haven't submitted any job applications yet. Browse available opportunities below!
          </p>
        ) : (
          <div className="active-applications-grid">
            {activeApplications.map((app) => (
              <div key={app.application_id} className="application-card">
                <h4>{app.job?.title || `Job #${app.job_id}`}</h4>
                <span className="app-date">
                  Applied on {new Date(app.application_date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span
                  className={`status-badge ${
                    app.status?.toLowerCase() === "interview scheduled"
                      ? "interview-scheduled"
                      : "reviewing"
                  }`}
                >
                  {app.status
                    ? app.status.charAt(0).toUpperCase() + app.status.slice(1)
                    : "Reviewing"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="jobs-filter-bar">
        <div className="search-input-wrap">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search jobs, locations, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills-row">
          {["All", "Immediate", "Part-time", "Full-time"].map((type) => (
            <button
              key={type}
              className={`filter-pill-btn ${filterType === type ? "active" : ""}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Available Jobs List */}
      {loading ? (
        <p style={{ color: "#64748b", textAlign: "center" }}>Loading job opportunities...</p>
      ) : filteredJobs.length === 0 ? (
        <p style={{ color: "#64748b", textAlign: "center" }}>No job opportunities found matching your query.</p>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => {
            const hasApplied = appliedJobIds.has(job.job_id);
            return (
              <div key={job.job_id} className="job-opportunity-card">
                <div className="job-card-header">
                  <span className="job-type-tag">
                    {job.description?.toLowerCase().includes("part-time") ? "Part-time" : "Full-time / Immediate"}
                  </span>
                  <span className="job-location-text">
                    <span className="material-symbols-outlined">location_on</span>
                    {job.location || "City Center"}
                  </span>
                </div>

                <div className="job-title-row">
                  <h3>{job.title}</h3>
                  <span className="job-pay-text">
                    {job.experience ? `$${job.experience} / hr` : "$22.50 / hr + Benefits"}
                  </span>
                </div>

                <p className="job-desc-text">
                  {job.description || "Engage with local neighborhoods to distribute resources and facilitate support groups. Full-time position with benefits."}
                </p>

                {job.requirements && (
                  <ul className="job-reqs-list">
                    {job.requirements.split(";").map((req, idx) => (
                      <li key={idx}>
                        <span className="material-symbols-outlined">check</span>
                        {req.trim()}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="job-actions-row">
                  <button
                    className="btn-apply-oneclick"
                    disabled={hasApplied || applyingJobId === job.job_id}
                    onClick={() => handleApply(job.job_id)}
                  >
                    {hasApplied
                      ? "Applied ✓"
                      : applyingJobId === job.job_id
                      ? "Applying..."
                      : "1-Click Apply with Profile"}
                  </button>
                  <button
                    className="btn-job-details"
                    onClick={() => setSelectedJobDetails(job)}
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedJobDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedJobDetails(null)}>
          <div className="modal-window callback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>{selectedJobDetails.title}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedJobDetails(null)}>
                &times;
              </button>
            </div>
            <p className="modal-helper-text">{selectedJobDetails.description}</p>
            {selectedJobDetails.requirements && (
              <div style={{ margin: "1rem 0" }}>
                <strong>Requirements & Qualifications:</strong>
                <p style={{ fontSize: "0.9rem", color: "#334155" }}>{selectedJobDetails.requirements}</p>
              </div>
            )}
            <button className="btn-confirm-callback" onClick={() => setSelectedJobDetails(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberJobsTab;
