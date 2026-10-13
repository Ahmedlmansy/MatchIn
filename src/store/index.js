import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/auth.slice.js";
import languageReducer from "@/features/language/store/language.slice.js";
import { setAccessToken } from "@/services/axios/tokenStore";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    language: languageReducer,
  },
});

// Keep the axios interceptor's synchronous mirror of the token in step with
// Redux. Redux stays the single source of truth; this subscription is the only
// place that pushes into tokenStore, so there is exactly one write path and
// clearCredentials() can never leave a stale token behind on the client.
//
// ── Why it compares against the previous token ─────────────────────────────
// subscribe() fires after *every* dispatch, not just auth ones. Writing
// unconditionally looked harmless while the token lived only in memory, but
// not any more: auth.token starts as null while tokenStore has just rehydrated
// a real token from localStorage, so the first unrelated dispatch would push
// null straight back and delete it. I18nSync dispatches setLanguage on mount
// whenever the URL language differs from the detected one, which is an everyday
// occurrence on /ar routes — so on exactly those visits the restored token was
// being wiped microseconds after it was read, and the boot-time /auth/me went
// out anonymous.
//
// Tracking the previous value makes the subscription care only about the one
// thing it owns: an actual change to the auth token.
//
// ── Why it also watches the status ─────────────────────────────────────────
// Watching the token alone is not quite enough, and the gap is exactly the
// failure this mirror exists to prevent. A token restored from storage is
// *stale* until proven otherwise: if it has expired, boot fails and
// clearCredentials() runs — but auth.token was already null, so there is no
// change to detect and the dead token would sit in memory and in localStorage
// forever. Every subsequent reload would then present it again, and every 401
// would keep attempting a refresh that can never succeed.
//
// So signing out is treated as its own transition: it forces the mirror empty
// regardless of what the token field happened to hold.
let previousToken = store.getState().auth.token;
let previousStatus = store.getState().auth.status;

store.subscribe(() => {
  const { token, status } = store.getState().auth;

  const justSignedOut = status === "unauthenticated" && previousStatus !== "unauthenticated";
  if (token === previousToken && !justSignedOut) return;

  previousToken = token;
  previousStatus = status;

  setAccessToken(justSignedOut ? null : token);
});
