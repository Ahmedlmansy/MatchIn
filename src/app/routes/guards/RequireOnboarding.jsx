// src/app/routes/guards/RequireOnboarding.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useProfileQuery } from "@/features/candidate/hooks/useProfileQuery";
import { selectUserRole } from "@/features/auth/store/auth.selectors";
import { isCandidateRole } from "@/features/auth/store/auth.roles";
import { useLocalizedPath } from "@/utils/routes";
import Status from "@/components/shared/Status";

/**
 * RequireOnboarding guard.
 *
 * Onboarding is a candidate-only flow, and completion is read from
 * GET /api/candidate/profile rather than from a flag on the user.
 *
 * ── Why `enabled` matters here ────────────────────────────────────────────
 * `useProfileQuery()` is a hook, so it must be called on every render — it
 * cannot sit below the role check. Without `enabled` it fired for *everyone*,
 * and because that endpoint is candidate-gated an admin got a 401, which the
 * axios interceptor turned into a refresh, a failed refresh, and
 * clearCredentials() — i.e. "admin logs in, fetches the candidate profile,
 * gets bounced back to /login". Gating the query on the role removes the
 * request entirely for staff.
 *
 * A disabled query reports `isPending: true`, which is harmless here: non-
 * candidates return at the role check before the loading branch is reached.
 */
export function RequireOnboarding() {
  // Hooks are called unconditionally at the top: the early returns below must
  // never skip one, or the hook order changes between renders.
  const role = useSelector(selectUserRole);
  const location = useLocation();
  const localizedPath = useLocalizedPath();
  const isOnboardingPath = location.pathname.endsWith("/onboarding");

  const isCandidate = isCandidateRole(role);

  const {
    data: profileData,
    isPending: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch,
  } = useProfileQuery({ enabled: isCandidate });

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

  // Staff never onboard. They also skip the candidate-only profile request
  // entirely (see the note above), so there is nothing left for them to hit a
  // 401 on.
  if (!isCandidate) {
    return <Outlet />;
  }

  if (isProfileLoading) {
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

  if (isProfileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface shadow-sm">
          <Status
            icon={<AlertCircle className="h-5 w-5" />}
            iconClassName="bg-error/10 text-error"
            title="Couldn't load profile"
            subtitle={profileError?.message ?? "Something went wrong. Please try again."}
            primaryButton={{
              label: "Try again",
              onClick: () => refetch(),
            }}
          />
        </div>
      </div>
    );
  }

  const hasCompletedOnboarding =
    profileData?.profile_completed_at ||
    profileData?.profile_exists === true;

  if (isOnboardingPath) {
    if (hasCompletedOnboarding) {
      return <Navigate to={localizedPath("/dashboard")} replace state={{ from: location }} />;
    }
    return <Outlet />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <Navigate
        to={localizedPath("/dashboard/onboarding")}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}