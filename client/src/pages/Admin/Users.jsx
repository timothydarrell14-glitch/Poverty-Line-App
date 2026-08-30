import { useState } from "react";
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

const users = [
  {
    name: "Sarah Jenkins",
    email: "sarah.j@povertyline.org",
    role: "Admin",
    status: "Active",
    lastActive: "2 hours ago",
    avatar: "https://i.pravatar.cc/80?img=47",
  },
  {
    name: "Marcus Chen",
    email: "m.chen@field.org",
    role: "Field Agent",
    status: "Active",
    lastActive: "Yesterday",
    avatar: "https://i.pravatar.cc/80?img=13",
  },
  {
    name: "Local Provisions Inc.",
    email: "contact@localprov.com",
    role: "Partner",
    status: "Pending",
    lastActive: "Never",
    initials: "LP",
  },
  {
    name: "Elena Rodriguez",
    email: "erodriguez@field.org",
    role: "Field Agent",
    status: "Active",
    lastActive: "Oct 12, 2023",
    avatar: "https://i.pravatar.cc/80?img=45",
  },
];

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
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
            <button className="admin-users__add-button" type="button">
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
                placeholder="Search users by name or email..."
              />
            </label>
            <div
              className="admin-users__role-filters"
              role="group"
              aria-label="Role"
            >
              {["All Roles", "Admin", "Field Agent", "Partner"].map(
                (role, index) => (
                  <button
                    className={
                      index === 0 ? "admin-users__role-filter--active" : ""
                    }
                    type="button"
                    key={role}
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
                  {users.map((user) => (
                    <tr key={user.email}>
                      <td>
                        <div className="admin-users__person">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" />
                          ) : (
                            <span className="admin-users__initials">
                              {user.initials}
                            </span>
                          )}
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
              <span>Showing 1 to 4 of 24 users</span>
              <div>
                <button className="tooltip" type="button" aria-label="Previous page" data-tooltip="Previous page">
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <button className="tooltip" type="button" aria-label="Next page" data-tooltip="Next page">
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
