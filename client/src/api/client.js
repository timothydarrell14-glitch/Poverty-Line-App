const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
import { getAccessToken } from "../utils/auth";

export const apiUrl = (path = "") =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Resolves a relative media path (e.g. uploaded avatar) against the API host. */
export const mediaUrl = (path) => {
  if (!path) return path;
  return /^(https?:)?\/\//.test(path) ? path : apiUrl(path);
};

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const accessToken = token ?? getAccessToken();
  const response = await fetch(apiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message ?? payload?.error ?? "Request failed.");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}
