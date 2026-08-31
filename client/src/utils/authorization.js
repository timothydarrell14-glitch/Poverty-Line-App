export function isAdmin(role) {
  return role?.trim().toLowerCase() === "admin";
}
