import { apiRequest } from "./client";

const queryString = (params = {}) =>
  new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  ).toString();

// PUBLIC ORGANISATION ENDPOINTS

export const listOrganisations = (params = {}) => {
  const query = queryString(params);

  return apiRequest(
    `/api/organisations${query ? `?${query}` : ""}`
  );
};

export const getOrganisation = (organisationId) =>
  apiRequest(`/api/organisations/${organisationId}`);

// LOGGED-IN ORGANISATION ENDPOINTS

export const createOrganisation = (organisation) =>
  apiRequest("/api/organisations", {
    method: "POST",
    body: organisation,
  });

export const updateOrganisation = (
  organisationId,
  changes
) =>
  apiRequest(`/api/organisations/${organisationId}`, {
    method: "PATCH",
    body: changes,
  });

export const deleteOrganisation = (organisationId) =>
  apiRequest(`/api/organisations/${organisationId}`, {
    method: "DELETE",
  });

// ADMIN ORGANISATION ENDPOINTS

export const listAdminOrganisations = (params = {}) => {
  const query = queryString(params);

  return apiRequest(
    `/api/organisations/admin${query ? `?${query}` : ""}`
  );
};

export const createAdminOrganisation = (organisation) =>
  apiRequest("/api/organisations/admin", {
    method: "POST",
    body: organisation,
  });

export const getAdminOrganisation = (organisationId) =>
  apiRequest(`/api/organisations/admin/${organisationId}`);

export const updateAdminOrganisation = (
  organisationId,
  changes
) =>
  apiRequest(`/api/organisations/admin/${organisationId}`, {
    method: "PATCH",
    body: changes,
  });

export const deleteAdminOrganisation = (
  organisationId
) =>
  apiRequest(`/api/organisations/admin/${organisationId}`, {
    method: "DELETE",
  });