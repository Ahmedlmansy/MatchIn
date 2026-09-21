import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardBreadcrumb from "./DashboardBreadcrumb";
import { DASHBOARD_QUICK_ACTIONS } from "@/constants/dashboardQuickActions";
import { useLocalizedPath } from "@/utils/routes";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function UserDashboardHeader({ userName = "Ahmed" }) {
  const localizedPath = useLocalizedPath();

  return (
    <div>
      {/* Breadcrumb + greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"
      >
        <div className="flex flex-col">
          <DashboardBreadcrumb />
          <h1 className="font-serif text-[32px] font-bold tracking-tight text-primary sm:text-[36px]">
            {getGreeting()}, {userName}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Here&apos;s where things stand with your job search today.
          </p>
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 flex flex-wrap items-center gap-2"
      >
        {DASHBOARD_QUICK_ACTIONS.map(({ label, to, icon: Icon, variant }) => (
          <Button
            key={label}
            asChild
            size="sm"
            variant={variant === "primary" ? "default" : "outline"}
            className={
              variant === "primary"
                ? "gap-2 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                : "gap-2 rounded-xl border-border bg-surface px-4 py-2 text-[13px] font-semibold text-primary shadow-sm hover:bg-background"
            }
          >
            <Link to={localizedPath(to)}>
              <Icon
                className={`h-4 w-4 ${variant === "primary" ? "" : "text-muted"}`}
              />
              {label}
            </Link>
          </Button>
        ))}
      </motion.div>
    </div>
  );
}
