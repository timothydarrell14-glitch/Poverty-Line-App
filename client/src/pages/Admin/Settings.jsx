import { useEffect, useState } from "react";
import {
  FiBell,
  FiChevronDown,
  FiChevronRight,
  FiShield,
  FiKey,
  FiServer,
} from "react-icons/fi";
import AdminTopbar from "../../components/Admin/AdminTopbar";
import SideBar from "../../components/Admin/SideBar";
import "../../styles/Admin/SettingsPage.css";

const settingsTabs = [
  { label: "General", icon: FiServer, id: "general" },
  { label: "Security", icon: FiShield, id: "security" },
  { label: "Notifications", icon: FiBell, id: "notifications" },
  { label: "API Access", icon: FiKey, id: "api" },
];

const communicationPreferences = [
  {
    id: "system-alerts",
    label: "System Alerts",
    description: "Critical downtime and errors.",
    enabled: true,
  },
  {
    id: "new-user-signups",
    label: "New User Signups",
    description: "Daily digest of new volunteers.",
    enabled: false,
  },
  {
    id: "donation-receipts",
    label: "Donation Receipts",
    description: "BCC on automated receipts.",
    enabled: true,
  },
];

const systemPermissions = [
  {
    id: "data-export",
    label: "Data Export",
    description: "Allow downloading CSV reports of beneficiary data.",
    roles: ["Admin & Managers"],
    selectedRole: "Admin & Managers",
  },
  {
    id: "delete-programs",
    label: "Delete Programs",
    description: "Permanently remove active assistance programs.",
    roles: ["Super Admin"],
    selectedRole: "Super Admin",
  },
];

