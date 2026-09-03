import { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiDollarSign,
  FiHelpCircle,
  FiLogOut,
  FiMoon,
  FiSearch,
  FiSun,
  FiUserPlus,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAdminSession } from "../AdminSession";
import { useTheme } from "../../context/ThemeContext";
import { useHelpTour } from "../../utils/useHelpTour";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../api/notifications";
import "../../styles/Admin/AdminTopbar.css";

const notificationIcons = {
  donation: FiDollarSign,
  program_completed: FiCheckCircle,
  new_partner: FiUserPlus,
};

const helpSteps = [
  "Search\nUse the search bar to filter the records shown on the current page.",
  "Notifications\nShows recent donations, completed programs, and new partners. Click one to mark it read.",
  "Theme toggle\nSwitches the admin workspace between light and dark mode.",
  "Logout\nSigns you out of the admin workspace.",
];

function AdminTopbar({ pageClass, searchClass = `${pageClass}__global-search`, searchId, placeholder, searchTerm = "", onSearchChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const { user, logout, helpMode, toggleHelpMode } = useAdminSession();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const helpTourStep = useHelpTour(helpMode, helpSteps.length);
  const helpClass = (step) => `tooltip${helpMode ? " tooltip--help-mode" : ""}${helpTourStep === step ? " tooltip--pinned" : ""}`;

  useEffect(() => {
    listNotifications()
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => setNotificationError("Could not load notifications. Check that the server is running."));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function handleNotificationClick(notification) {
    if (!notification.isRead) {
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await markNotificationRead(notification.id);
      } catch {
        // Keep the optimistic update; the next refresh will reconcile state.
      }
    }
  }

  async function handleMarkAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // Keep the optimistic update; the next refresh will reconcile state.
    }
  }

  return (
    <header className={`${pageClass}__topbar`}>
      <Link className={`${pageClass}__brand`} to="/admin">Poverty Line</Link>
      <div className={`${pageClass}__topbar-content`}>
        <label className={searchClass} htmlFor={searchId}>
          <span className={helpClass(0)} data-tooltip="Search" data-help={helpSteps[0]}>
            <FiSearch aria-hidden="true" />
          </span>
          <input id={searchId} type="search" value={searchTerm} onChange={onSearchChange} placeholder={placeholder} />
        </label>
        <div className={`${pageClass}__topbar-actions`} ref={panelRef}>
          <div className="admin-topbar__menu">
            <button className={helpClass(1)} type="button" aria-label="Notifications" data-tooltip="Notifications" data-help={helpSteps[1]} onClick={() => setIsNotificationsOpen((open) => !open)}>
              <FiBell aria-hidden="true" />
              {unreadCount > 0 && <span className="admin-home__notification-dot" />}
            </button>
            {isNotificationsOpen && (
              <div className="admin-topbar__panel" role="menu" aria-label="Notifications">
                <div className="admin-topbar__panel-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && <button type="button" onClick={handleMarkAllRead}>Mark all read</button>}
                </div>
                {notificationError ? (
                  <p className="admin-topbar__empty" role="alert">{notificationError}</p>
                ) : notifications.length ? (
                  <ul className="admin-topbar__notification-list">
                    {notifications.map((notification) => {
                      const Icon = notificationIcons[notification.type] ?? FiBell;
                      return (
                        <li key={notification.id}>
                          <button
                            type="button"
                            className={`admin-topbar__notification${notification.isRead ? "" : " admin-topbar__notification--unread"}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <span className={`admin-topbar__notification-icon admin-topbar__notification-icon--${notification.type}`}>
                              <Icon aria-hidden="true" />
                            </span>
                            <span className="admin-topbar__notification-body">
                              <strong>{notification.title}</strong>
                              <span>{notification.message}</span>
                              <time>{formatRelativeTime(notification.createdAt)}</time>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="admin-topbar__empty">No notifications yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="admin-topbar__menu">
            <button
              className={`tooltip${helpMode ? " admin-topbar__help-toggle--on" : ""}`}
              type="button"
              aria-label="Help"
              aria-pressed={helpMode}
              data-tooltip={helpMode ? "Turn off help labels" : "Turn on help labels"}
              onClick={toggleHelpMode}
            >
              <FiHelpCircle aria-hidden="true" />
            </button>
          </div>

          <button className={helpClass(2)} type="button" aria-label="Theme toggle" data-tooltip={`Use ${theme === "dark" ? "light" : "dark"} theme`} data-help={helpSteps[2]} onClick={toggleTheme}>{theme === "dark" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}</button>
          <button className={`${pageClass}__logout ${helpClass(3)}`} type="button" aria-label="Logout" data-tooltip="Logout" data-help={helpSteps[3]} onClick={handleLogout}><FiLogOut aria-hidden="true" /></button>
          <span className="sr-only">Signed in as {user?.name}</span>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
