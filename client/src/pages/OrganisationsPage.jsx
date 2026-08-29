import { useState } from 'react';

import foodforwardImage from "../assets/foodforward.jpg";
import globalcareImage from "../assets/globalcare.jpg";
import heroSupportImage from "../assets/hero-support.jpg";
import organisationsHeroImage from "../assets/organisations-hero.jpg";

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

function Organisations({
  onOpenPartnerApplication,
  onOpenLiveSimulation,
}) {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);

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

  const handleSimulateNewEntry = () => {
    setIsSimulatingDispatch(true);

    setTimeout(() => {
      const newEntry = {
        id: `log-${Date.now()}`,
        title: `Dispatch #${Math.floor(405 + Math.random() * 50)} completed`,
        timestamp: "Just now",
        type: "delivery",
        status: "completed",
        details:
          "850 nutrition packs successfully routed to East Community Shelter.",
      };

      setLogs((previousLogs) => [newEntry, ...previousLogs]);
      setIsSimulatingDispatch(false);
    }, 600);
  };

  const handleDashboardPreview = () => {
    const element = document.getElementById("command-center-preview");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <main className="organisations-page">
      {/* ================= HERO ================= */}
      <section className="org-hero">
        <div className="org-container org-hero-grid">
          <div className="org-hero-content">
            <div className="org-eyebrow">
              <span className="material-symbols-outlined">hub</span>
              Institutional Logistics Network
            </div>

            <h1 className="org-hero-title">
              Amplify Your Impact.
              <br />
              <span>Streamline Operations.</span>
            </h1>

            <p className="org-hero-description">
              Connect your non-profit, NGO, or community initiative with our
              open logistics infrastructure. Coordinate resources, volunteers,
              and distribution in real-time.
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
                Our simple three-step integration allows organizations of any
                size to onboard quickly without disrupting existing ground
                operations.
              </p>
            </div>

            <div className="org-steps-grid">
              <article className="org-step-card">
                <div className="org-step-number">1</div>

                <h3>Application &amp; Verification</h3>

                <p>
                  Submit your organization's mission, service area, and
                  non-profit credentials for our streamlined 48-hour
                  verification.
                </p>
              </article>

              <article className="org-step-card">
                <div className="org-step-number">2</div>

                <h3>System Integration</h3>

                <p>
                  Connect your existing supply inventories, warehouse hubs,
                  and volunteer rosters into our centralized dashboard.
                </p>
              </article>

              <article className="org-step-card">
                <div className="org-step-number">3</div>

                <h3>Impact Tracking &amp; Delivery</h3>

                <p>
                  Deploy optimized delivery routes, receive donor support
                  transparently, and track verified impact in real-time.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

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

              <h2>Partner Command Center</h2>
            </div>

            <div className="org-command-actions">
              <button
                type="button"
                className="org-dashboard-button org-light-button"
                id="simulate-dispatch-btn"
                onClick={handleSimulateNewEntry}
                disabled={isSimulatingDispatch}
              >
                <span className="material-symbols-outlined">bolt</span>

                <span>
                  {isSimulatingDispatch
                    ? "Simulating..."
                    : "Simulate Live Dispatch"}
                </span>
              </button>

              <button
                type="button"
                className="org-dashboard-button org-dark-button"
                onClick={onOpenLiveSimulation}
              >
                <span>Explore Full System</span>

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
                  <p>Total Resources Distributed (YTD)</p>

                  <h3>
                    142,500 <span>units</span>
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

                <span>+12% compared to last quarter</span>
              </div>
            </article>

            {/* STAT CARD 2 */}
            <article className="org-stat-card">
              <div className="org-stat-top">
                <div>
                  <p>Active Volunteers</p>

                  <h3>
                    342 <span>on duty</span>
                  </h3>
                </div>

                <div className="org-stat-icon green-icon">
                  <span className="material-symbols-outlined">group</span>
                </div>
              </div>

              <div className="org-stat-footer">
                <span>Capacity utilization: 86%</span>

                <strong>24 teams deployed</strong>
              </div>
            </article>

            {/* STAT CARD 3 */}
            <article className="org-stat-card">
              <div className="org-stat-top">
                <div>
                  <p>Pending Requests</p>

                  <h3 className="warning-number">
                    48 <span>queues</span>
                  </h3>
                </div>

                <div className="org-stat-icon warning-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
              </div>

              <div className="org-stat-footer warning-text">
                <span className="material-symbols-outlined">
                  priority_high
                </span>

                <span>All requests triaged under 4 hours</span>
              </div>
            </article>

            {/* DISTRIBUTION EFFICIENCY */}
            <article className="org-efficiency-card">
              <div className="org-card-heading">
                <div>
                  <h3>Distribution Efficiency</h3>

                  <p>
                    Weekly throughput across regional distribution centers
                  </p>
                </div>

                <div className="org-timeframe-selector">
                  {["7d", "30d", "ytd"].map((timeframe) => (
                    <button
                      type="button"
                      key={timeframe}
                      className={
                        selectedTimeframe === timeframe
                          ? "active"
                          : ""
                      }
                      onClick={() => setSelectedTimeframe(timeframe)}
                    >
                      {timeframe === "7d"
                        ? "7 Days"
                        : timeframe === "30d"
                        ? "30 Days"
                        : "YTD"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="org-chart">
                {chartData[selectedTimeframe].map((item, index) => (
                  <div className="org-chart-column" key={index}>
                    <div className="org-chart-value">
                      {item.value}
                    </div>

                    <div className="org-bar-wrapper">
                      <div
                        className="org-bar"
                        style={{ height: item.height }}
                      ></div>
                    </div>

                    <span>{item.day}</span>
                  </div>
                ))}
              </div>

              <div className="org-efficiency-footer">
                <span>
                  Average Delivery Route Time: <strong>42 minutes</strong>
                </span>

                <strong className="success-text">
                  98.4% On-Time Delivery Rate
                </strong>
              </div>
            </article>

            {/* RECENT LOGISTICS LOG */}
            <article className="org-log-card">
              <div className="org-log-header">
                <h3>Recent Logistics Log</h3>

                <span>Live Feed</span>
              </div>

              <div className="org-log-list">
                {logs.map((log) => {
                  let icon = "local_shipping";
                  let statusClass = "delivery";

                  if (log.status === "warning") {
                    icon = "warning";
                    statusClass = "warning";
                  } else if (log.status === "info") {
                    icon = "person_add";
                    statusClass = "info";
                  } else if (log.type === "route") {
                    icon = "alt_route";
                    statusClass = "route";
                  }

                  return (
                    <div className="org-log-item" key={log.id}>
                      <div className="org-log-item-top">
                        <span className="org-log-title">
                          <span
                            className={`org-log-icon ${statusClass}`}
                          >
                            <span className="material-symbols-outlined">
                              {icon}
                            </span>
                          </span>

                          {log.title}
                        </span>

                        <span className="org-log-time">
                          {log.timestamp}
                        </span>
                      </div>

                      {log.details && (
                        <p>{log.details}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="org-api-button"
                onClick={onOpenPartnerApplication}
              >
                Connect your warehouse API →
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

              <h2>Trusted by Leading Organizations</h2>
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
              {TESTIMONIALS.map((testimonial) => (
                <article
                  className="org-testimonial-card"
                  key={testimonial.id}
                >
                  <div className="org-testimonial-content">
                    <span className="material-symbols-outlined org-quote-icon">
                      format_quote
                    </span>

                    <p>
                      "{testimonial.quote}"
                    </p>
                  </div>

                  <div className="org-testimonial-person">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                    />

                    <div>
                      <h4>{testimonial.author}</h4>

                      <p>
                        {testimonial.role},{" "}
                        <strong>{testimonial.organization}</strong>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hidden image references are intentionally not displayed.
          The page uses only the four provided image assets. */}
      <div className="org-image-preload" aria-hidden="true">
        <img src={heroSupportImage} alt="" />
      </div>
    </main>
  );
}

export default Organisations;