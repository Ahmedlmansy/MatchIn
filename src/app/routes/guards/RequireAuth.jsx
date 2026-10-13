// src/routes/guards/RequireAuth.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { selectAuthStatus } from "@/features/auth/store/auth.selectors";

export function RequireAuth() {
  const status = useSelector(selectAuthStatus);
  const location = useLocation();
  const { lang } = useParams();

  // Still verifying the session cookie against /auth/me. Redirecting here
  // would bounce a signed-in user to login, so hold the route and show a
  // spinner rather than a blank white screen.
  if (status === "idle" || status === "loading") {
    return (
      <div
        role="status"
        aria-label="Loading"
        className="flex min-h-screen items-center justify-center bg-background"
      >
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <Navigate
        to={`/${lang}/auth/login`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
