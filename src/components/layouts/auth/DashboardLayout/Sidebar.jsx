import {
  Compass,
  LayoutDashboard,
  Bookmark,
  ClipboardList,
  Map,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import LogoNavy from "@/assets/logo/MatchIn_logo.svg";
import { cn } from "@/lib/utils";

// Nav items are data — add/remove/reorder here, no JSX changes needed.
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "#", active: true },
  { label: "Explore Jobs", icon: Compass, href: "#" },
  { label: "Saved Jobs", icon: Bookmark, href: "#" },
  { label: "Application Tracker", icon: ClipboardList, href: "#" },
  { label: "Mentor & Roadmap", icon: Map, href: "#" },
];

function NavItem({ icon: Icon, label, href = "#", active, collapsed }) {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary font-semibold text-primary-foreground shadow-sm"
          : "text-muted hover:bg-background hover:text-primary"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}

      {/* Tooltip shown only in collapsed mode, on hover */}
      {collapsed && (
        <span className="pointer-events-none absolute left-[70px] z-[100] whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 text-xs text-primary-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {label}
        </span>
      )}
    </a>
  );
}

/**
 * Sidebar
 * ---------------------------------------------------------------------------
 * Fixed, collapsible sidebar. State (collapsed / mobile drawer) lives in
 * DashboardLayout and is passed down as props so the layout stays the single
 * source of truth for the shell's responsive behavior.
 */
export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen p-4 transition-all duration-300",
          collapsed ? "w-24" : "w-72",
          mobileOpen ? "block" : "hidden md:block",
        )}
      >
        <div className="flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-surface/90 p-4 shadow-sm backdrop-blur-md transition-all duration-300">
          <div>
            {/* Logo & Brand */}
            <a
              href="#"
              className="mb-4 flex items-center gap-3 border-b border-border/50 pb-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                <img src={LogoNavy} alt="MatchIn Logo" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-serif text-[18px] font-bold leading-none tracking-tight text-primary">
                    MatchIn
                  </span>
                  <span className="mt-1 text-[10px] font-medium tracking-wide text-muted">
                    Career Guidance
                  </span>
                </div>
              )}
            </a>

            {/* Navigation */}
            <nav className="space-y-1.5">
              {!collapsed && (
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted/70">
                  Main Menu
                </div>
              )}
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.label} {...item} collapsed={collapsed} />
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            {/* AI Mentor callout */}
            {!collapsed && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-4 text-xs text-primary-foreground shadow-sm">
                <Sparkles className="mb-2 h-6 w-6 text-accent" />
                <p className="mb-1 text-[13px] font-bold">Need Help?</p>
                <p className="mb-3 text-[11px] text-primary-foreground/70">
                  Ask AI Mentor for instant career recommendations.
                </p>
                <a
                  href="#"
                  className="block rounded-lg bg-surface px-3 py-2 text-center text-[11px] font-bold text-primary shadow-sm transition-colors hover:bg-background"
                >
                  Start Conversation
                </a>
              </div>
            )}

            {/* Collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border border-border/80 bg-background/60 px-3.5 py-2.5 text-[13px] font-semibold text-muted shadow-sm transition-all hover:bg-background hover:text-primary",
                collapsed && "justify-center px-0",
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
              {!collapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
