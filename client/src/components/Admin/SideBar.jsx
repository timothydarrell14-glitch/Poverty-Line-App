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
import "../../styles/Admin/SideBar.css";

const navigationItems = [
  { label: "Dashboard", icon: FiGrid, to: "/admin" },
  { label: "Users", icon: FiUsers, to: "/admin/users" },
  { label: "Programs", icon: FiBox, to: "/admin/programs" },
  { label: "Deliveries", icon: FiTruck, to: "/admin/deliveries" },
  { label: "Chats", icon: FiMessageSquare, to: "/admin/chats" },
  { label: "Settings", icon: FiSettings, to: "/admin/settings" },
];

function SideBar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAdminSession();
  const navigate = useNavigate();

  return (
    <aside
      className={`admin-sidebar${isCollapsed ? " admin-sidebar--collapsed" : ""}`}
      aria-label="Admin navigation"
    >
      <div className="admin-sidebar__content">
        <button
          className="admin-sidebar__collapse-button tooltip"
          type="button"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          data-tooltip={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
            src="https://i.pravatar.cc/96?img=12"
            alt=""
          />
          <div>
            <p className="admin-sidebar__name">{user?.name}</p>
            <p className="admin-sidebar__role">{user?.role}</p>
          </div>
        </div>

        <button className="admin-sidebar__new-program" type="button" onClick={() => navigate("/admin/programs")}>
          <FiPlus aria-hidden="true" />
          <span>New Program</span>
        </button>

        <nav className="admin-sidebar__nav">
          <ul>
            {navigationItems.map(({ label, icon: Icon, to }) => (
              <li key={label}>
                <NavLink
                  className={({ isActive }) =>
                    `admin-sidebar__link tooltip${isActive ? " admin-sidebar__link--active" : ""}`
                  }
                  data-tooltip={label}
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
