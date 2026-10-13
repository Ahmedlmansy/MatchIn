import { useDispatch } from "react-redux";
import { loginRequest, meRequest } from "../api/auth.api";
import { setCredentials } from "../store/auth.slice";
import { setAccessToken } from "@/services/axios/tokenStore";
import { useApiMutation } from "./useApiMutation";

/**
 * Login.
 *
 * The POST /api/auth/login response sets the httpOnly session cookie, so there
 * is nothing useful to store from it — but some deployments also echo a `user`
 * object back, and that copy is NOT authoritative.
 *
 * This used to prefer the echoed user:
 *
 *     const user = data?.user ?? (await meRequest());
 *
 * That is exactly backwards. The echoed user can be a stale or partially
 * hydrated copy whose `role` disagrees with the real session, and the whole
 * app routes off `user.role`. A real failure this caused: an administrator
 * whose login response carried role "candidate" was routed into the candidate
 * tree, got redirected to /dashboard/onboarding, and the candidate-only
 * /api/candidate/profile call 401'd — which the axios interceptor answered by
 * refreshing, failing, and dispatching clearCredentials(), bouncing the admin
 * straight back to the login page.
 *
 * So /auth/me is now the only source of truth for the user. It costs one extra
 * round trip on login and removes a whole class of "logged in but logged
 * straight back out" bugs. The echoed user is used only if /auth/me is
 * unreachable, which is strictly better than trusting a possibly-wrong copy.
 */
export const useLoginMutation = ({ onAuthenticated } = {}) => {
  const dispatch = useDispatch();

  return useApiMutation({
    mutationFn: async (variables) => {
      const data = await loginRequest(variables);

      // Capture the bearer token BEFORE anything else. /auth/me is called
      // below and it has to go out authenticated — previously the token was
      // discarded here, so that call 401'd, which the refresh flow then turned
      // into a logout. setAccessToken is synchronous, so the very next request
      // already carries the header.
      const token = data?.access_token ?? data?.token ?? null;
      if (token) setAccessToken(token);

      // /auth/me is the authoritative view of the current session. The user
      // echoed by the login response is not trusted for `role` (it can be a
      // stale copy, and routing hangs off it) but is used as a fallback if
      // /auth/me is unreachable.
      let user = data?.user;
      try {
        user = (await meRequest()) ?? user;
      } catch {
        // Keep the login payload rather than failing an otherwise-good login.
      }

      // `token` is written back into Redux, which the store subscription mirrors
      // into tokenStore — so this stays the single source of truth.
      dispatch(setCredentials({ user, token }));
      return user;
    },
    onSuccess: (user) => onAuthenticated?.(user),
  });
};