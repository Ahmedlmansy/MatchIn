import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/auth.slice.js";
import { setAccessToken } from "@/services/axios/tokenStore.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Keep the axios interceptor's synchronous mirror of the token in step with
// Redux. Redux stays the single source of truth; this subscription is the only
// place that pushes into tokenStore, so there is exactly one write path and
// clearCredentials() can never leave a stale token behind on the client.
store.subscribe(() => {
  setAccessToken(store.getState().auth.token);
});