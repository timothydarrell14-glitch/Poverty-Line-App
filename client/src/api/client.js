const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "povertyLineToken";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const accessToken = token ?? localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
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
