import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLocalizedPath } from "@/utils/routes";
import { useTranslation } from "react-i18next";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @typedef {Object} NotificationItem
 * @property {string} id
 * @property {string} message
 */

/**
 * Notifications summary card for the candidate dashboard.
 * Uses only MatchIn @theme tokens.
 *
 * @param {{
 *   notifications?: NotificationItem[],
 *   className?: string,
 *   notificationsQuery?: ReturnType<import("@/features/candidate/hooks/useNotificationsQuery").useNotificationsQuery>,
 * }} props
 */
export default function NotificationsCard({
  notifications = DEFAULT_NOTIFICATIONS,
  className,
  notificationsQuery,
}) {
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("dashboard");
  
  // Use passed query or fall back to defaults
  const isLoading = notificationsQuery?.isLoading ?? false;
  const isError = notificationsQuery?.isError ?? false;
  const refetch = notificationsQuery?.refetch;
  
  // Determine if we have actual data from the query
  const hasQueryData = notificationsQuery?.data !== undefined;
  const displayNotifications = hasQueryData ? notifications : DEFAULT_NOTIFICATIONS;
  const isEmpty = displayNotifications.length === 0;

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-primary">{t("overview.notifications.title")}</h2>
        <Link
          to={localizedPath("/dashboard/notifications")}
          className="text-[12px] font-semibold text-primary hover:underline"
        >
          {t("overview.notifications.view")}
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-label={t("overview.notifications.loading")}>
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-2 text-[12.5px]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
              <div className="h-3 w-3/4 bg-border rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-4">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-error" />
          <p className="text-[12.5px] text-muted mb-3">
            {t("overview.notifications.error")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("overview.notifications.retry")}
          </Button>
        </div>
      ) : isEmpty ? (
        <p className="text-[12.5px] text-muted">{t("overview.notifications.empty")}</p>
      ) : (
        <div className="space-y-2.5">
          {displayNotifications.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2 text-[12.5px] leading-snug text-muted"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_NOTIFICATIONS = [
  {
    id: "1",
    message: "New match: Lead Frontend Architect at Stripe",
  },
  {
    id: "2",
    message: "Vercel application moved to In Review",
  },
];
