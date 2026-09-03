import { apiRequest } from "./client";

export const getDashboardStats = () => apiRequest("/api/auth/dashboard-stats");
