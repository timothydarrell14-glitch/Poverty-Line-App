import { useState } from "react";
import { FiBell, FiHelpCircle, FiLogOut, FiMoon, FiSearch, FiSun, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAdminSession } from "../AdminSession";

function AdminTopbar({ pageClass, searchClass = `${pageClass}__global-search`, searchId, placeholder, searchTerm = "", onSearchChange, showNotificationDot = false }) {
  const [notice, setNotice] = useState("");
  const { user, theme, toggleTheme, logout } = useAdminSession();
  const navigate = useNavigate();
  const dismissNotice = () => setNotice("");

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className={`${pageClass}__topbar`}>
      <Link className={`${pageClass}__brand`} to="/admin">Poverty Line</Link>
      <div className={`${pageClass}__topbar-content`}>
        <label className={searchClass} htmlFor={searchId}>
          <FiSearch aria-hidden="true" />
          <input id={searchId} type="search" value={searchTerm} onChange={onSearchChange} placeholder={placeholder} />
        </label>
        <div className={`${pageClass}__topbar-actions`}>
          <button className="tooltip" type="button" aria-label="Notifications" data-tooltip="Notifications" onClick={() => setNotice("No new notifications.")}><FiBell aria-hidden="true" />{showNotificationDot && <span className="admin-home__notification-dot" />}</button>
          <button className="tooltip" type="button" aria-label="Help" data-tooltip="Help" onClick={() => setNotice("Help centre coming in the next release.")}><FiHelpCircle aria-hidden="true" /></button>
          <button className="tooltip" type="button" aria-label="Account" data-tooltip="Account" onClick={() => navigate("/admin/settings")}><FiUser aria-hidden="true" /></button>
          <button className="tooltip" type="button" aria-label="Theme toggle" data-tooltip={`Use ${theme === "dark" ? "light" : "dark"} theme`} onClick={toggleTheme}>{theme === "dark" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}</button>
          <button className={`${pageClass}__logout tooltip`} type="button" aria-label="Logout" data-tooltip="Logout" onClick={handleLogout}><FiLogOut aria-hidden="true" /></button>
          {notice && <button className="admin-topbar__notice" type="button" onClick={dismissNotice}>{notice}</button>}
          <span className="sr-only">Signed in as {user?.name}</span>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
