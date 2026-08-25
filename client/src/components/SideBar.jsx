import {
  FiBox,
  FiChevronRight,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMessageSquare,
  FiMoon,
  FiPlus,
  FiSettings,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import "../styles/Admin/SideBar.css";

const navigationItems = [
  { label: "Dashboard", icon: FiGrid },
  { label: "Users", icon: FiUsers },
  { label: "Programs", icon: FiBox },
  { label: "Deliveries", icon: FiTruck },
  { label: "Chats", icon: FiMessageSquare },
  { label: "Settings", icon: FiSettings },
];

function SideBar({ activeItem = "Dashboard" }) {
  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar__content">
        <div className="admin-sidebar__identity">
          <img
            className="admin-sidebar__avatar"
            src="https://i.pravatar.cc/96?img=12"
            alt="Admin user"
          />
          <div>
            <p className="admin-sidebar__name">Timothy N. Darrell</p>
            <p className="admin-sidebar__role">Admin</p>
          </div>
        </div>

        <button className="admin-sidebar__new-program" type="button">
          <FiPlus aria-hidden="true" />
          <span>New Program</span>
        </button>

        <nav className="admin-sidebar__nav">
          <ul>
            {navigationItems.map(({ label, icon: Icon }) => {
              const isActive = label === activeItem;

              return (
                <li key={label}>
                  <a
                    className={`admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`}
                    href={`#${label.toLowerCase()}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                    {isActive && (
                      <FiChevronRight
                        className="admin-sidebar__active-arrow"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="admin-sidebar__footer">
        <button className="admin-sidebar__footer-action" type="button">
          <FiMoon aria-hidden="true" />
          <span>Theme Toggle</span>
        </button>
        <a
          className="admin-sidebar__footer-action admin-sidebar__footer-action--logout"
          href="#logout"
        >
          <FiLogOut aria-hidden="true" />
          <span>Logout</span>
        </a>
        <button
          className="admin-sidebar__help"
          type="button"
          aria-label="Help and support"
        >
          <FiHelpCircle aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

export default SideBar;
