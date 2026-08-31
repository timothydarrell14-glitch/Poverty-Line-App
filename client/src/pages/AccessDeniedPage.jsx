import { Link } from "react-router-dom";

function AccessDeniedPage() {
  return (
    <main>
      <h1>Admin access required</h1>
      <p>Your account does not have permission to view the admin dashboard.</p>
      <Link to="/login">Return to sign in</Link>
    </main>
  );
}

export default AccessDeniedPage;
