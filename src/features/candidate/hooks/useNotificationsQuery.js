// src/features/candidate/hooks/useNotificationsQuery.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  fetchNotificationsRequest,
  normalizeNotificationsResponse,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from "@/features/candidate/api/notifications.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";
import { selectUserRole } from "@/features/auth/store/auth.selectors";

/**
 * Notifications list query with pagination.
 *
 * @param {Object} filters - Filter parameters
 * @param {number} filters.page - Page number (1-based)
 * @param {number} filters.limit - Items per page
 * @param {boolean} filters.unreadOnly - Only fetch unread notifications
 * @param {Object} options - Additional useQuery options
 */
export const useNotificationsQuery = (filters = {}, options = {}) => {
  const role = useSelector(selectUserRole);

  return useQuery({
    queryKey: candidateKeys.notifications.list(filters),
    enabled: role === "candidate",
    queryFn: async () => {
      try {
        const response = await fetchNotificationsRequest(filters);
        return normalizeNotificationsResponse(response);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 30_000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

/**
 * Mark single notification as read mutation.
 * Optimistically updates the notification in the cache.
 */
export const useMarkNotificationReadMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async (notificationId) => {
      await markNotificationReadRequest(notificationId);
      return notificationId;
    },
    onMutate: async (notificationId) => {
      if (role !== "candidate") return;

      await queryClient.cancelQueries({ queryKey: candidateKeys.notifications.list(), exact: false });

      const previousNotifications = queryClient.getQueriesData({ queryKey: candidateKeys.notifications.list(), exact: false });

      // Optimistically update all notification lists
      previousNotifications.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
            meta: { ...old.meta, unreadCount: Math.max(0, old.meta.unreadCount - 1) },
          };
        });
      });

      return { previousNotifications };
    },
    onError: (error, notificationId, context) => {
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.notifications.list(), exact: false });
    },
    ...options,
  });
};

/**
 * Mark all notifications as read mutation.
 */
export const useMarkAllNotificationsReadMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async () => {
      await markAllNotificationsReadRequest();
      return true;
    },
    onMutate: async () => {
      if (role !== "candidate") return;

      await queryClient.cancelQueries({ queryKey: candidateKeys.notifications.list(), exact: false });

      const previousNotifications = queryClient.getQueriesData({ queryKey: candidateKeys.notifications.list(), exact: false });

      previousNotifications.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) => ({ ...n, read: true })),
            meta: { ...old.meta, unreadCount: 0 },
          };
        });
      });

      return { previousNotifications };
    },
    onError: (error, variables, context) => {
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.notifications.list(), exact: false });
    },
    ...options,
  });
};