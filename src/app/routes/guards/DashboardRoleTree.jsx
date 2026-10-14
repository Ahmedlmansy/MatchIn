import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useRoutes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, LogOut } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout/DashboardLayout";
import { selectUserRole } from "@/features/auth/store/auth.selectors";
import { isAdminRole } from "@/features/auth/store/auth.roles";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";
import {
  candidateDashboardRoutes,
  adminDashboardRoutes,
  // The same module the Sidebar builds its nav from. These two used to be
  // separate copies that had drifted: the sidebar linked to company-management
  // and dashboard-auth, which the rendered tree never registered, so those
  // links 404'd. One source of truth for both.
} from "@/app/routes/dashboard.routes";

/**
 * Renders the dashboard tree that matches the signed-in user's role.
 *
 * Why not two <RequireRole /> branches side by side: both trees register an
 * index route at /dashboard, so as siblings only the first one ever renders
 * through the shared <Outlet />. The losing branch could only bail out with
 * <Navigate>, and navigating from /dashboard to /dashboard is a
 * self-redirect loop — which is why an admin could never reach the admin tree
 * at all (it rendered an empty shell). Picking the tree up front removes both
 * problems.
 *
 * The tree is rooted at "/" on purpose: nested useRoutes matches against the
 * pathname *remaining* after the parent routes consumed their segments (here
 * "/:lang" and "dashboard"), not the absolute URL. Rooting at "/en/dashboard"
 * therefore never matches; rooting at "/" lines the index route up with the
 * empty remainder, and child paths like "job-management" stay relative.
 */
export function DashboardRoleTree() {
  const role = useSelector(selectUserRole);

  const routes = useMemo(() => {
    // No tree until there is a role to choose between. This is NOT the
    // "still loading" case — see NoRoleAssigned below for why that distinction
    // matters, and why rendering it as a spinner was wrong.
    if (!role) return [];

    const tree = isAdminRole(role) ? adminDashboardRoutes : candidateDashboardRoutes;
    return [{ path: "/", element: <DashboardLayout />, children: tree }];
  }, [role]);

  // Must run unconditionally — returning early above it would break the hook
  // order when the role resolves.
  const tree = useRoutes(routes);

  if (!role) return <NoRoleAssigned />;

  return tree;
}

/**
 * Authenticated, but the account carries no role we recognise.
 *
 * This replaces a spinner that spun forever. The comment above still describes
 * the intended case — "the role hasn't landed yet, the first render after a
 * hard refresh" — but because this component only ever renders *underneath*
 * RequireAuth, by the time it mounts the session is already established, so a
 * missing role means it is never going to arrive. That is not a transient state
 * and must not be rendered as one: a user whose /auth/me payload was shaped one
 * level deeper than expected got a blank loading screen with no error, no
 * console message and no way out, and looked like the app was simply broken.
 *
 * An unrecognised role is also a security question, not just a UX one — it is
 * the case where we cannot tell which workspace the account should be in, so it
 * gets no workspace. Offer the one action that does work: sign out.
 */
function NoRoleAssigned() {
  const { t } = useTranslation("common");
  const logout = useLogoutMutation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-warning/12">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>

        <h1 className="text-lg font-bold text-ink">
          {t("auth.errors.noRoleTitle", "We couldn't work out your access level")}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {t(
            "auth.errors.noRoleBody",
            "You're signed in, but this account isn't assigned a role yet, so there's no workspace to open. Ask an administrator to set one, or sign in with a different account.",
          )}
        </p>

        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="mx-auto mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {logout.isPending
            ? t("auth.errors.signingOut", "Signing out…")
            : t("auth.errors.signOut", "Sign out")}
        </button>
      </div>
    </div>
  );
}