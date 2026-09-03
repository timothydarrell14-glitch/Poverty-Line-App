import { apiRequest } from "./client";

export const listMembers = () => apiRequest("/api/auth/members");
