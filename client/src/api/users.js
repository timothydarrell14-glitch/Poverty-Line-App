import { apiRequest } from "./client";

const queryString = (params = {}) => new URLSearchParams(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
).toString();

export const registerUser = (user) => apiRequest("/api/users/register", { method: "POST", body: user });
export const loginUser = (credentials) => apiRequest("/api/users/login", { method: "POST", body: credentials });
export const getCurrentUser = () => apiRequest("/api/users/me");
export const logoutUser = () => apiRequest("/api/users/logout", { method: "POST" });
export const listAdminUsers = (params) => apiRequest(`/api/users/admin?${queryString(params)}`);
export const createAdminUser = (user) => apiRequest("/api/users/admin", { method: "POST", body: user });
export const getAdminUser = (userId) => apiRequest(`/api/users/admin/${userId}`);
export const updateAdminUser = (userId, changes) => apiRequest(`/api/users/admin/${userId}`, { method: "PATCH", body: changes });
export const deleteAdminUser = (userId) => apiRequest(`/api/users/admin/${userId}`, { method: "DELETE" });
