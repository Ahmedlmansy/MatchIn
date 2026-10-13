import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, useRoutes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout/DashboardLayout";
import { selectUserRole } from "@/features/auth/store/auth.selectors";
import { isAdminRole } from "@/features/auth/store/auth.roles";
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
    // Signed in (RequireAuth already ran) but the role hasn't landed yet — the
    // first render after a hard refresh, while /auth/me is still in flight.
    if (!role) return [];

    const tree = isAdminRole(role) ? adminDashboardRoutes : candidateDashboardRoutes;
    return [{ path: "/", element: <DashboardLayout />, children: tree }];
  }, [role]);

  // Must run unconditionally — returning early above it would break the hook
  // order when the role resolves.
  const tree = useRoutes(routes);

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

  return tree;
}