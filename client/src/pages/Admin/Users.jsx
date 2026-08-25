function Users() {
  return (
    <>
      <div>
        <div>
          <h1>Users Management</h1>
          <p>Manage users of the application</p>
        </div>
        <div>
          <button>Add User</button>
        </div>
      </div>
      <div>
        <div>
          <input type="text" placeholder="Search users" />
        </div>
        <div>
          <nav>
            <ul>
              <li>
                <h3>All Roles</h3>
              </li>
              <li>
                <h3>Admin</h3>
              </li>
              <li>
                <h3>Partner</h3>
              </li>
              <li>
                <h3>User</h3>
              </li>
              <li>
                <h3>Organisation</h3>
              </li>
            </ul>
          </nav>
        </div>
        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through users and display them here */}
              <tr>
                <td>John Doe</td>
                <td>john.doe@example.com</td>
                <td>Admin</td>
                <td>Active</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Users;
