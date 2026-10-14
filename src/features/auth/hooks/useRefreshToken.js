import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { refreshTokenRequest, meRequest } from "../api/auth.api";
import { setCredentials, clearCredentials } from "../store/auth.slice";

/**
 * Hook to manually trigger a token refresh.
 * The automatic refresh on 401 is handled by the axios interceptor in axiosInstance.js.
 * This hook is useful for:
 * - Proactive token refresh before expiry
 * - Manual retry after a failed refresh
 * - Testing scenarios
 *
 * Returns { refreshToken, isRefreshing, refreshError }
 */
export const useRefreshToken = () => {
  const dispatch = useDispatch();

  const refreshToken = useCallback(async () => {
    try {
      // Call the refresh endpoint (backend sets new httpOnly cookie)
      await refreshTokenRequest();

      // Re-fetch user to ensure Redux state is in sync (mirrors login flow)
      const user = await meRequest();
      dispatch(setCredentials({ user }));

      return { success: true, user };
    } catch (error) {
      // Refresh failed — clear auth state
      dispatch(clearCredentials());
      return { success: false, error };
    }
  }, [dispatch]);

  return { refreshToken };
};