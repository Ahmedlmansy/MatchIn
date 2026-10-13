// src/features/admin/pages/AdminOverview.jsx
//
// Admin overview. Reads through useAdminDashboardQuery and renders the view
// model that turns the normalized payload into the exact card/list props.

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const { data, isPending, isError, error, refetch, isFetching } = useAdminDashboardQuery();

  // Domain data -> the exact props the cards/lists render (icons, Tailwind
  // classes, title/meta segments). See adminDashboardViewModel.js.
  const overviewStats = useMemo(() => buildOverviewStats(data?.stats), [data?.stats]);
  const recentActivity = useMemo(() => buildRecentActivity(data?.recentActivity), [data?.recentActivity]);
  const auditLogs = useMemo(() => buildAuditLogs(data?.auditLogs), [data?.auditLogs]);

  // The quick-action hrefs are language-agnostic in the constants module, so
  // they get localized once here rather than in every action card.
  const quickActions = useMemo(
    () => QUICK_ACTIONS.map((action) => ({ ...action, href: localizedPath(action.href) })),
    [localizedPath],
  );

  if (isPending) {
    return <AdminDashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-7 md:py-12 font-sans antialiased">
        <div className="max-w-7xl mx-auto">
          <ErrorState
            title="Couldn't load the dashboard"
            description={error?.message || "Something went wrong on our end. Please try again."}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const hasContent =
    overviewStats.length > 0 || recentActivity.length > 0 || auditLogs.length > 0;

  return (
    <div className="min-h-screen bg-background text-[#222831] px-4 py-8 md:px-7 md:py-12 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-7">
        {/* ========== PAGE HEADER ========== */}
        <DashboardHeader
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          onNewCompany={() => navigate(localizedPath("/dashboard/company-management"))}
        />

        {!hasContent ? (
          <EmptyState
            title="Nothing to show yet"
            description="Once companies, jobs and applications start coming in, they'll appear here."
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