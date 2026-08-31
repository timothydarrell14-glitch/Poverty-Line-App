import { useNavigate } from "react-router-dom";

const JobPreview = () => {
  const navigate = useNavigate();

  const mockJobs = [
    {
      id: 1,
      title: "Community Outreach Coordinator",
      tag: "Immediate",
      description:
        "Engage with local neighborhoods to distribute resources and facilitate support groups. Full-time position with benefits.",
      location: "City Center",
    },
    {
      id: 2,
      title: "Warehouse Associate",
      tag: "Part-time",
      description:
        "Assist in organizing and distributing food and essential supplies at our main distribution hub. Flexible hours available.",
      location: "North District",
    },
  ];

  return (
    <section className="help-section-card">
      <div className="card-header-flex">
        <div>
          <h2>Job Opportunities</h2>
          <p>
            Connect with local employers committed to fair hiring, dignified
            wages, and respectful workplaces.
          </p>
        </div>
        <button className="view-all-link" onClick={() => navigate("/jobs")}>
          View all &gt;
        </button>
      </div>

      <div className="two-col-grid">
        {mockJobs.map((job) => (
          <div key={job.id} className="preview-inner-card job-card">
            <div className="card-title-badge">
              <h4>{job.title}</h4>
              <span className={`status-pill ${job.tag.toLowerCase()}`}>
                {job.tag}
              </span>
            </div>
            <p className="card-body-text">{job.description}</p>
            <div className="card-divider"></div>
            <div className="card-footer-flex">
              <span className="location-text">
                <svg className="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {job.location}
              </span>
              <button
                className="link-arrow-btn"
                onClick={() => navigate("/jobs")}
              >
                View details &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default JobPreview;
