const AUTH_TOKEN_KEY = "povertyLineAccessToken";
const AUTH_USER_KEY = "povertyLineUser";
const LOGIN_STATUS_KEY = "povertyLineLoggedIn";

export const saveAuthSession = ({
  access_token: token,
  user,
}) => {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify(user)
  );
  sessionStorage.setItem(
    LOGIN_STATUS_KEY,
    "true"
  );

  window.dispatchEvent(
    new Event("povertyline-auth-change")
  );
};

export const clearAuthSession = () => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(LOGIN_STATUS_KEY);

  localStorage.removeItem("accessToken");
  localStorage.removeItem("povertyLineToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("user");

  window.dispatchEvent(
    new Event("povertyline-auth-change")
  );
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem(AUTH_USER_KEY) ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("user") ||
        "null"
    );
  } catch {
    return null;
  }
};

export const getAccessToken = () =>
  sessionStorage.getItem(AUTH_TOKEN_KEY) ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("povertyLineToken");

export const isAuthenticated = () => {
  return Boolean(
    getAccessToken() && getCurrentUser()
  );
};

export const isAdmin = () => {
  return (
    getCurrentUser()?.role
      ?.trim()
      .toLowerCase() === "admin"
  );
};