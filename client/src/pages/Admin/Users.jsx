import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiSearch,
  FiUserPlus,
} from "react-icons/fi";
import AdminTopbar from "../../components/Admin/AdminTopbar";
import SideBar from "../../components/Admin/SideBar";
import "../../styles/Admin/UsersPage.css";

const defaultUserDraft = {
  first_name: "",
  last_name: "",
  email: "",
  role: "Field Agent",
  password: "",
};

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userDraft, setUserDraft] = useState(defaultUserDraft);
  const [selectedUser, setSelectedUser] = useState(null);
  const [manageAction, setManageAction] = useState("role");
  const [newRole, setNewRole] = useState("Field Agent");
  const token = localStorage.getItem("accessToken");
  const loadUsers = () => fetch("/api/auth/users", { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).then((data) => setUsers(data.users ?? []));
  // The access token is read once when this protected page mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUsers().catch(() => setMessage("Could not load users.")); }, []);
  const filteredUsers = useMemo(() => users.filter((user) => (roleFilter === "All Roles" || user.role === roleFilter) && `${user.name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())), [users, roleFilter, searchTerm]);
  const pageSize = 5; const pageUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);

  async function createUser(event) {
    event.preventDefault();
    const { first_name, last_name, email, role, password } = userDraft;
    if (!first_name || !last_name || !email || !role || !password) {
      setMessage("Complete all user fields before saving.");
      return;
    }
    const response = await fetch("/api/auth/users", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ first_name, last_name, email, role, password }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message || "Could not create user.");
    setUsers((current) => [data.user, ...current]);
    setMessage("User created.");
    setUserDraft(defaultUserDraft);
    setShowCreateForm(false);
  }

  async function manageUser() {
    if (!selectedUser) return;
    const body = manageAction === "role" ? { role: newRole } : manageAction === "status" ? { is_active: selectedUser.status !== "Active" } : null;
    if (!body) {
      const response = await fetch(`/api/auth/users/${selectedUser.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.message || "Could not delete user.");
        return;
      }
      setMessage("User deleted.");
      setSelectedUser(null);
      return loadUsers();
    }
    const response = await fetch(`/api/auth/users/${selectedUser.id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (response.ok) {
      setUsers((current) => current.map((item) => item.id === selectedUser.id ? data.user : item));
      setSelectedUser(null);
      setMessage("User updated.");
    } else {
      setMessage(data.message || "Could not update user.");
    }
  }
  return (
    <div className="admin-users">
      <AdminTopbar pageClass="admin-users" searchId="global-user-search" placeholder="Search..." searchTerm={searchTerm} onSearchChange={(event) => setSearchTerm(event.target.value)} />

      <div className="admin-users__body">
        <SideBar />
        <main className="admin-users__main">
          <div className="admin-users__page-heading">
            <div>
              <h1>Users Management</h1>
              <p>Manage administrators, field agents, and partners.</p>
            </div>
            <button className="admin-users__add-button" type="button" onClick={() => setShowCreateForm(true)}>
              <FiUserPlus aria-hidden="true" />
              <span>Add New User</span>
            </button>
          </div>

          <section className="admin-users__filters" aria-label="User filters">
            <label className="admin-users__user-search" htmlFor="user-search">
              <FiSearch aria-hidden="true" />
              <input
                id="user-search"
                type="search"
                value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(0); }} placeholder="Search users by name or email..."
              />
            </label>
            <div
              className="admin-users__role-filters"
              role="group"
              aria-label="Role"
            >
              {["All Roles", "Admin", "Field Agent", "Partner"].map(
                (role) => (
                  <button
                    className={
                      roleFilter === role ? "admin-users__role-filter--active" : ""
                    }
                    type="button"
                    key={role}
                    onClick={() => { setRoleFilter(role); setPage(0); }}
                  >
                    {role}
                  </button>
                ),
              )}
            </div>
          </section>

          <section className="admin-users__table-panel" aria-label="Users">
            <div className="admin-users__table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>
                      <span className="admin-users__actions-heading">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-users__person">
                          <span className="admin-users__initials">{user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                          <div>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-users__role-badge">
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-users__status admin-users__status--${user.status.toLowerCase()}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>{user.lastActive}</td>
                      <td>
                        <button
                          className="admin-users__row-menu tooltip"
                          type="button"
                          aria-label={`Actions for ${user.name}`}
                          data-tooltip={`Actions for ${user.name}`}
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setManageAction("role");
                          }}
                        >
                          <FiMoreVertical aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="admin-users__pagination">
              <span>Showing {filteredUsers.length ? page * pageSize + 1 : 0} to {Math.min((page + 1) * pageSize, filteredUsers.length)} of {filteredUsers.length} users {message && `— ${message}`}</span>
              <div>
                <button className="tooltip" type="button" aria-label="Previous page" data-tooltip="Previous page" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <button className="tooltip" type="button" aria-label="Next page" data-tooltip="Next page" disabled={(page + 1) * pageSize >= filteredUsers.length} onClick={() => setPage((current) => current + 1)}>
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </footer>
          </section>
        </main>
      </div>

      {showCreateForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <form onSubmit={createUser} style={{ width: 420, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 24px 60px rgba(15,23,42,0.22)" }}>
            <h2 style={{ marginTop: 0 }}>Create user</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <input value={userDraft.first_name} onChange={(event) => setUserDraft((current) => ({ ...current, first_name: event.target.value }))} placeholder="First name" required />
              <input value={userDraft.last_name} onChange={(event) => setUserDraft((current) => ({ ...current, last_name: event.target.value }))} placeholder="Last name" required />
              <input type="email" value={userDraft.email} onChange={(event) => setUserDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required />
              <select value={userDraft.role} onChange={(event) => setUserDraft((current) => ({ ...current, role: event.target.value }))}>
                <option value="Admin">Admin</option>
                <option value="Field Agent">Field Agent</option>
                <option value="Partner">Partner</option>
              </select>
              <input type="password" value={userDraft.password} onChange={(event) => setUserDraft((current) => ({ ...current, password: event.target.value }))} placeholder="Temporary password" required />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button type="button" onClick={() => { setShowCreateForm(false); setUserDraft(defaultUserDraft); }}>Cancel</button>
              <button type="submit">Save User</button>
            </div>
          </form>
        </div>
      )}

      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <div style={{ width: 420, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 24px 60px rgba(15,23,42,0.22)" }}>
            <h2 style={{ marginTop: 0 }}>Manage {selectedUser.name}</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setManageAction("role")}>Change role</button>
                <button type="button" onClick={() => setManageAction("status")}>Toggle status</button>
                <button type="button" onClick={() => setManageAction("delete")}>Delete</button>
              </div>
              {manageAction === "role" && (
                <select value={newRole} onChange={(event) => setNewRole(event.target.value)}>
                  <option value="Admin">Admin</option>
                  <option value="Field Agent">Field Agent</option>
                  <option value="Partner">Partner</option>
                </select>
              )}
              {manageAction === "status" && <p>Set to {selectedUser.status === "Active" ? "Inactive" : "Active"}.</p>}
              {manageAction === "delete" && <p>Delete this user permanently?</p>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button type="button" onClick={() => setSelectedUser(null)}>Close</button>
              <button type="button" onClick={manageUser}>{manageAction === "delete" ? "Confirm delete" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
