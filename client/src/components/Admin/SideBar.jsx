import { useState } from "react";
import {
  FiBox,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiGrid,
  FiMessageSquare,
  FiPlus,
  FiSettings,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminSession } from "../AdminSession";
import { useHelpTour } from "../../utils/useHelpTour";
import { mediaUrl } from "../../api/client";
import { capitalize } from "../../utils/capitalize";
import "../../styles/Admin/SideBar.css";

const navigationItems = [
  { label: "Dashboard", icon: FiGrid, to: "/admin", help: "Overview of programs, donations, and recent activity." },
  { label: "Users", icon: FiUsers, to: "/admin/users", help: "Manage staff, community members, and donations." },
  { label: "Programs", icon: FiBox, to: "/admin/programs", help: "Create, view, edit, and remove assistance programs." },
  { label: "Deliveries", icon: FiTruck, to: "/admin/deliveries", help: "Track and log shipments to communities." },
  { label: "Chats", icon: FiMessageSquare, to: "/admin/chats", help: "Message field agents and partners." },
  { label: "Settings", icon: FiSettings, to: "/admin/settings", help: "Manage organisation details and system preferences." },
];

function SideBar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, helpMode } = useAdminSession();
  const navigate = useNavigate();
  const helpTourStep = useHelpTour(helpMode, navigationItems.length + 2);
  const helpClass = (step) => `tooltip${helpMode ? " tooltip--help-mode" : ""}${helpTourStep === step ? " tooltip--pinned" : ""}`;

  return (
    <aside
      className={`admin-sidebar${isCollapsed ? " admin-sidebar--collapsed" : ""}`}
      aria-label="Admin navigation"
    >
      <div className="admin-sidebar__content">
        <button
          className={`admin-sidebar__collapse-button ${helpClass(0)}`}
          type="button"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          data-tooltip={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-help="Collapse sidebar\nShrinks the sidebar to icons only, to save space."
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        >
          {isCollapsed ? (
            <FiChevronsRight aria-hidden="true" />
          ) : (
            <FiChevronsLeft aria-hidden="true" />
          )}
        </button>
        <div className="admin-sidebar__identity">
          <img
            className="admin-sidebar__avatar"
            src={mediaUrl(user?.avatarUrl) || "https://api.dicebear.com/9.x/initials/svg?seed=" + encodeURIComponent(user?.name || "Admin")}
            alt=""
          />
          <div>
            <p className="admin-sidebar__name">{user?.name}</p>
            <p className="admin-sidebar__role">{capitalize(user?.role)}</p>
          </div>
        </div>

        <button
          className={`admin-sidebar__new-program ${helpClass(1)}`}
          type="button"
          data-tooltip="New Program"
          data-help="New Program\nJumps to Programs so you can create a new one."
          onClick={() => navigate("/admin/programs")}
        >
          <FiPlus aria-hidden="true" />
          <span>New Program</span>
        </button>

        <nav className="admin-sidebar__nav">
          <ul>
            {navigationItems.map(({ label, icon: Icon, to, help }, index) => (
              <li key={label}>
                <NavLink
                  className={({ isActive }) =>
                    `admin-sidebar__link ${helpClass(index + 2)}${isActive ? " admin-sidebar__link--active" : ""}`
                  }
                  data-tooltip={label}
                  data-help={`${label}\n${help}`}
                  end={to === "/admin"}
                  to={to}
                >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                    <FiChevronRight
                      className="admin-sidebar__active-arrow"
                      aria-hidden="true"
                    />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default SideBar;
