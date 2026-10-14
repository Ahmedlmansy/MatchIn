import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import ApplicationDetailsDialog from "../components/ApplicationPage/ApplicationDetailsDialog";
import ApplicationFilters from "../components/ApplicationPage/ApplicationFilters";
import ApplicationList from "../components/ApplicationPage/ApplicationList";
import ApplicationStateViews from "../components/ApplicationPage/ApplicationStateViews";
import ApplicationStats from "../components/ApplicationPage/ApplicationStats";
import ApplicationToast from "../components/ApplicationPage/ApplicationToast";
import { useApplicationsQuery, useWithdrawApplicationMutation } from "../hooks/useApplicationsQuery";

export default function ApplicationTracker() {
  const { t } = useTranslation("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeModalApp, setActiveModalApp] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // جلب الطلبات الحقيقية باستخدام TanStack Query
  const { data: applications = [], isLoading, isError, refetch } = useApplicationsQuery();
  
  // تفعيل mutation الخاصة بسحب الطلب
  const withdrawMutation = useWithdrawApplicationMutation();

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleWithdraw = (id) => {
    withdrawMutation.mutate(id, {
      onSuccess: () => {
        showToast("Application marked as withdrawn successfully.");
      },
      onError: () => {
        showToast("Failed to withdraw application.");
      }
    });
  };

  const filteredApplications = useMemo(() => {
    const list = Array.isArray(applications) ? applications : [];
    
    return list
      .filter((app) => {
        const normalizedQuery = searchQuery.toLowerCase();
        const matchesQuery =
          app.title?.toLowerCase().includes(normalizedQuery) ||
          app.company?.toLowerCase().includes(normalizedQuery);
        const matchesStatus =
          statusFilter === "all" || app.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((first, second) => {
        if (sortBy === "match") return (second.matchScore || 0) - (first.matchScore || 0);
        return new Date(second.appliedDate || 0) - new Date(first.appliedDate || 0);
      });
  }, [applications, searchQuery, statusFilter, sortBy]);

  const stats = useMemo(
    () => {
      const list = Array.isArray(applications) ? applications : [];
      return {
        total: list.length,
        underReview: list.filter((app) => app.status === "under-review").length,
        interview: list.filter((app) => app.status === "interview").length,
        offer: list.filter((app) => app.status === "offer").length,
        rejected: list.filter((app) => app.status === "rejected").length,
      };
    },
    [applications],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  // تحديد حالة العرض بناءً على حالة الـ Query
  const viewState = isLoading ? "loading" : isError ? "error" : "loaded";

  return (
    <div className="min-h-screen bg-background text-[#1B1C1A] font-inter antialiased selection:bg-primary selection:text-white pb-12">
      <main className="max-w-270 mx-auto px-4 sm:px-5 py-6 sm:py-8">
        <div className="mb-7">
          <h1 className="font-dm-sans font-extrabold text-2xl sm:text-[26px] tracking-tight text-[#1B1C1A]">
            {t("pages.applicationTracker.title")}
          </h1>
          <p className="text-[13.5px] text-muted mt-1">
            {t("pages.applicationTracker.description")}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {viewState !== "loaded" && (
            <ApplicationStateViews
              key={viewState}
              viewState={viewState}
              onRetry={refetch}
            />
          )}

          {viewState === "loaded" && (
            <motion.div
              key="loaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <ApplicationStats stats={stats} />
              <ApplicationFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
              <ApplicationList
                applications={filteredApplications}
                onOpenDetails={(app) => {
                  setActiveModalApp(app);
                }}
                onWithdraw={handleWithdraw}
                onClearFilters={clearFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ApplicationDetailsDialog
        app={activeModalApp}
        onClose={() => setActiveModalApp(null)}
        onToast={showToast}
      />
      <ApplicationToast message={toastMessage} />
    </div>
  );
}