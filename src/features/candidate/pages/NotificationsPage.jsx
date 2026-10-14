import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsList from "../components/NotificationsPage/NotificationsList";
import { useNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from "@/features/candidate/hooks/useNotificationsQuery";

export default function NotificationsPage() {
  const { t } = useTranslation("dashboard");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error, refetch, isFetching } = useNotificationsQuery({ page, limit });
  const notifications = data?.notifications ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0, unreadCount: 0 };
  const unreadCount = meta.unreadCount;

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const handleMarkAsRead = (id) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const handleLoadMore = () => {
    if (page < meta.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <main className="mx-auto max-w-[720px] px-5 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-ink">
            {t("pages.notifications.title")}
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            {unreadCount > 0
              ? t("pages.notifications.unread", { count: unreadCount })
              : t("pages.notifications.caughtUp")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          className="h-9 gap-1.5 rounded-lg border-border px-3.5 text-[12px] font-semibold text-ink hover:bg-background disabled:opacity-50"
        >
          {markAllReadMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Marking...
            </>
          ) : (
            <>
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-label="Loading notifications">
          {[1, 2, 3].map((i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 rounded-2xl border border-border bg-surface">
          <p className="text-muted mb-4">Failed to load notifications</p>
          <p className="text-xs text-muted mb-4">{error?.message ?? "Unknown error"}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      ) : notifications.length > 0 ? (
        <>
          <NotificationsList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
          />
          {meta.totalPages > 1 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isFetching || page >= meta.totalPages}
                className="w-full sm:w-auto"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load more (${notifications.length} of ${meta.total})`
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 rounded-2xl border border-border bg-surface">
          <p className="text-muted">No notifications yet</p>
          <p className="text-xs text-muted mt-1">You're all caught up!</p>
        </div>
      )}
    </main>
  );
}

function NotificationSkeleton() {
  return (
    <div className="animate-pulse flex gap-3 p-4 border-b border-border">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-border" />
      <div className="min-w-0 flex-1">
        <div className="h-4 w-3/4 rounded bg-border mb-1" />
        <div className="h-3 w-full rounded bg-border/70 mb-1" />
        <div className="h-3 w-1/2 rounded bg-border/70" />
      </div>
    </div>
  );
}