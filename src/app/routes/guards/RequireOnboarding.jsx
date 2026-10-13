// src/app/routes/guards/RequireOnboarding.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { selectUserRole } from "@/features/auth/store/auth.selectors";

/**
 * RequireOnboarding guard.
 *
 * Checks if the authenticated user has completed onboarding.
 * - While user role is still loading (null), shows a spinner.
 * - If user exists but hasn't completed onboarding, allows access to onboarding page.
 * - If user has completed onboarding, redirects to dashboard (or lets them through to other pages).
 *
 * The onboarding completion status is expected to be on the user object as `onboardingCompleted` boolean.
 */
export function RequireOnboarding() {
  const role = useSelector(selectUserRole);
  const location = useLocation();
  const { lang } = useParams();

  // Still waiting for the role to be determined (RequireAuth already passed).
  // This happens on hard refresh while /auth/me is still in flight.
  if (!role) {
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

  // Only apply onboarding check for candidate role
  if (role !== "candidate") {
    return <Outlet />;
  }

  // Get the full user object to check onboarding status
  const user = useSelector((state) => state.auth.user);

  // If user doesn't have onboardingCompleted flag yet, allow onboarding
  // The backend should set this flag when onboarding is complete
  const hasCompletedOnboarding = user?.onboardingCompleted === true;

  // Allow access to onboarding page regardless of completion status
  // (users might want to redo onboarding)
  const isOnboardingPath = location.pathname.includes("/onboarding");

  if (isOnboardingPath) {
    return <Outlet />;
  }

  // If onboarding not completed, redirect to onboarding
  if (!hasCompletedOnboarding) {
    return (
      <Navigate
        to={`/${lang}/dashboard/onboarding`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}