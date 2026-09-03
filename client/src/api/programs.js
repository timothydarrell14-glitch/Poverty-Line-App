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

// ============================================================
// ADMIN PROGRAM ENDPOINTS
// ============================================================

// Get all programs for admin
export const listAdminPrograms = (params = {}) => {
  const query = queryString(params);

  return apiRequest(
    `/api/programs/admin${query ? `?${query}` : ""}`
  );
};

// Create a program as admin
export const createAdminProgram = (program) =>
  apiRequest("/api/programs/admin", {
    method: "POST",
    body: program,
  });

// Get a single program as admin
export const getAdminProgram = (programId) =>
  apiRequest(`/api/programs/admin/${programId}`);

// Update a program as admin
export const updateAdminProgram = (
  programId,
  changes
) =>
  apiRequest(`/api/programs/admin/${programId}`, {
    method: "PATCH",
    body: changes,
  });

// Delete a program as admin
export const deleteAdminProgram = (programId) =>
  apiRequest(`/api/programs/admin/${programId}`, {
    method: "DELETE",
  });


// ============================================================
// NORMAL / LOGGED-IN USER PROGRAM ENDPOINTS
// ============================================================

// Get programs
// Can also be filtered by organisation_id, status, category, etc.
export const listPrograms = (params = {}) => {
  const query = queryString(params);

  return apiRequest(
    `/api/programs${query ? `?${query}` : ""}`
  );
};

// Get a single program
export const getProgram = (programId) =>
  apiRequest(`/api/programs/${programId}`);

// Create a program
export const createProgram = (program) =>
  apiRequest("/api/programs", {
    method: "POST",
    body: program,
  });

// Update a program
export const updateProgram = (
  programId,
  changes
) =>
  apiRequest(`/api/programs/${programId}`, {
    method: "PATCH",
    body: changes,
  });

// Delete a program
export const deleteProgram = (programId) =>
  apiRequest(`/api/programs/${programId}`, {
    method: "DELETE",
  });