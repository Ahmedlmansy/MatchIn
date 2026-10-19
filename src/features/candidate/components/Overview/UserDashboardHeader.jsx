import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardBreadcrumb from "./DashboardBreadcrumb";
import { DASHBOARD_QUICK_ACTIONS } from "@/features/candidate/shared/dashboardQuickActions";
import { useLocalizedPath } from "@/utils/routes";
import { useTranslation } from "react-i18next";
import { RefreshCw, AlertCircle } from "lucide-react";

function getGreeting(t) {
  const hour = new Date().getHours();
  if (hour < 12) return t("overview.greeting.morning");
  if (hour < 18) return t("overview.greeting.afternoon");
  return t("overview.greeting.evening");
}

/**
 * `userName` is optional on purpose.
 *
 * This used to default to the literal "Ahmed", so any real user whose name the
 * dashboard query had not resolved yet was greeted by name as Ahmed, and the
 * loading state passed `t("overview.loading.user")` — a key that did not exist,
 * so the header read "Good morning, overview.loading.user". Neither is right:
 * when there is no name yet, omit it rather than invent one.
 */
export default function UserDashboardHeader({ userName, profileQuery }) {
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("dashboard");
  
  // Use passed query or fall back to defaults
  const isLoading = profileQuery?.isLoading ?? false;
  const isError = profileQuery?.isError ?? false;
  const refetch = profileQuery?.refetch;

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div className="flex flex-col">
            <DashboardBreadcrumb />
            <h1 className="font-serif text-[32px] font-bold tracking-tight text-primary sm:text-[36px] animate-pulse">
              {getGreeting(t)}, <span className="w-32 h-8 bg-border rounded" />
            </h1>
            <p className="mt-1 text-[13px] text-muted animate-pulse">
              <span className="w-64 h-4 bg-border rounded" />
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-wrap items-center gap-2"
        >
          {DASHBOARD_QUICK_ACTIONS.map(({ _key, label, to, icon: Icon, variant }) => (
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
              disabled
            >
              <Link to={localizedPath(to)}>
                <Icon className={`h-4 w-4 ${variant === "primary" ? "" : "text-muted"}`} />
                <span className="w-20 h-4 bg-border rounded animate-pulse" />
              </Link>
            </Button>
          ))}
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div className="flex flex-col">
            <DashboardBreadcrumb />
            <h1 className="font-serif text-[32px] font-bold tracking-tight text-primary sm:text-[36px]">
              {getGreeting(t)}, {userName}
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {t("overview.subtitle")}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-wrap items-center gap-2"
        >
          <div className="text-center w-full py-4">
            <AlertCircle className="mx-auto mb-2 h-6 w-6 text-error" />
            <p className="text-[12.5px] text-muted mb-3">
              {t("overview.profile.error")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("overview.profile.retry")}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const greeting = getGreeting(t);

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
            {userName ? `${greeting}, ${userName}` : greeting}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {t("overview.subtitle")}
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
        {DASHBOARD_QUICK_ACTIONS.map(({ _key, label, to, icon: Icon, variant }) => (
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
              {t(`overview.quickActions.${_key}`, { defaultValue: label })}
            </Link>
          </Button>
        ))}
      </motion.div>
    </div>
  );
}
