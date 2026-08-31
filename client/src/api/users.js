import { apiRequest } from "./client";

const queryString = (params = {}) => new URLSearchParams(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
).toString();

export const registerUser = (user) => apiRequest("/users/register", { method: "POST", body: user });
export const loginUser = (credentials) => apiRequest("/users/login", { method: "POST", body: credentials });
export const getCurrentUser = () => apiRequest("/users/me");
export const logoutUser = () => apiRequest("/users/logout", { method: "POST" });
export const listAdminUsers = (params) => apiRequest(`/users/admin?${queryString(params)}`);
export const createAdminUser = (user) => apiRequest("/users/admin", { method: "POST", body: user });
export const updateAdminUser = (userId, changes) => apiRequest(`/users/admin/${userId}`, { method: "PATCH", body: changes });
export const deleteAdminUser = (userId) => apiRequest(`/users/admin/${userId}`, { method: "DELETE" });
