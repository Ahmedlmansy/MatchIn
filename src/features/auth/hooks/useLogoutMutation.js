import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { logoutRequest } from "@/features/auth/api/auth.api";
import { clearCredentials } from "@/features/auth/store/auth.slice";
import { useLocalizedPath } from "@/utils/routes";
import { useNavigate } from "react-router-dom";

/**
 * Logout mutation.
 * Calls the backend logout endpoint, then clears local auth state and query cache.
 * Even if the backend call fails (e.g., 404/405), we still clear local state and redirect.
 */
export const useLogoutMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      // Always clear local state regardless of server response
      dispatch(clearCredentials());
      queryClient.clear();
      navigate(localizedPath("/auth/login"), { replace: true });
    },
  });
};