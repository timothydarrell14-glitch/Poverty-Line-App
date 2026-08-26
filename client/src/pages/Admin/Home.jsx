import {
  FiBell,
  FiBox,
  FiChevronRight,
  FiEdit2,
  FiFileText,
  FiHelpCircle,
  FiLogOut,
  FiMoon,
  FiSearch,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import SideBar from "../../components/Admin/SideBar"
import "../../styles/Admin/Home.css";

const activities = [
  {
    type: "delivery",
    title: "Shipment #402 Delivered",
    time: "2 hours ago",
    description:
      "Essential medical supplies successfully delivered to the North District Community Center.",
    icon: FiBox,
  },
  {
    type: "program",
    title: "New Program Launched",
    time: "Yesterday",
    description:
      "The 'Urban Nutrition Center' initiative is now live and accepting volunteer registrations.",
    icon: FiUser,
    tags: ["Nutrition", "Urban"],
  },
  {
    type: "partner",
    title: "Partner Onboarded",
    time: "Oct 12",
    description:
      "Global Aid Corp has officially signed the partnership agreement for Q4 initiatives.",
    icon: FiUsers,
  },
];

function Home() {
  return (
    <div className="admin-home">
      <header className="admin-home__topbar">
        <Link className="admin-home__brand" to="/admin">
          Poverty Line
        </Link>
        <div className="admin-home__topbar-content">
          <label className="admin-home__search" htmlFor="admin-search">
            <FiSearch aria-hidden="true" />
            <input id="admin-search" type="search" placeholder="Search..." />
          </label>
          <div className="admin-home__topbar-actions">
            <button type="button" aria-label="Notifications">
              <FiBell aria-hidden="true" />
              <span className="admin-home__notification-dot" />
            </button>
            <button type="button" aria-label="Help">
              <FiHelpCircle aria-hidden="true" />
            </button>
            <button type="button" aria-label="Account">
              <FiUser aria-hidden="true" />
            </button>
            <button type="button" aria-label="Theme toggle">
              <FiMoon aria-hidden="true" />
            </button>
            <button
              className="admin-home__logout"
              type="button"
              aria-label="Logout"
            >
              <FiLogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="admin-home__body">
        <SideBar />
        <div className="admin-home__workspace">
        <main className="admin-home__main">
          <section
            className="admin-home__profile"
            aria-labelledby="admin-profile-name"
          >
            <img
              className="admin-home__cover-image"
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80"
              alt="City skyline at sunset"
            />
            <div className="admin-home__profile-content">
              <img
                className="admin-home__profile-avatar"
                src="https://i.pravatar.cc/144?img=12"
              />
              <div className="admin-home__profile-copy">
                <h1 id="admin-profile-name">Timothy Darrell</h1>
                <p>System Administrator</p>
              </div>
              <button className="admin-home__edit-profile" type="button">
                <FiEdit2 aria-hidden="true" />
                <span>Edit Profile</span>
              </button>
            </div>
          </section>

          <div className="admin-home__dashboard-grid">
            <div className="admin-home__left-column">
              <section
                className="admin-home__panel admin-home__impact"
                aria-labelledby="global-impact-heading"
              >
                <h2 id="global-impact-heading">Global Impact</h2>
                <div className="admin-home__panel-rule" />
                <div className="admin-home__program-total">
                  <strong>42</strong>
                  <span>Active Programs</span>
                </div>
                <div className="admin-home__impact-stats">
                  <div>
                    <strong>$1.2M</strong>
                    <span>Donations</span>
                  </div>
                  <div>
                    <strong>156</strong>
                    <span>Partnerships</span>
                  </div>
                </div>
              </section>

              <section
                className="admin-home__panel admin-home__quick-actions"
                aria-labelledby="quick-actions-heading"
              >
                <h2 id="quick-actions-heading">Quick Actions</h2>
                <div className="admin-home__quick-action-list">
                  <button type="button">
                    <span className="admin-home__action-icon admin-home__action-icon--teal">
                      <FiFileText aria-hidden="true" />
                    </span>
                    <span>New Program</span>
                    <FiChevronRight aria-hidden="true" />
                  </button>
                  <button type="button">
                    <span className="admin-home__action-icon admin-home__action-icon--green">
                      <FiBox aria-hidden="true" />
                    </span>
                    <span>Generate Report</span>
                    <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </section>
            </div>

            <section
              className="admin-home__panel admin-home__activities"
              aria-labelledby="recent-activity-heading"
            >
              <div className="admin-home__activities-heading">
                <h2 id="recent-activity-heading">Recent Activity</h2>
                <a href="#all-activity">View All</a>
              </div>
              <div className="admin-home__panel-rule" />
              <ol className="admin-home__activity-list">
                {activities.map(
                  ({ type, title, time, description, icon: Icon, tags }) => (
                    <li className="admin-home__activity" key={title}>
                      <span
                        className={`admin-home__activity-icon admin-home__activity-icon--${type}`}
                      >
                        <Icon aria-hidden="true" />
                      </span>
                      <article>
                        <div className="admin-home__activity-title-row">
                          <h3>{title}</h3>
                          <time>{time}</time>
                        </div>
                        <p>{description}</p>
                        {tags && (
                          <div className="admin-home__activity-tags">
                            {tags.map((tag) => (
                              <span key={tag}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </article>
                    </li>
                  ),
                )}
              </ol>
            </section>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
export default Home;
