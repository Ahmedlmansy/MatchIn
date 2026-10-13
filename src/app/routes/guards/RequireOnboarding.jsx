// src/app/routes/guards/RequireOnboarding.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { selectUserRole } from "@/features/auth/store/auth.selectors";
import { isCandidateRole } from "@/features/auth/store/auth.roles";

/**
 * RequireOnboarding guard.
 *
 * Onboarding is a candidate-only flow: it prefills from GET
 * /api/candidate/profile, which is candidate-gated. So this guard has two jobs.
 *
 *  1. Candidates without `onboardingCompleted` are redirected to
 *     /dashboard/onboarding to finish it.
 *  2. Everyone else — admins, recruiters, any staff role — is kept OUT of
 *     onboarding entirely, including when they navigate to the URL directly.
 *     Staff landing there would otherwise render a candidate form, fire a
 *     candidate-gated request, get a 401, and be logged out by the refresh
 *     interceptor.
 *
 * The completion flag is read from `user.onboardingCompleted`; the backend owns
 * that value.
 */
export function RequireOnboarding() {
  // Both hooks are called unconditionally at the top: the early returns below
  // must never skip one, or the hook order changes between renders.
  const role = useSelector(selectUserRole);
  const user = useSelector((state) => state.auth.user);
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

  const isOnboardingPath = location.pathname.includes("/onboarding");

  // Staff never need onboarding. If one lands on the onboarding path anyway —
  // typed URL, stale bookmark, or a link from the register flow — send them to
  // their own workspace rather than rendering a candidate-only form.
  //
  // This matters beyond tidiness: OnboardingPage fires
  // GET /api/candidate/profile on mount, which is candidate-gated. An admin
  // rendering it got a 401, which the axios interceptor turned into a refresh
  // and then a full logout. Bouncing them here removes that whole path.
  if (!isCandidateRole(role)) {
    if (isOnboardingPath) {
      // /dashboard is role-agnostic: DashboardRoleTree resolves it to the
      // admin or candidate tree from the same role value.
      return <Navigate to={`/${lang}/dashboard`} replace />;
    }
    return <Outlet />;
  }

  // Candidates: allow the onboarding page regardless of completion status
  // (they may want to redo it), otherwise send them there to complete it.
  const hasCompletedOnboarding = user?.onboardingCompleted === true;

  if (isOnboardingPath) {
    return <Outlet />;
  }

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