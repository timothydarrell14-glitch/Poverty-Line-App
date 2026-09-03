import { apiRequest } from "./client";

export const listDonors = () => apiRequest("/api/auth/donors");