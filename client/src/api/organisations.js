import { apiRequest } from "./client";

const queryString = (params = {}) => new URLSearchParams(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
).toString();

export const listAdminOrganisations = (params) => apiRequest(`/organisations/admin?${queryString(params)}`);
export const createAdminOrganisation = (organisation) => apiRequest("/organisations/admin", { method: "POST", body: organisation });
