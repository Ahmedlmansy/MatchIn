// src/features/auth/hooks/useInitializeAuth.js
import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { meRequest, refreshTokenRequest } from "../api/auth.api";
import { setCredentials, clearCredentials } from "../store/auth.slice";
import { selectAuthStatus } from "../store/auth.selectors";
import { getAccessToken, setAccessToken } from "@/services/axios/tokenStore";

/**
 * Call once at the app root (see app/providers.jsx) to resolve the session
 * before any route guard decides whether to redirect.
 *
 * ── Why this is more than "GET /auth/me" ──────────────────────────────────
 * The app supports two session styles (see axiosInstance): an httpOnly cookie,
 * or an `access_token` bearer header. A bearer token lives in memory, so a page
 * reload starts with none — yet the browser may still hold a valid *refresh*
 * cookie. Probing only /auth/me would 401 on every reload and log the user out
 * mid-session. So on a 401 with no token in hand we attempt one refresh and
 * re-probe before giving up.
 *
 * ── Why the resolution handlers check the store ───────────────────────────
 * The `status !== "loading"` guard stops us *starting* a second check, but it
 * does nothing about one already in flight. That was a real bug:
 *
 *   1. Boot fires /auth/me — sent before the user has logged in, so it
 *      carries no session cookie.
 *   2. The user logs in. setCredentials() sets status "authenticated".
 *   3. /dashboard renders fine.
 *   4. The *stale* boot request finally resolves — and 401s, because it was
 *      sent before the credential existed.
 *   5. Its .catch() dispatched clearCredentials(), and RequireAuth bounced the
 *      user straight back to the login page.
 *
 * So the handlers read the store's *current* state and stand down if a real
 * auth decision has already been made. Reading the store directly (rather than
 * the `status` from the render closure) is what makes this work — the closure
 * value is stale by definition here.
 */
export const useInitializeAuth = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    if (status !== "loading") return undefined;

    const controller = new AbortController();
    // "Has anyone else already decided?" Anything other than "loading" means a
    // login, logout or a newer check owns the outcome now.
    const isSuperseded = () => store.getState().auth.status !== "loading";

    const establishSession = async () => {
      try {
        // Happy path: a still-valid cookie, or a token we already hold.
        const user = await meRequest({ signal: controller.signal });
        if (isSuperseded()) return;
        dispatch(setCredentials({ user, token: getAccessToken() }));
        return;
      } catch {
        if (controller.signal.aborted || isSuperseded()) return;
      }

      // Reload of a bearer session: no in-memory token, but the browser may
      // still hold a refresh cookie. One refresh attempt, then re-probe.
      try {
        const token = await refreshTokenRequest();
        if (token) setAccessToken(token);

        const user = await meRequest({ signal: controller.signal });
        if (isSuperseded()) return;
        dispatch(setCredentials({ user, token: token ?? getAccessToken() }));
      } catch {
        if (controller.signal.aborted || isSuperseded()) return;
        dispatch(clearCredentials());
      }
    };

    establishSession();

    return () => controller.abort();
  }, [status, dispatch, store]);
};