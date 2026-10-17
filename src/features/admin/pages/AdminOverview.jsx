// src/features/admin/pages/AdminOverview.jsx
//
// Admin overview. Reads through useAdminDashboardQuery and renders the view
// model that turns the normalized payload into the exact card/list props.

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLocalizedPath } from "@/utils/routes";
import {
  AdminDashboardSkeleton,
  DashboardHeader,
  StatCard,
  QuickActions,
  RecentActivity,
  AuditLogs,
  containerVariants,
} from "@/features/admin/components/adminDashboard";
import { useAdminDashboardQuery } from "@/features/admin/hooks";
import { QUICK_ACTIONS } from "@/features/admin/constants/adminDashboardActions";
import {
  buildOverviewStats,
  buildRecentActivity,
  buildAuditLogs,
} from "@/features/admin/shared/adminDashboardViewModel";
import { ErrorState, EmptyState } from "@/features/admin/shared";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("dashboard");
  const { data, isPending, isError, error, refetch, isFetching } =
    useAdminDashboardQuery();

  // Domain data -> the exact props the cards/lists render (icons, Tailwind
  // classes, title/meta segments). See adminDashboardViewModel.js.
  const overviewStats = buildOverviewStats(data?.stats);
  const recentActivity = buildRecentActivity(data?.recentActivity);
  const auditLogs = buildAuditLogs(data?.auditLogs);

  // The quick-action hrefs are language-agnostic in the constants module, and
  // their copy lives under pages.admin.overview.quickActions, so both are
  // resolved once here rather than in every action card.
  const quickActions = useMemo(
    () =>
      QUICK_ACTIONS.map((action) => ({
        ...action,
        href: localizedPath(action.href),
        title: t(`pages.admin.overview.quickActions.${action.id}.title`),
        description: t(
          `pages.admin.overview.quickActions.${action.id}.description`,
        ),
      })),
    [localizedPath, t],
  );

  if (isPending) {
    return <AdminDashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-7 md:py-12 font-sans antialiased">
        <div className="max-w-7xl mx-auto">
          <ErrorState
            title={t("pages.admin.overview.loadFailed.title")}
            description={
              error?.message || t("pages.admin.overview.loadFailed.description")
            }
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const hasContent =
    overviewStats.length > 0 ||
    recentActivity.length > 0 ||
    auditLogs.length > 0;

  return (
    <div className="min-h-screen bg-background text-[#222831] px-4 py-8 md:px-7 md:py-12 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-7">
        {/* ========== PAGE HEADER ========== */}
        <DashboardHeader
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          onNewCompany={() =>
            navigate(localizedPath("/dashboard/company-management"))
          }
        />

        {!hasContent ? (
          <EmptyState
            title={t("pages.admin.overview.empty.title")}
            description={t("pages.admin.overview.empty.description")}
          />
        ) : (
          <>
            {/* ========== OVERVIEW STATISTICS ========== */}
            {overviewStats.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 min-[440px]:grid-cols-2 min-[700px]:grid-cols-3 min-[1100px]:grid-cols-5 gap-4"
              >
                {overviewStats.map((stat) => (
                  <StatCard key={stat.id} {...stat} />
                ))}
              </motion.div>
            )}

            {/* ========== QUICK ACTIONS ========== */}
            <QuickActions actions={quickActions} />

            {/* ========== RECENT ACTIVITY + AUDIT LOGS ========== */}
            <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-5">
              <RecentActivity items={recentActivity} />
              <AuditLogs items={auditLogs} />
            </div>
          </>
        )}
      </div>

      {/* Subtle progress hint while a manual refresh is in flight — the data
          on screen stays visible rather than flashing the skeleton again. */}
      {isFetching && !isPending && (
        // Centering is direction-agnostic, so this intentionally stays
        // physical `left-1/2` + `-translate-x-1/2`. Using `start-1/2` here
        // would place it 50% from the right in RTL while the (physical)
        // translate still shifted it left — pushing the bar off-centre.
        <div className="pointer-events-none fixed bottom-4 left-1/2 h-1 w-24 -translate-x-1/2 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}
