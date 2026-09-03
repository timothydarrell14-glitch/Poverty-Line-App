import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/LogisticsPage.css";
import "../styles/LogisticsPage.dark.css";

function LogisticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

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

  return (
    <>
      <Navbar />

      <div className="logistics-page">
        {/* Header */}
        <header className="logistics-header">
          <div>
            <p className="logistics-label">POVERTY LINE LOGISTICS</p>

            <h1>Logistics Dashboard</h1>

            <p>
              Coordinate resources, deliveries, volunteers, and requests.
            </p>
          </div>

          <div className="logistics-status">
            <span></span>
            System Operational
          </div>
        </header>

        {/* Key Logistics Services */}
        <section className="logistics-services">
          <div className="services-heading">
            <p>LOGISTICS SERVICES</p>

            <h2>Key Logistics Services for Aid Organizations</h2>
          </div>

          <div className="services-grid">
            {/* Service 1 */}
            <article className="service-card">
              <div className="service-number">01</div>

              <h3>Remote Area Distribution</h3>

              <p>
                Uses motorcycles and 4-wheel drive vehicles to deliver supplies
                to off-road and hard-to-reach locations.
              </p>
            </article>

            {/* Service 2 */}
            <article className="service-card">
              <div className="service-number">02</div>

              <h3>Specialist Goods Handling</h3>

              <p>
                Employs trained staff to manage delicate cargo, including food
                commodities and medical supplies.
              </p>
            </article>

            {/* Service 3 */}
            <article className="service-card">
              <div className="service-number">03</div>

              <h3>Emergency Response</h3>

              <p>
                Provides 24/7 logistics mobilization during sudden humanitarian
                crises.
              </p>
            </article>

            {/* Service 4 */}
            <article className="service-card">
              <div className="service-number">04</div>

              <h3>Donor Compliance</h3>

              <p>
                Generates audit-ready documentation, waybills, and delivery
                reports that meet strict donor rules.
              </p>
            </article>
          </div>
        </section>

        {/* Statistics */}
        <section className="logistics-stats">
          <div className="logistics-card">
            <span>Resources Distributed</span>

            <strong>142,500</strong>

            <small>units</small>
          </div>

          <div className="logistics-card">
            <span>Active Volunteers</span>

            <strong>342</strong>

            <small>on duty</small>
          </div>

          <div className="logistics-card">
            <span>Pending Requests</span>

            <strong>48</strong>

            <small>queues</small>
          </div>

          <div className="logistics-card">
            <span>On-Time Delivery</span>

            <strong>98.4%</strong>

            <small>delivery rate</small>
          </div>
        </section>

        {/* Main Logistics Content */}
        <section className="logistics-content">
          {/* Recent Logistics Activity */}
          <div className="logistics-panel">
            <div className="panel-heading">
              <p>LIVE OPERATIONS</p>

              <h2>Recent Logistics Activity</h2>
            </div>

            <div className="logistics-feed">
              {/* Activity 1 */}
              <div className="logistics-item">
                <div className="activity-icon">✓</div>

                <div>
                  <h3>Shipment #402 delivered</h3>

                  <p>
                    1,200 kg staple grains and pantry provisions received at
                    Central Hub.
                  </p>

                  <small>12 mins ago</small>
                </div>
              </div>

              {/* Activity 2 */}
              <div className="logistics-item warning">
                <div className="activity-icon">!</div>

                <div>
                  <h3>Low inventory alert: Pantry B</h3>

                  <p>
                    Baby formula and dry legumes inventory under 15% threshold.
                  </p>

                  <small>34 mins ago</small>
                </div>
              </div>

              {/* Activity 3 */}
              <div className="logistics-item">
                <div className="activity-icon">+</div>

                <div>
                  <h3>5 new volunteers onboarded</h3>

                  <p>
                    Completed food safety and route-dispatch safety
                    certification.
                  </p>

                  <small>1 hour ago</small>
                </div>
              </div>

              {/* Activity 4 */}
              <div className="logistics-item">
                <div className="activity-icon">↗</div>

                <div>
                  <h3>Route optimized for Zone A</h3>

                  <p>
                    Dynamic routing reduced transit fuel expenditure by 18%.
                  </p>

                  <small>2 hours ago</small>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Overview */}
          <div className="logistics-panel">
            <div className="panel-heading">
              <p>DISTRIBUTION PERFORMANCE</p>

              <h2>Distribution Overview</h2>
            </div>

            <div className="route-stat">
              <span>Average Route Time</span>

              <strong>42 min</strong>
            </div>

            <div className="route-stat">
              <span>Teams Deployed</span>

              <strong>24</strong>
            </div>

            <div className="route-stat">
              <span>Capacity Utilization</span>

              <strong>86%</strong>
            </div>

            <div className="route-stat">
              <span>On-Time Delivery</span>

              <strong>98.4%</strong>
            </div>
          </div>
        </section>

        {/* Distribution Efficiency */}
        <section className="distribution-section">
          <div className="distribution-header">
            <div>
              <p>DISTRIBUTION EFFICIENCY</p>

              <h2>Weekly Throughput</h2>
            </div>

            <div className="timeframe-selector">
              <button
                type="button"
                className={selectedTimeframe === "7d" ? "active" : ""}
                onClick={() => setSelectedTimeframe("7d")}
              >
                7 Days
              </button>

              <button
                type="button"
                className={selectedTimeframe === "30d" ? "active" : ""}
                onClick={() => setSelectedTimeframe("30d")}
              >
                30 Days
              </button>

              <button
                type="button"
                className={selectedTimeframe === "ytd" ? "active" : ""}
                onClick={() => setSelectedTimeframe("ytd")}
              >
                YTD
              </button>
            </div>
          </div>

          <div className="chart">
            {chartData[selectedTimeframe].map((item) => (
              <div className="chart-column" key={item.day}>
                <span className="chart-value">{item.value}</span>

                <div
                  className="chart-bar"
                  style={{ height: item.height }}
                ></div>

                <span className="chart-day">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="distribution-footer">
            <span>
              Average Delivery Route Time: <strong>42 minutes</strong>
            </span>

            <span>
              <strong>98.4% On-Time Delivery Rate</strong>
            </span>
          </div>
        </section>
      </div>
    </>
  );
}

export default LogisticsPage;