/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AdminSessionContext = createContext(null);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export function isAdmin(role) {
  return role?.trim().toLowerCase() === "admin";
}

export function AdminSessionProvider({ children }) {
  const [status, setStatus] = useState(() => localStorage.getItem("accessToken") ? "checking" : "denied");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("adminTheme") ?? "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("adminTheme", theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return undefined;
    const controller = new AbortController();

    fetch(`${apiBaseUrl}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to verify account access.");
        return response.json();
      })
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        setStatus(isAdmin(currentUser.role) ? "granted" : "denied");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("denied");
      });

    return () => controller.abort();
  }, []);

  const value = {
    status, user, theme,
    toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark"),
    logout: async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          await fetch(`${apiBaseUrl}/api/auth/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // Ignore logout API failures and clear local session anyway.
        }
      }
    },
    updateUser: async (profile) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not update profile.");
      setUser(payload.user);
      return payload.user;
    },
  };

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const session = useContext(AdminSessionContext);
  if (!session) throw new Error("useAdminSession must be used within AdminSessionProvider.");
  return session;
}
