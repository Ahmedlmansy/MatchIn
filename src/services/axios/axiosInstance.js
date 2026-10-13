import axios from "axios";
import { detectInitialLanguage } from "@/features/language/store/language.slice";
import { getAccessToken, setAccessToken } from "./tokenStore";

/**
 * Marks a request as belonging to the refresh machinery, so its own 401 can
 * never re-enter the refresh queue and no (by definition stale) bearer token is
 * attached to it. Used by the refresh call itself and by the /auth/me that
 * follows it. Mirrored in features/auth/api/auth.api.js to avoid an import
 * cycle.
 */
const REFRESH_HEADER = "x-skillmatch-refresh-retry";

/**
 * Request timeout in milliseconds.
 *
 * Measured against the current dev backend (through its Cloudflare tunnel):
 * GET /api/auth/me ~0.3s, POST /api/auth/login 2.6–7.9s depending on load.
 * The old 10s ceiling sat right on top of login's worst case, so a slow run
 * aborted a request that would have succeeded a second later — surfacing as a
 * mysterious "timeout" on a perfectly valid login.
 *
 * 30s is deliberately generous: it is a ceiling for a genuinely hung request,
 * not an expectation. The real fix for slow logins is server-side (password
 * hashing cost, DB latency) — raise this only if the backend gets slower.
 *
 * Override with VITE_API_TIMEOUT (ms) in .env; restart the dev server to pick
 * it up, since Vite reads env at startup.
 */
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30_000;

// The one app-wide client (convention §4.2). The session token is an httpOnly
// cookie the backend sets on login / email verification, so JS never holds it
// — `withCredentials` is what makes the browser attach it to every call.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const existingHeader =
    config.headers?.["Accept-Language"] ||
    config.headers?.["accept-language"];

  if (!existingHeader) {
    let currentLang = null;
    try {
      const { store } = await import("@/store");
      currentLang = store?.getState()?.language?.lang;
    } catch {
      // Store not ready or failed to import
    }

    if (currentLang !== "ar" && currentLang !== "en") {
      currentLang = detectInitialLanguage();
    }

    config.headers = config.headers || {};
    config.headers["Accept-Language"] = currentLang === "ar" ? "ar" : "en";
  }

  return config;
});

// Second request interceptor: attach the bearer token.
//
// Kept separate from the Accept-Language one above so each interceptor owns a
// single concern and neither can silently clobber the other's header. Axios
// runs request interceptors in registration order, both receive the same
// config, and they touch different headers — so order is not load-bearing here.
//
// The app supports BOTH session styles at once:
//   · cookie session — no token, `withCredentials` does the work
//   · bearer session — token from the login response, sent as a header
//
// That dual support is what fixed the blanket 401s: the backend returns an
// `access_token` from /api/auth/login, and the client was dropping it, so
// /api/auth/me went out unauthenticated, 401'd, and the refresh flow converted
// that into a full logout.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers?.[REFRESH_HEADER]) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Refresh token machinery — single shared promise + queue to avoid duplicate
 * refresh calls when multiple requests fail with 401 simultaneously.
 *
 * Flow:
 * 1. Any request that receives 401 enters `queueRefresh()`.
 * 2. The first caller kicks off `refreshTokenRequest()` and stores the promise.
 * 3. Subsequent callers wait on the same promise.
 * 4. On success: all queued requests are retried with the new cookie.
 * 5. On failure: all queued requests reject; auth state is cleared by the
 *    refresh hook (or by the interceptor calling clearCredentials).
 *
 * The refresh endpoint itself must NOT trigger another refresh. We achieve this
 * by tagging the internal refresh request with a custom header and skipping the
 * interceptor for responses to that request.
 */
let refreshPromise = null;
const pendingQueue = [];

function queueRefresh(originalRequest) {
  return new Promise((resolve, reject) => {
    pendingQueue.push({ resolve, reject, originalRequest });
    processQueue();
  });
}