function Settings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [orgDetails, setOrgDetails] = useState({
    orgName: "Poverty Line Initiative",
    supportEmail: "support@povertyline.org",
    publicDescription: "Bridging the gap between communities in need and resources.",
  });
  const [preferences, setPreferences] = useState(
    communicationPreferences.reduce((acc, pref) => {
      acc[pref.id] = pref.enabled;
      return acc;
    }, {})
  );
  const [permissions, setPermissions] = useState({
    dataExport: "Admin & Managers",
    deletePrograms: "Super Admin",
  });
  const [isExpanded, setIsExpanded] = useState({
    communication: true,
    permissions: true,
  });
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("/api/auth/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data?.settings) return;
        const generalSettings = data.settings.filter((setting) => setting.category === "general");
        const next = Object.fromEntries(generalSettings.map((setting) => [setting.key, setting.value]));
        if (next.orgName || next.supportEmail || next.publicDescription) {
          setOrgDetails((current) => ({ ...current, orgName: next.orgName ?? current.orgName, supportEmail: next.supportEmail ?? current.supportEmail, publicDescription: next.publicDescription ?? current.publicDescription }));
        }
      })
      .catch(() => undefined);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrgDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (id) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePermissionChange = (id, value) => {
    setPermissions((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");
    const payload = [
      { key: "orgName", value: orgDetails.orgName, category: "general" },
      { key: "supportEmail", value: orgDetails.supportEmail, category: "general" },
      { key: "publicDescription", value: orgDetails.publicDescription, category: "general" },
      { key: "communicationPreferences", value: JSON.stringify(preferences), category: "notifications" },
      { key: "systemPermissions", value: JSON.stringify(permissions), category: "security" },
    ];

    await Promise.all(payload.map((setting) => fetch("/api/auth/settings", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(setting),
    })));

    localStorage.setItem("adminSettings", JSON.stringify({ orgDetails, preferences, permissions }));
    setSaveStatus("Changes saved");
  };

  const handleExpand = (section) => {
    setIsExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const roleOptions = ["Admin & Managers", "Super Admin", "All Users"];

  return (
    <div className="admin-settings">
      <AdminTopbar pageClass="admin-settings" searchId="settings-search" placeholder="Search settings..." searchTerm={searchTerm} onSearchChange={(event) => setSearchTerm(event.target.value)} />

      <div className="admin-settings__body">
        <SideBar />
        <main className="admin-settings__main">
          <div className="admin-settings__heading">
            <div>
              <h1>System Settings</h1>
              <p>Manage application preferences, security protocols, and external integrations.</p>
            </div>
          </div>

          <div className="admin-settings__content-grid">
            <aside className="settings-sidebar">
              <nav className="settings-sidebar__nav" aria-label="Settings sections">
                <ul>
                  {settingsTabs.map(({ label, icon: Icon, id }) => (
                    <li key={id}>
                      <button
                        className={`settings-sidebar__tab${activeTab === id ? " settings-sidebar__tab--active" : ""}`}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        aria-current={activeTab === id ? "page" : undefined}
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                        <FiChevronRight
                          className="settings-sidebar__active-arrow"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <section className="settings-content">
              {activeTab === "general" && (
                <div className="settings-panel">
                  <h2>General Organization Details</h2>
                  <div className="settings-panel__rule" />
                  <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="settings-form__group">
                      <label htmlFor="org-name">Organization Name</label>
                      <input
                        id="org-name"
                        name="orgName"
                        type="text"
                        value={orgDetails.orgName}
                        onChange={handleInputChange}
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div className="settings-form__group">
                      <label htmlFor="support-email">Support Email</label>
                      <input
                        id="support-email"
                        name="supportEmail"
                        type="email"
                        value={orgDetails.supportEmail}
                        onChange={handleInputChange}
                        placeholder="Enter support email"
                      />
                    </div>
                    <div className="settings-form__group">
                      <label htmlFor="public-description">Public Description</label>
                      <textarea
                        id="public-description"
                        name="publicDescription"
                        value={orgDetails.publicDescription}
                        onChange={handleInputChange}
                        placeholder="Enter public description"
                        rows={4}
                      />
                    </div>
                    <button
                      className="settings-form__save"
                      type="button"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                    {saveStatus && <span className="settings-form__save-status" role="status">{saveStatus}</span>}
                  </form>
                </div>
              )}

              {activeTab === "security" && (
                <div className="settings-panel">
                  <h2>Security Settings</h2>
                  <div className="settings-panel__rule" />
                  <p className="settings-panel__description">
                    Configure authentication, authorization, and security policies.
                  </p>
                  <div className="settings-placeholder">
                    <FiShield size={48} />
                    <p>Security settings coming soon...</p>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="settings-panel">
                  <h2>Notification Settings</h2>
                  <div className="settings-panel__rule" />
                  <p className="settings-panel__description">
                    Configure email and push notification preferences.
                  </p>
                  <div className="settings-placeholder">
                    <FiBell size={48} />
                    <p>Notification settings coming soon...</p>
                  </div>
                </div>
              )}

              {activeTab === "api" && (
                <div className="settings-panel">
                  <h2>API Access</h2>
                  <div className="settings-panel__rule" />
                  <p className="settings-panel__description">
                    Manage API keys, webhooks, and third-party integrations.
                  </p>
                  <div className="settings-placeholder">
                    <FiKey size={48} />
                    <p>API access settings coming soon...</p>
                  </div>
                </div>
              )}

              <div className="settings-additional">
                <div className="settings-additional__panel">
                  <button
                    className="settings-additional__header"
                    type="button"
                    onClick={() => handleExpand("communication")}
                  >
                    <h3>Communication Preferences</h3>
                    <FiChevronDown
                      className={`settings-additional__chevron${isExpanded.communication ? " settings-additional__chevron--rotated" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isExpanded.communication && (
                    <div className="settings-additional__content">
                      <p className="settings-additional__description">
                        Configure which notifications are sent via email.
                      </p>
                      <div className="settings-toggles">
                        {communicationPreferences.map((pref) => (
                          <label
                            key={pref.id}
                            className="settings-toggle"
                          >
                            <span className="settings-toggle__info">
                              <strong>{pref.label}</strong>
                              <span>{pref.description}</span>
                            </span>
                            <button
                              className={`settings-toggle__switch${preferences[pref.id] ? " settings-toggle__switch--on" : ""}`}
                              type="button"
                              onClick={() => handleToggle(pref.id)}
                              aria-pressed={preferences[pref.id]}
                            >
                              <span className="settings-toggle__knob" />
                            </button>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="settings-additional__panel">
                  <button
                    className="settings-additional__header"
                    type="button"
                    onClick={() => handleExpand("permissions")}
                  >
                    <h3>System Permissions</h3>
                    <FiChevronDown
                      className={`settings-additional__chevron${isExpanded.permissions ? " settings-additional__chevron--rotated" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isExpanded.permissions && (
                    <div className="settings-additional__content">
                      <p className="settings-additional__description">
                        Manage what roles can access sensitive administrative actions.
                      </p>
                      <div className="settings-permissions">
                        {systemPermissions.map((perm) => (
                          <div key={perm.id} className="settings-permission">
                            <div className="settings-permission__info">
                              <strong>{perm.label}</strong>
                              <span>{perm.description}</span>
                            </div>
                            <div className="settings-permission__select">
                              <select
                                value={permissions[perm.id]}
                                onChange={(e) => handlePermissionChange(perm.id, e.target.value)}
                              >
                                {roleOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
export default Settings;
