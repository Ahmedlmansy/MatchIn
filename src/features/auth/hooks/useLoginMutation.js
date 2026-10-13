import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { loginRequest, meRequest } from "../api/auth.api";
import { setCredentials } from "../store/auth.slice";
import { useApiMutation } from "./useApiMutation";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";

// The login response sets the httpOnly session cookie, so there is nothing to
// store client-side. Some deployments still echo { user } back; when they do not,
// we read it from /auth/me instead — one extra call, always correct.
export const useLoginMutation = ({ onAuthenticated } = {}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: async (variables) => {
      const data = await loginRequest(variables);
      const user = data?.user ?? (await meRequest());
      dispatch(setCredentials({ user }));
      queryClient.removeQueries({ queryKey: candidateKeys.all });
      return user;
    },
    onSuccess: (user) => onAuthenticated?.(user),
  });
};
