import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdmin } from "../utils/authorization";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function AdminRoute() {
  const [access, setAccess] = useState(() =>
    localStorage.getItem("accessToken") ? "checking" : "denied",
  );
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("accessToken");

    if (!token) return () => controller.abort();

    async function checkAccess() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          setAccess("denied");
          return;
        }

        const { user } = await response.json();
        setAccess(isAdmin(user.role) ? "granted" : "denied");
      } catch (error) {
        if (error.name !== "AbortError") setAccess("denied");
      }
    }

    checkAccess();
    return () => controller.abort();
  }, []);

  if (access === "checking") return <p>Checking account access…</p>;
  if (access === "denied") {
    return <Navigate replace to="/access-denied" state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default AdminRoute;