async function processQueue() {
  // Already refreshing? The existing promise will settle the queue.
  if (refreshPromise) return;

  // Kick off the refresh.
  refreshPromise = (async () => {
    try {
      // Imported lazily: axiosInstance is imported *by* the auth api module, so
      // a static import would be a cycle.
      const { refreshTokenRequest, meRequest } = await import(
        "@/features/auth/api/auth.api"
      );
      const { store } = await import("@/store");

      const statusBeforeRefresh = store.getState().auth.status;

      // A bearer backend returns a fresh access_token; a cookie backend returns
      // an empty body and just updates the cookie. Both are successes.
      const newToken = await refreshTokenRequest();

      // ── A logout during the refresh must win ──────────────────────────────
      // Everything below this point re-establishes a session. If the user hit
      // logout while this request was in flight, doing that anyway signs them
      // straight back in — the token is adopted, Redux is set to
      // "authenticated", and they are bounced off the login page they were just
      // sent to. With the token persisted that also survives the next reload.
      //
      // The check sits before setAccessToken on purpose: adopting the token
      // first would put it back in localStorage even if we then bailed out.
      // Failing here rejects the queued requests, which is the correct outcome
      // for a session that no longer exists.
      if (
        statusBeforeRefresh !== "unauthenticated" &&
        store.getState().auth.status === "unauthenticated"
      ) {
        throw Object.assign(new Error("Signed out while refreshing the session."), {
          status: 401,
        });
      }

      // Adopt the new token IMMEDIATELY, before any follow-up request goes out.
      //
      // This ordering is load-bearing, not tidiness. Until this line the store
      // still holds the *old* token, so the /auth/me below would go out bearing
      // a credential the server has just rotated away — and come back 401.
      setAccessToken(newToken ?? getAccessToken());

      // Re-read the user so Redux reflects the refreshed session.
      //
      // Tagged with REFRESH_HEADER because this call must never become a queue
      // entry of its own. It used to be able to: the IIFE below is the promise
      // that `refreshPromise` points at, and `queueRefresh` is only drained
      // *after* this await returns — so a 401 here enqueued a request that
      // nothing could settle, and the IIFE was waiting on that same request.
      // Circular wait, no timeout, no rejection: every later 401 piled into
      // the same queue and the whole data layer hung silently. The backend
      // rotating the old token away is the common case, not an edge case, so
      // this path was reachable in ordinary use.
      //
      // A failure here is swallowed: the refresh itself succeeded, so the new
      // credential is good and the queued requests must still be retried. Only
      // a 401 on retry surfaces to the caller as a real auth failure.
      //
      // The header is set explicitly rather than left to the request
      // interceptor, which deliberately skips tagged requests. A cookie-backed
      // deployment does not need it; a bearer-only one would otherwise send this
      // call out with no credential at all.
      const user = await meRequest({
        headers: {
          [REFRESH_HEADER]: "true",
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        },
      }).catch(() => null);

      // Only overwrite Redux when we actually read a user back — dispatching
      // setCredentials({ user: null }) would blank the session and leave every
      // role guard with nothing to read.
      if (user) {
        const { setCredentials } = await import("@/features/auth/store/auth.slice");
        store.dispatch(setCredentials({ user, token: newToken ?? getAccessToken() }));
      }

      refreshPromise = null;
      // Retry all queued requests.
      pendingQueue.forEach(({ resolve, originalRequest }) =>
        resolve(api(originalRequest))
      );
      pendingQueue.length = 0;
    } catch (error) {
      refreshPromise = null;
      // Refresh failed — reject all queued requests and clear auth.
      pendingQueue.forEach(({ reject }) => reject(error));
      pendingQueue.length = 0;
      // Dispatch clearCredentials via a dynamic import to avoid circular deps.
      const { store } = await import("@/store");
      const { clearCredentials } = await import("@/features/auth/store/auth.slice");
      store.dispatch(clearCredentials());
    }
  })();
}

// Response interceptor: on 401, queue a refresh and retry the original request.
// Skip the interceptor for the refresh request itself (tagged with REFRESH_HEADER).
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    // A 403 means "authenticated but not allowed" — refreshing cannot fix that
    // and logging the user out would be wrong. Only 401 (no valid session)
    // justifies the refresh dance.
    //
    // Two exclusions keep this from turning a simple "not logged in" into a
    // logout storm:
    //
    //  · `_retry` marks a request we already re-sent after a refresh. Without
    //    it an endpoint that keeps answering 401 (a candidate-only route hit by
    //    an admin, say) would loop forever: refresh -> retry -> 401 -> refresh,
    //    dispatching clearCredentials() on every pass.
    //
    //  · When there is no session to refresh — no access token and no cookie —
    //    a 401 just means "not signed in". Refreshing is pointless and, because
    //    the refresh call also 401s, it would clear auth and bounce the user.
    //    GET /auth/me at app boot takes exactly this path for signed-out
    //    visitors, which is why it must not be treated as a refresh trigger.
    const hasSession = Boolean(getAccessToken());

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.headers?.[REFRESH_HEADER] &&
      hasSession
    ) {
      originalRequest._retry = true;
      try {
        return await queueRefresh(originalRequest);
      } catch (refreshError) {
        // Refresh failed — the queue processor already cleared auth.
        // Return a rejected promise so the original caller sees the error.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);