import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminSessionProvider, useAdminSession } from "./AdminSession";

function AdminRoute() {
  return <AdminSessionProvider><AdminAccess /></AdminSessionProvider>;
}

function AdminAccess() {
  const { status } = useAdminSession();
  const location = useLocation();
  if (status === "checking") return <p>Checking account access…</p>;
  if (status === "denied") {
    return <Navigate replace to="/access-denied" state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default AdminRoute;
