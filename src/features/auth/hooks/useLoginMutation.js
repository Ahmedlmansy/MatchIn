import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { loginRequest, meRequest } from "../api/auth.api";
import { setCredentials, updateUser } from "../store/auth.slice";
import { setAccessToken } from "@/services/axios/tokenStore";
import { useApiMutation } from "./useApiMutation";

/**
 * Login.
 *
 * Two things must happen here, and both were previously missing:
 *
 * 1. **Capture the access token.** /api/auth/login returns `access_token`, and
 *    the backend authorises with `Authorization: Bearer <token>`. Dispatching
 *    `setCredentials({ user })` with no token left Redux's `auth.token` null,
 *    the store subscription pushed null into tokenStore, and the request
 *    interceptor therefore attached no header — so every authenticated call went
 *    out anonymous and came back 401 "Unauthenticated."
 *
 * 2. **Know the user's role.** Every route in the app branches on `user.role`,
 *    so a missing or wrong role sends the account into the wrong workspace.
 *    /auth/me is authoritative, but it costs a second round-trip.
 *
 * ── Why /auth/me no longer blocks navigation ──────────────────────────────────
 * Measured against the dev backend through its Cloudflare tunnel:
 *
 *     run 1:  login 20.1s  +  /auth/me  7.2s  =>  27.3s before the app rendered
 *     run 2:  login  3.5s  +  /auth/me  0.7s  =>   4.2s
 *     run 3:  login  6.7s  +  /auth/me  0.7s  =>   7.4s
 *
 * Awaiting /auth/me unconditionally added 0.7–7.2s of dead time to every login,
 * because the two calls are strictly sequential — the cookie and bearer token
 * have to exist before /auth/me means anything. On a backend this slow it was
 * the single largest contributor to "it loads forever after I log in".
 *
 * So the blocking call is now conditional: the login response usually already
 * carries a complete user, and that is enough to route. /auth/me only blocks
 * when it can't route anyone — no user at all, or no role on it. When it is
 * skipped it still runs afterwards as a background revalidation that corrects
 * the role if the echoed copy was stale. Same correctness, none of the latency.
 *
 * The query cache is cleared on success so a previous account's data can never
 * bleed through into the new session.
 */
export const useLoginMutation = ({ onAuthenticated } = {}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: async (variables) => {
      const data = await loginRequest(variables);

      // Set the token *before* any follow-up call and before the dispatch, so
      // the very next request already carries the header. setAccessToken is
      // synchronous — that is the whole reason it exists.
      const token = data?.access_token ?? data?.token ?? null;
      if (token) setAccessToken(token);

      // The echoed user is usable only if it can actually route someone: a user
      // with no role sends every guard down the same branch as an unknown role,
      // which is the exact failure this whole dance exists to prevent.
      const echoed = data?.user ?? null;
      const echoedIsRoutable = Boolean(echoed?.role ?? echoed?.user_type);

      let user = echoed;

      if (echoedIsRoutable) {
        // Fast path — dispatch and navigate now, correct the role afterwards.
        revalidateInBackground(dispatch, token, echoed.role ?? echoed.user_type);
      } else {
        try {
          user = (await meRequest()) ?? echoed;
        } catch {
          // /auth/me unavailable and the payload had no user — keep the login
          // payload rather than failing an otherwise-successful login.
        }
      }

      // `token` goes back into Redux, which the store subscription mirrors into
      // tokenStore, so Redux stays the single source of truth.
      dispatch(setCredentials({ user, token }));

      // Drop every cached read, not just the candidate ones. This used to
      // remove only candidateKeys, on the assumption that the rest of the cache
      // could not outlive a session — but a session can end without going
      // through logout: a failed token refresh dispatches clearCredentials() on
      // its own and leaves the cache untouched. Sign in as someone else
      // afterwards and the previous account's admin lists are still in memory,
      // rendered under the new account's session. queryClient.clear() is what
      // logout already does, so this makes the two ends of a session agree.
      queryClient.clear();

      return user;
    },
    onSuccess: (user) => onAuthenticated?.(user),
  });
};

/**
 * Ask /auth/me who the session really belongs to and correct the role if the
 * login response echoed a stale one. Deliberately un-awaited: the user is
 * already navigating, so a wrong role gets fixed milliseconds later instead of
 * before the first paint.
 *
 * Skipped entirely when no bearer token came back, because without one a 401
 * here would trip the interceptor's refresh-and-clear path and log the user
 * straight back out — the worst possible outcome for a call that exists only
 * as a nicety.
 */
function revalidateInBackground(dispatch, token, echoedRole) {
  if (!token) return;

  meRequest()
    .then((fresh) => {
      const nextRole = fresh?.role ?? fresh?.user_type;
      if (!nextRole) return;

      // updateUser merges into a new object, so dispatching unconditionally
      // would re-render every auth subscriber for an identical payload.
      if (nextRole === echoedRole) return;

      dispatch(updateUser({ role: nextRole }));
    })
    .catch(() => {
      // A failed revalidation must never surface: navigation has already
      // happened on the echoed role and there is nothing useful to retry.
    });
}