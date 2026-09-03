import { apiRequest } from "./client";

export const listDonations = () => apiRequest("/api/auth/donations");
export const listNonFinancialDonations = () => apiRequest("/api/auth/donations/non-financial");
