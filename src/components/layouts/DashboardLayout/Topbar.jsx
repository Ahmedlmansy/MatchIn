import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationsBellDropdown from "@/features/candidate/components/NotificationsPage/NotificationsBellDropdown";
import { Menu, Search, User, LogOut, ChevronDown } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";

export default function Topbar({ onOpenMobileSidebar, userName, userRole }) {
  const { t } = useTranslation(["dashboard", "common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const logout = useLogoutMutation();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLanguageChange = (newLang) => {
    const segments = location.pathname.split("/");
    segments[1] = newLang;
    navigate(segments.join("/") + location.search + location.hash);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout.mutate();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onOpenMobileSidebar}
            aria-label={t("actions.openMenu")}
            className="rounded-xl border-border bg-surface p-2 text-muted lg:hidden"
          >
            <Menu className="h-[22px] w-[22px]" />
          </Button>

          <div
            className={cn(
              "hidden w-64 items-center rounded-xl border border-border bg-surface px-3.5 py-2 shadow-sm transition-all",
              "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
              "sm:flex lg:w-80",
            )}
          >
            <Search className="me-2 h-[18px] w-[18px] shrink-0 text-muted/70" />
            <Input
              type="text"
              placeholder={t("layout.searchPlaceholder")}
              className="h-auto w-full border-0 bg-transparent p-0 text-[13px] text-ink shadow-none placeholder:text-muted/70 focus-visible:ring-0"
            />
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted">
              ⌘S
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle language={lang} onChange={handleLanguageChange} />
          <NotificationsBellDropdown />

          {/* User Menu with Logout */}
          <div className="relative">
            <div
              className="flex items-center gap-2 border-s border-border ps-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="relative flex items-center justify-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <User className="h-[19px] w-[19px]" />
                </div>
                <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
              </div>
              <div className="hidden flex-col text-start sm:flex">
                <span className="text-[13px] font-semibold leading-tight text-primary">
                  {userName}
                </span>
                <span className="text-[11px] leading-none text-muted">
                  {userRole}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted ml-1" />
            </div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-surface shadow-lg py-1 z-50"
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-muted hover:bg-background hover:text-error transition-colors disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t("layout.logOut")}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
