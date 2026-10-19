import { useState } from "react";
import { useSelector } from "react-redux";

import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import DashboardFooter from "./DashboardFooter";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { selectCurrentUser } from "@/features/auth/store/auth.selectors";
import useMediaQuery from "@/hooks/useMediaQuery";

// Must stay in sync with the `lg:` classes in Sidebar/Topbar. The sidebar is
// docked only from this width up; anything smaller uses the drawer.
const DESKTOP_QUERY = "(min-width: 1024px)";

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  // The real user comes from Redux — the same session the route guards just
  // verified against /auth/me. Never hardcoded, or every candidate sees the
  // admin sidebar and Topbar shows the wrong name/role.
  const user = useSelector(selectCurrentUser);

  // Below `lg` the sidebar is a drawer, which has nothing to collapse into, so
  // collapse never applies there. Deriving instead of resetting in an effect
  // keeps the desktop preference intact across a resize.
  const collapsed = isDesktop && isCollapsed;

  return (
    <div className="flex min-h-screen bg-background font-sans text-ink antialiased">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setIsCollapsed((v) => !v)}
        mobileOpen={isDesktop ? false : drawerOpen}
        onCloseMobile={() => setDrawerOpen(false)}
        role={user?.role}
      />

      <div
        className={cn(
          // Only the sidebar offset animates when collapsing — `transition-all`
          // here would re-evaluate every property on every frame for nothing.
          "flex min-w-0 flex-1 flex-col duration-300",
          collapsed ? "lg:ms-24" : "lg:ms-72",
          "transition-[margin]",
        )}
      >
        <Topbar
          onOpenMobileSidebar={() => setDrawerOpen(true)}
          userName={user?.name ?? ""}
          userRole={user?.role ?? ""}
        />

        <main className="w-full min-h-screen bg-background pb-12">
          <div className="mx-auto max-w-[1360px] px-6 pt-6">
            <Outlet />
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
