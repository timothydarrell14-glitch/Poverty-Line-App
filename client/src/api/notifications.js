import { apiRequest } from "./client";

export const listNotifications = () => apiRequest("/api/auth/notifications");
export const markNotificationRead = (notificationId) =>
  apiRequest(`/api/auth/notifications/${notificationId}/read`, { method: "POST" });
export const markAllNotificationsRead = () =>
  apiRequest("/api/auth/notifications/read-all", { method: "POST" });
