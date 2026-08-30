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

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("accessToken");
  const loadUsers = () => fetch("/api/auth/users", { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).then((data) => setUsers(data.users ?? []));
  // The access token is read once when this protected page mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUsers().catch(() => setMessage("Could not load users.")); }, []);
  const filteredUsers = useMemo(() => users.filter((user) => (roleFilter === "All Roles" || user.role === roleFilter) && `${user.name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())), [users, roleFilter, searchTerm]);
  const pageSize = 5; const pageUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);
  async function createUser() {
    const name = window.prompt("Full name:"); const email = window.prompt("Email:"); const role = window.prompt("Role (Admin, Field Agent, or Partner):", "Field Agent"); const password = window.prompt("Temporary password:");
    if (!name || !email || !role || !password) return;
    const [first_name, ...last] = name.trim().split(/\s+/);
    const response = await fetch("/api/auth/users", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ first_name, last_name: last.join(" ") || "User", email, role, password }) });
    const data = await response.json(); if (!response.ok) return setMessage(data.message); setUsers((current) => [data.user, ...current]); setMessage("User created.");
  }
  async function manageUser(user) {
    const action = window.prompt("Enter: role, status, or delete"); if (!action) return;
    if (action === "delete" && window.confirm(`Delete ${user.name}?`)) { await fetch(`/api/auth/users/${user.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); return loadUsers(); }
    const body = action === "role" ? { role: window.prompt("New role:", user.role) } : action === "status" ? { is_active: user.status !== "Active" } : null;
    if (!body || Object.values(body).some((value) => value === null)) return;
    const response = await fetch(`/api/auth/users/${user.id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await response.json(); if (response.ok) setUsers((current) => current.map((item) => item.id === user.id ? data.user : item)); else setMessage(data.message);
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
            <button className="admin-users__add-button" type="button" onClick={createUser}>
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
                          onClick={() => manageUser(user)}
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
    </div>
  );
}

export default Users;
