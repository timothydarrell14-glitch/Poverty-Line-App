import { apiRequest } from "./client";

const queryString = (params = {}) => new URLSearchParams(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
).toString();

export const listAdminOrganisations = (params) => apiRequest(`/api/organisations/admin?${queryString(params)}`);
export const createAdminOrganisation = (organisation) => apiRequest("/api/organisations/admin", { method: "POST", body: organisation });
export const getAdminOrganisation = (organisationId) => apiRequest(`/api/organisations/admin/${organisationId}`);
export const updateAdminOrganisation = (organisationId, changes) => apiRequest(`/api/organisations/admin/${organisationId}`, { method: "PATCH", body: changes });
export const deleteAdminOrganisation = (organisationId) => apiRequest(`/api/organisations/admin/${organisationId}`, { method: "DELETE" });
