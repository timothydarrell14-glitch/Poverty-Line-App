import { apiRequest } from "./client";

export const listDonations = () => apiRequest("/api/auth/donations");
