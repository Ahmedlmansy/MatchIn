// src/features/auth/hooks/useInitializeAuth.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { meRequest } from "../api/auth.api";
import { setCredentials, clearCredentials } from "../store/auth.slice";
import { selectAuthStatus } from "../store/auth.selectors";

/**
 * Call once at the app root (see app/providers.jsx). The session token is an
 * httpOnly cookie, so the only way to know whether we're logged in is to ask
 * the server: this verifies the cookie against /auth/me and resolves status to
 * "authenticated" or "unauthenticated". Route guards read that status, and
 * they hold off while it is still "loading" rather than redirecting too early.
 *
 * Runs exactly once: the guard below lets it fire only while status is
 * "loading", and the request always resolves it to one of the other two.
 */
export const useInitializeAuth = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    if (status !== "loading") return;

    meRequest()
      .then((user) => dispatch(setCredentials({ user })))
      .catch(() => dispatch(clearCredentials()));
  }, [status, dispatch]);
};
