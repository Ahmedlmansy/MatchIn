import axios from "axios";
import { detectInitialLanguage } from "@/features/language/store/language.slice";

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

const REFRESH_HEADER = "x-skillmatch-refresh-retry";

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
      // Tag the request so the interceptor ignores its own 401.
      await api.post("/api/auth/refresh", null, {
        headers: { [REFRESH_HEADER]: "true" },
      });

      // Refresh succeeded — re-fetch user to keep Redux in sync (mirrors login flow).
      const { meRequest } = await import("@/features/auth/api/auth.api");
      const user = await meRequest();
      const { store } = await import("@/store");
      const { setCredentials } = await import("@/features/auth/store/auth.slice");
      store.dispatch(setCredentials({ user }));

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

    // Only handle 401 on non-refresh requests.
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest.headers?.[REFRESH_HEADER]
    ) {
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