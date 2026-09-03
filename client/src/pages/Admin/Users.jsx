import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiKey,
  FiMoreVertical,
  FiSearch,
  FiShield,
  FiToggleLeft,
  FiTrash2,
  FiUserPlus,
  FiUsers,
  FiUserCheck,
  FiHeart,
  FiX,
} from "react-icons/fi";
import AdminTopbar from "../../components/Admin/AdminTopbar";
import SideBar from "../../components/Admin/SideBar";
import { apiUrl } from "../../api/client";
import { getAccessToken } from "../../utils/auth";
import { listMembers } from "../../api/members";
import { listDonations } from "../../api/donations";
import { listDonors } from "../../api/donors";
import "../../styles/Admin/UsersPage.css";

const defaultUserDraft = {
  first_name: "",
  last_name: "",
  email: "",
  role: "member",
  password: "",
};

const statusOptions = ["Active", "Inactive", "On Leave", "Retired"];
const pageSize = 5;
const formatCurrency = (amount, currency = "KES") => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
const usersTabs = [
  { id: "staff", label: "Staff", icon: FiUsers },
  { id: "members", label: "Members", icon: FiUserCheck },
  { id: "donors", label: "Donors", icon: FiHeart },
  { id: "donations", label: "Donations", icon: FiHeart },
];

