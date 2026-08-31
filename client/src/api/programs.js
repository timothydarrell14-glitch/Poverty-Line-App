import { apiRequest } from "./client";

const queryString = (params = {}) => new URLSearchParams(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
).toString();

export const listAdminPrograms = (params) => apiRequest(`/api/programs/admin?${queryString(params)}`);
export const createAdminProgram = (program) => apiRequest("/api/programs/admin", { method: "POST", body: program });
export const getAdminProgram = (programId) => apiRequest(`/api/programs/admin/${programId}`);
export const updateAdminProgram = (programId, changes) => apiRequest(`/api/programs/admin/${programId}`, { method: "PATCH", body: changes });
export const deleteAdminProgram = (programId) => apiRequest(`/api/programs/admin/${programId}`, { method: "DELETE" });
