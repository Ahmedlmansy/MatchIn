// src/app/routes/guards/RequireOnboarding.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { useProfileQuery } from "@/features/candidate/hooks/useProfileQuery";
import { selectUserRole } from "@/features/auth/store/auth.selectors";
import { useLocalizedPath } from "@/utils/routes";
import Status from "@/components/shared/Status";

export function RequireOnboarding() {
  const role = useSelector(selectUserRole);
  const location = useLocation();
  const localizedPath = useLocalizedPath();
  const isOnboardingPath = location.pathname.endsWith("/onboarding");
  const {
    data: profileData,
    isPending: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch,
  } = useProfileQuery();

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

  if (role !== "candidate") {
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