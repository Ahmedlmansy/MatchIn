// src/services/axios/tokenStore.js
//
// Holder for the access token, so the axios request interceptor can read it
// synchronously, backed by localStorage so it survives a page reload.
//
// It exists because of this: the app was assuming a pure httpOnly-cookie
// session, discarded the `access_token` that POST /api/auth/login returns, and
// never sent an Authorization header. Every protected call therefore went out
// with no credentials and came back 401.
//
// ── Why a module variable and not store.getState() ─────────────────────────
// A request interceptor must be synchronous. Reading the store inside one
// either forces the store into the axios module graph (circular) or costs an
// async hop on every single request. store/index.js keeps this in step with
// Redux through one subscription, so Redux stays the source of truth for the
// session and this is a synchronous mirror of it.
//
// ── Why it is persisted ────────────────────────────────────────────────────
// A module variable dies with the tab. With the token in memory only, every
// page reload — and closing and reopening the site — started with no credential
// and fell back to POST /api/auth/refresh to get one back. That works, but it
// costs a round-trip before the app can render, and it fails outright on any
// deployment that does not issue a refresh cookie. Persisting the token means a
// reload goes straight back to work.
//
// ── The tradeoff, stated plainly ───────────────────────────────────────────
// localStorage is readable by any JavaScript running on the page, so an XSS bug
// becomes a token-exfiltration bug, whereas an httpOnly cookie cannot be read
// at all — that is the entire point of httpOnly. The backend sets the cookie
// *as well as* returning this token, so the app supports either mechanism and
// this is the faster, less secure one.
//
// That is a deliberate trade for reliability, not a free win. Two things bound
// the exposure: the token is short-lived (60 minutes), so a stolen copy expires
// on its own, and POST /api/auth/logout invalidates the session server-side.
// If this backend issues a refresh cookie, deleting the persistence below and
// letting useInitializeAuth's refresh-on-boot path do the work removes the
// XSS exposure entirely and costs one round-trip per page load.
//
// ── Storage is best-effort ─────────────────────────────────────────────────
// localStorage throws rather than returning null in several real situations:
// Safari private browsing, storage disabled by policy or user, and sandboxed
// iframes. Every access is guarded so the worst case is the old
// memory-only behaviour instead of a blank screen.
const STORAGE_KEY = "matchin.access_token";

function readStoredToken() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function writeStoredToken(token) {
  try {
    if (token) window.localStorage.setItem(STORAGE_KEY, token);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-fatal: the in-memory value still authenticates this page load, and
    // the next successful login will try to persist again.
  }
}

// Rehydrated at module load, before the axios interceptor can fire, so the very
// first request the app makes already carries the header.
let accessToken = readStoredToken();

/** The token to send as `Authorization: Bearer …`, or null. */
export const getAccessToken = () => accessToken;

/**
 * Sets (or, with a falsy value, clears) the token in memory and in storage.
 *
 * Passing null is what removes it on logout — the store subscription below
 * forwards clearCredentials() here, so logging out cannot leave a usable token
 * sitting in localStorage for the next person to open the tab.
 */
export const setAccessToken = (token) => {
  accessToken = token || null;
  writeStoredToken(accessToken);
};

/** True when a token was restored from a previous session on this device. */
export const hasStoredAccessToken = () => Boolean(accessToken);