function Users() {
  const [activeTab, setActiveTab] = useState("staff");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [donationsLoaded, setDonationsLoaded] = useState(false);
  const [donorsLoaded, setDonorsLoaded] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userDraft, setUserDraft] = useState(defaultUserDraft);
  const [selectedUser, setSelectedUser] = useState(null);
  const [manageAction, setManageAction] = useState("role");
  const [newRole, setNewRole] = useState("member");
  const [newStatus, setNewStatus] = useState("Active");
  const token = getAccessToken();
  const loadUsers = () => fetch(apiUrl("/api/auth/users"), { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).then((data) => setUsers(data.users ?? []));
  // The access token is read once when this protected page mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUsers().catch(() => setMessage("Could not load users.")); }, []);

  function selectTab(tabId) {
    setActiveTab(tabId);
    setSearchTerm("");
    setPage(0);
    setMessage("");
    if (tabId === "members" && !membersLoaded) {
      setMembersLoaded(true);
      listMembers().then((data) => setMembers(data.members ?? [])).catch(() => setMessage("Could not load members."));
    }
    if (tabId === "donations" && !donationsLoaded) {
      setDonationsLoaded(true);
      listDonations().then((data) => setDonations(data.donations ?? [])).catch(() => setMessage("Could not load donations."));
    }
    if (tabId === "donors" && !donorsLoaded) {
      setDonorsLoaded(true);
      listDonors().then((data) => setDonors(data.donors ?? [])).catch(() => setMessage("Could not load donors."));
    }
  }

  const filteredUsers = useMemo(() => users.filter((user) => (roleFilter === "All Roles" || user.role === roleFilter) && `${user.name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())), [users, roleFilter, searchTerm]);
  const pageUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);

  const filteredMembers = useMemo(() => members.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(searchTerm.toLowerCase())), [members, searchTerm]);
  const pageMembers = filteredMembers.slice(page * pageSize, (page + 1) * pageSize);

  const filteredDonations = useMemo(() => donations.filter((donation) => `${donation.donorName} ${donation.programTitle}`.toLowerCase().includes(searchTerm.toLowerCase())), [donations, searchTerm]);
  const pageDonations = filteredDonations.slice(page * pageSize, (page + 1) * pageSize);
  const filteredDonors = useMemo(() => donors.filter((donor) => `${donor.name} ${donor.email}`.toLowerCase().includes(searchTerm.toLowerCase())), [donors, searchTerm]);
  const pageDonors = filteredDonors.slice(page * pageSize, (page + 1) * pageSize);

  async function createUser(event) {
    event.preventDefault();
    const { first_name, last_name, email, role, password } = userDraft;
    if (!first_name || !last_name || !email || !role || !password) {
      setMessage("Complete all user fields before saving.");
      return;
    }
    const response = await fetch(apiUrl("/api/auth/users"), { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ first_name, last_name, email, role, password }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message || "Could not create user.");
    setUsers((current) => [data.user, ...current]);
    setMessage("User created.");
    setUserDraft(defaultUserDraft);
    setShowCreateForm(false);
  }

  async function manageUser() {
    if (!selectedUser) return;
    const body = manageAction === "role" ? { role: newRole } : manageAction === "status" ? { status: newStatus } : null;
    if (!body) {
      const response = await fetch(apiUrl(`/api/auth/users/${selectedUser.id}`), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.message || "Could not delete user.");
        return;
      }
      setMessage("User deleted.");
      setSelectedUser(null);
      return loadUsers();
    }
    const response = await fetch(apiUrl(`/api/auth/users/${selectedUser.id}`), { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
              <p>Manage administrators, field agents, partners, community members, and donations.</p>
            </div>
            {activeTab === "staff" && (
              <button className="admin-users__add-button" type="button" onClick={() => setShowCreateForm(true)}>
                <FiUserPlus aria-hidden="true" />
                <span>Add New User</span>
              </button>
            )}
          </div>

          <nav className="admin-users__tabs" role="tablist" aria-label="Users sections">
            {usersTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                className={`admin-users__tab${activeTab === id ? " admin-users__tab--active" : ""}`}
                onClick={() => selectTab(id)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <section className="admin-users__filters" aria-label={`${activeTab} filters`}>
            <label className="admin-users__user-search" htmlFor="user-search">
              <FiSearch aria-hidden="true" />
              <input
                id="user-search"
                type="search"
                value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(0); }} placeholder={`Search ${activeTab}...`}
              />
            </label>
            {activeTab === "staff" && (
              <div
                className="admin-users__role-filters"
                role="group"
                aria-label="Role"
              >
                {["All Roles", "admin", "member", "donor", "partner"].map(
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
            )}
          </section>

          {activeTab === "staff" && (
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
                          className={`admin-users__status admin-users__status--${user.status.toLowerCase().replace(/\s+/g, "-")}`}
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
                            setNewStatus(user.status);
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
          )}

          {activeTab === "members" && (
          <section className="admin-users__table-panel" aria-label="Members">
            <div className="admin-users__table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Classification</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {pageMembers.length ? pageMembers.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="admin-users__person">
                          <span className="admin-users__initials">{member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                          <div>
                            <strong>{member.name}</strong>
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{member.location || "Unknown"}</td>
                      <td>{member.povertyClassification || "Not assessed"}</td>
                      <td>
                        <span className={`admin-users__status admin-users__status--${member.status.toLowerCase().replace(/\s+/g, "-")}`}>{member.status}</span>
                      </td>
                      <td>{member.joined}</td>
                    </tr>
                  )) : (
                    <tr><td className="admin-users__empty-cell" colSpan={5}>{message || "No members found."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="admin-users__pagination">
              <span>Showing {filteredMembers.length ? page * pageSize + 1 : 0} to {Math.min((page + 1) * pageSize, filteredMembers.length)} of {filteredMembers.length} members</span>
              <div>
                <button className="tooltip" type="button" aria-label="Previous page" data-tooltip="Previous page" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <button className="tooltip" type="button" aria-label="Next page" data-tooltip="Next page" disabled={(page + 1) * pageSize >= filteredMembers.length} onClick={() => setPage((current) => current + 1)}>
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </footer>
          </section>
          )}

          {activeTab === "donors" && (
          <section className="admin-users__table-panel" aria-label="Donors">
            <div className="admin-users__table-scroll">
              <table>
                <thead>
                  <tr><th>Donor</th><th>Phone</th><th>Completed donations</th><th>Total donated</th></tr>
                </thead>
                <tbody>
                  {pageDonors.length ? pageDonors.map((donor) => (
                    <tr key={donor.id}>
                      <td>
                        <div className="admin-users__person">
                          <span className="admin-users__initials">{donor.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                          <div><strong>{donor.name}</strong><span>{donor.email}</span></div>
                        </div>
                      </td>
                      <td>{donor.phone || "—"}</td>
                      <td>{donor.donationCount}</td>
                      <td>{formatCurrency(donor.totalDonated)}</td>
                    </tr>
                  )) : <tr><td className="admin-users__empty-cell" colSpan={4}>{message || "No donors found."}</td></tr>}
                </tbody>
              </table>
            </div>
            <footer className="admin-users__pagination">
              <span>Showing {filteredDonors.length ? page * pageSize + 1 : 0} to {Math.min((page + 1) * pageSize, filteredDonors.length)} of {filteredDonors.length} donors</span>
              <div>
                <button className="tooltip" type="button" aria-label="Previous page" data-tooltip="Previous page" disabled={page === 0} onClick={() => setPage((current) => current - 1)}><FiChevronLeft aria-hidden="true" /></button>
                <button className="tooltip" type="button" aria-label="Next page" data-tooltip="Next page" disabled={(page + 1) * pageSize >= filteredDonors.length} onClick={() => setPage((current) => current + 1)}><FiChevronRight aria-hidden="true" /></button>
              </div>
            </footer>
          </section>
          )}

          {activeTab === "donations" && (
          <section className="admin-users__table-panel" aria-label="Donations">
            <div className="admin-users__table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Program</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pageDonations.length ? pageDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td>
                        <div className="admin-users__person">
                          <span className="admin-users__initials">{donation.donorName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                          <div>
                            <strong>{donation.donorName}</strong>
                            {donation.donorEmail && <span>{donation.donorEmail}</span>}
                          </div>
                        </div>
                      </td>
                      <td>{donation.programTitle}</td>
                      <td>{formatCurrency(donation.amount, donation.currency)}</td>
                      <td>{donation.paymentMethod || "—"}</td>
                      <td>
                        <span className={`admin-users__status admin-users__status--${donation.status === "completed" ? "active" : "inactive"}`}>{donation.status}</span>
                      </td>
                      <td>{donation.date}</td>
                    </tr>
                  )) : (
                    <tr><td className="admin-users__empty-cell" colSpan={6}>{message || "No donations found."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="admin-users__pagination">
              <span>Showing {filteredDonations.length ? page * pageSize + 1 : 0} to {Math.min((page + 1) * pageSize, filteredDonations.length)} of {filteredDonations.length} donations</span>
              <div>
                <button className="tooltip" type="button" aria-label="Previous page" data-tooltip="Previous page" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <button className="tooltip" type="button" aria-label="Next page" data-tooltip="Next page" disabled={(page + 1) * pageSize >= filteredDonations.length} onClick={() => setPage((current) => current + 1)}>
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </footer>
          </section>
          )}
        </main>
      </div>

      {showCreateForm && (
        <div className="admin-users__modal-backdrop" role="presentation" onClick={() => setShowCreateForm(false)}>
          <form className="admin-users__modal" onSubmit={createUser} onClick={(event) => event.stopPropagation()}>
            <div className="admin-users__modal-header">
              <h2>Create user</h2>
              <button type="button" aria-label="Close" onClick={() => { setShowCreateForm(false); setUserDraft(defaultUserDraft); }}><FiX aria-hidden="true" /></button>
            </div>
            <div className="admin-users__modal-body">
              <label>First name<input value={userDraft.first_name} onChange={(event) => setUserDraft((current) => ({ ...current, first_name: event.target.value }))} placeholder="First name" required /></label>
              <label>Last name<input value={userDraft.last_name} onChange={(event) => setUserDraft((current) => ({ ...current, last_name: event.target.value }))} placeholder="Last name" required /></label>
              <label>Email<input type="email" value={userDraft.email} onChange={(event) => setUserDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required /></label>
              <label>Role
                <select value={userDraft.role} onChange={(event) => setUserDraft((current) => ({ ...current, role: event.target.value }))}>
                  <option value="member">Member</option>
                  <option value="donor">Donor</option>
                  <option value="admin">Admin</option>
                  <option value="partner">Partner</option>
                </select>
              </label>
              <label>Temporary password<input type="password" value={userDraft.password} onChange={(event) => setUserDraft((current) => ({ ...current, password: event.target.value }))} placeholder="Temporary password" required /></label>
            </div>
            <div className="admin-users__modal-actions">
              <button type="button" className="admin-users__modal-cancel" onClick={() => { setShowCreateForm(false); setUserDraft(defaultUserDraft); }}>Cancel</button>
              <button type="submit" className="admin-users__modal-confirm">Save User</button>
            </div>
          </form>
        </div>
      )}

      {selectedUser && (
        <div className="admin-users__modal-backdrop" role="presentation" onClick={() => setSelectedUser(null)}>
          <div className="admin-users__modal admin-users__manage-modal" role="dialog" aria-labelledby="manage-user-heading" onClick={(event) => event.stopPropagation()}>
            <div className="admin-users__modal-header">
              <div className="admin-users__manage-identity">
                <span className="admin-users__initials">{selectedUser.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                <div>
                  <h2 id="manage-user-heading">{selectedUser.name}</h2>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              <button type="button" aria-label="Close" onClick={() => setSelectedUser(null)}><FiX aria-hidden="true" /></button>
            </div>

            <div className="admin-users__manage-tabs" role="tablist" aria-label="Manage user actions">
              <button type="button" role="tab" aria-selected={manageAction === "role"} className={`tooltip${manageAction === "role" ? " admin-users__manage-tab--active" : ""}`} data-tooltip="Change role" onClick={() => setManageAction("role")}>
                <FiShield aria-hidden="true" />
                <span>Role</span>
              </button>
              <button type="button" role="tab" aria-selected={manageAction === "status"} className={`tooltip${manageAction === "status" ? " admin-users__manage-tab--active" : ""}`} data-tooltip="Change status" onClick={() => setManageAction("status")}>
                <FiToggleLeft aria-hidden="true" />
                <span>Status</span>
              </button>
              <button type="button" role="tab" aria-selected={manageAction === "delete"} className={`tooltip admin-users__manage-tab--danger${manageAction === "delete" ? " admin-users__manage-tab--active" : ""}`} data-tooltip="Delete user" onClick={() => setManageAction("delete")}>
                <FiTrash2 aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>

            <div className="admin-users__manage-body">
              {manageAction === "role" && (
                <label>Assign role
                  <select value={newRole} onChange={(event) => setNewRole(event.target.value)}>
                    <option value="member">Member</option>
                    <option value="donor">Donor</option>
                    <option value="admin">Admin</option>
                    <option value="partner">Partner</option>
                  </select>
                </label>
              )}
              {manageAction === "status" && (
                <label>Account status
                  <select value={newStatus} onChange={(event) => setNewStatus(event.target.value)}>
                    {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <span className="admin-users__manage-hint"><FiKey aria-hidden="true" /> Inactive and Retired accounts cannot sign in.</span>
                </label>
              )}
              {manageAction === "delete" && (
                <p className="admin-users__manage-warning">This permanently deletes {selectedUser.name}&apos;s account. This cannot be undone.</p>
              )}
            </div>

            <div className="admin-users__modal-actions">
              <button type="button" className="admin-users__modal-cancel" onClick={() => setSelectedUser(null)}>Close</button>
              <button type="button" className={manageAction === "delete" ? "admin-users__modal-danger" : "admin-users__modal-confirm"} onClick={manageUser}>{manageAction === "delete" ? "Confirm delete" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
