// src/features/candidate/api/notifications.api.js
import { api } from "@/services/axios/axiosInstance";

const unwrapServerData = (response) => response?.data?.data ?? response?.data ?? response;

/**
 * GET /api/notifications
 * Query params: page, limit, unreadOnly
 * Returns: { data: Notification[], meta: { total, page, limit, totalPages, unreadCount } }
 */
export const fetchNotificationsRequest = (params = {}) =>
  api.get("/api/notifications", { params }).then(unwrapServerData);

/**
 * PATCH /api/notifications/{notificationId}/read
 * Returns: { data: { read: true } }
 */
export const markNotificationReadRequest = (notificationId) =>
  api.patch(`/api/notifications/${notificationId}/read`).then((res) => res.data);

/**
 * PATCH /api/notifications/read-all
 * Returns: { data: { count: number } }
 */
export const markAllNotificationsReadRequest = () =>
  api.patch("/api/notifications/read-all").then((res) => res.data);

/**
 * Normalize notification item
 */
export const normalizeNotification = (item) => ({
  id: item.id,
  type: item.type ?? "platform",
  group: item.group ?? (item.isRecent ? "TODAY" : "EARLIER"),
  title: item.title,
  description: item.description ?? item.message ?? "",
  time: item.time ?? item.createdAt ?? item.created_at,
  read: item.read ?? false,
  // Navigation
  actionUrl: item.actionUrl ?? item.action_url,
  entityId: item.entityId ?? item.entity_id,
  entityType: item.entityType ?? item.entity_type,
});

/**
 * Normalize notifications response
 */
export const normalizeNotificationsResponse = (response) => {
  const data = unwrapServerData(response);
  if (!data) return { notifications: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0, unreadCount: 0 } };

  const notifications = Array.isArray(data) ? data : data.data ?? data.items ?? [];
  const meta = data.meta ?? data.pagination ?? { total: notifications.length, page: 1, limit: 20, totalPages: 1 };
  const unreadCount = data.unreadCount ?? notifications.filter((n) => !n.read).length ?? 0;

  return {
    notifications: notifications.map(normalizeNotification),
    meta: { ...meta, unreadCount },
  };
};