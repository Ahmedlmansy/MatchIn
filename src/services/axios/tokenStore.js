// src/services/axios/tokenStore.js
//
// In-memory holder for the access token, so the axios request interceptor can
// read it synchronously.
//
// It exists because of this: the app was assuming a pure httpOnly-cookie
// session, discarded the `access_token` that POST /api/auth/login returns, and
// never sent an Authorization header. Every protected call therefore went out
// with no credentials and came back 401.
//
// Why a module variable instead of reading Redux inside the interceptor:
// a request interceptor must be synchronous, and `store.getState()` inside one
// either forces the store import into the axios module graph (circular) or
// costs an async hop on every request. store/index.js keeps this in sync with
// Redux via a single subscription, so Redux stays the source of truth and this
// is only a synchronous mirror.
//
// Deliberately NOT localStorage: keeping a bearer token in memory means a page
// refresh drops it, which is the safer default. Cookie-based deployments are
// unaffected because the token is simply absent and the cookie does the work.

let accessToken = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token || null;
};