import { Menu, Search, Bell, User } from "lucide-react";


export default function Topbar({ onOpenMobileSidebar, userName, userRole }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="rounded-xl border border-border bg-surface p-2 text-muted md:hidden"
          >
            <Menu className="h-[22px] w-[22px]" />
          </button>

          <div className="hidden w-64 items-center rounded-xl border border-border bg-surface px-3.5 py-2 shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary sm:flex lg:w-80">
            <Search className="mr-2 h-[18px] w-[18px] shrink-0 text-muted/70" />
            <input
              type="text"
              readOnly
              placeholder="Search roles, skills..."
              className="w-full border-none bg-transparent p-0 text-[13px] text-ink placeholder:text-muted/70 focus:outline-none"
            />
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative rounded-xl border border-border bg-surface p-2.5 text-muted shadow-sm transition-colors hover:bg-background hover:text-ink"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
          </button>

          <div className="flex items-center gap-3 border-l border-border pl-2">
            <div className="relative flex items-center justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <User className="h-[19px] w-[19px]" />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
            </div>
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-[13px] font-semibold leading-tight text-primary">
                {userName}
              </span>
              <span className="text-[11px] leading-none text-muted">{userRole}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
