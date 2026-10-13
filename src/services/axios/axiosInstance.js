import axios from "axios";
import { getAccessToken } from "./tokenStore";

// The one app-wide client (convention §4.2). The session token is an httpOnly
// cookie the backend sets on login / email verification, so JS never holds it
// — `withCredentials` is what makes the browser attach it to every call.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const REFRESH_HEADER = "x-skillmatch-refresh-retry";

/**
 * Attach the bearer token when we have one.
 *
 * The app supports BOTH session styles at once:
 *   · cookie session — no token, `withCredentials` does the work
 *   · bearer session — token from the login response, sent as a header
 *
 * That dual support is the fix for the 401s: the backend returns an
 * `access_token` from /api/auth/login, and this app was dropping it on the
 * floor, so /api/auth/me went out unauthenticated and came back 401 — which
 * the refresh flow then converted into a full logout.
 *
 * `withCredentials` stays true regardless, because a deployment may set the
 * cookie *and* return a token.
 */
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

      // A bearer backend returns a fresh access_token; a cookie backend returns
      // an empty body and just updates the cookie. Both are successes.
      const newToken = await refreshTokenRequest();

      // Re-read the user so Redux reflects the refreshed session.
      const user = await meRequest();

      const { store } = await import("@/store");
      const { setCredentials } = await import("@/features/auth/store/auth.slice");
      store.dispatch(setCredentials({ user, token: newToken ?? getAccessToken() }));

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