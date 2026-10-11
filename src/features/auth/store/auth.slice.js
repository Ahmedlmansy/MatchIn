// src/features/auth/store/auth.slice.js
import { createSlice } from "@reduxjs/toolkit";

// The session token is an httpOnly cookie the backend sets — JS can neither
// read nor write it, so `token` is always null here. It stays in the state
// shape (convention §6) purely as the explicit "we hold no token" marker.
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
