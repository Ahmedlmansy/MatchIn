// src/features/auth/store/auth.slice.js
import { createSlice } from "@reduxjs/toolkit";

// `token` holds the bearer access_token returned by /api/auth/login. It used
// to be hardcoded to null on the assumption that the session lived entirely in
// an httpOnly cookie — which meant the Authorization header was never sent and
// every authenticated request 401'd. A cookie-based deployment simply leaves
// this null and keeps working through `withCredentials`.
const initialState = {
  user: null,
  token: null,
  // 'loading'              -> app boot: useInitializeAuth is asking /auth/me
  //                         whether the cookie the browser holds is still valid.
  // 'authenticated' | 'unauthenticated' -> known result, guards read this.
  status: "loading",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token ?? null;
      state.status = "authenticated";

      // Loud in dev, silent in production. Getting here with no user is always
      // a bug: every guard reads user.role, so a missing user turns into a
      // spinner that never resolves rather than an obvious failure.
      if (import.meta.env.DEV && !state.user) {
        console.warn(
          "[auth] setCredentials called without a user — role checks will fail.",
        );
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // Pure: the backend owns the cookie, so clearing it is a server round-trip
    // that belongs at the logout call site, not in a reducer.
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setCredentials, updateUser, clearCredentials } =
  authSlice.actions;
export default authSlice.reducer;
