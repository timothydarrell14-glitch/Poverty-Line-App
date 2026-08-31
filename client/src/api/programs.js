import { apiRequest } from "./client";

const queryString = (params = {}) => new URLSearchParams(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
).toString();

export const listAdminPrograms = (params) => apiRequest(`/programs/admin?${queryString(params)}`);
export const createAdminProgram = (program) => apiRequest("/programs/admin", { method: "POST", body: program });
export const updateAdminProgram = (programId, changes) => apiRequest(`/programs/admin/${programId}`, { method: "PATCH", body: changes });
export const deleteAdminProgram = (programId) => apiRequest(`/programs/admin/${programId}`, { method: "DELETE" });
