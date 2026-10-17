// src/features/admin/pages/AuditLogsPage.jsx
//
// Admin audit log list. Audit logs are an immutable read-only record, so this
// page has exactly one data operation: useAdminAuditLogsQuery.

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, RefreshCw } from "lucide-react";
import { PageHeader, ErrorState } from "@/features/admin/shared";
import { useAdminAuditLogsQuery } from "@/features/admin/hooks";
import { filtersToUrlParams } from "@/features/admin/api/normalize";
import { AUDIT_SORT_OPTIONS } from "@/features/admin/constants/admin.filters";
import { auditFiltersFromParams } from "@/features/admin/shared/listFilterParams";
import {
  translateAdminAuditAction,
  translateAdminEntity,
  translateAdminValue,
} from "@/features/admin/shared/formatting/locale";
import {
  AuditLogTable,
  AuditLogDrawer,
  AuditLogsToolbar,
  AuditLogsListSkeleton,
} from "@/features/admin/components/auditLogsList";

const DEFAULT_FILTERS = {
  search: "",
  action: "",
  entity: "",
  actor: "",
  sort: "newest",
  page: 1,
};

/**
 * Filter dropdown options are derived from the loaded rows rather than
 * hard-coded, so the list can never offer a filter the data doesn't contain.
 */
function optionsFrom(values, allLabel, localize = (value) => value) {
  const unique = [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
  return [
    { value: "", label: allLabel },
    ...unique.map((value) => ({ value, label: localize(value) })),
  ];
}

export default function AuditLogsList() {
  const { t } = useTranslation("dashboard");
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() =>
    auditFiltersFromParams(searchParams, DEFAULT_FILTERS),
  );
  const [selectedLog, setSelectedLog] = useState(null);

  // Keep the URL in step with the filters — see the same effect in JobManagement.
  useEffect(() => {
    setSearchParams(filtersToUrlParams(filters), { replace: true });
  }, [filters, setSearchParams]);

  // Any filter change resets to page 1 for the same reason as the other lists.
  const setFilter = (key) => (value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const { data, isPending, isError, error, refetch, isFetching } =
    useAdminAuditLogsQuery(filters);

  const logs = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const pageCount = data?.pageCount ?? 1;
  const perPage = data?.perPage ?? 0;

  const filterOptions = {
    action: optionsFrom(
      logs.map((log) => log.action),
      t(`pages.admin.auditLogs.filters.allActions`),
      (value) => translateAdminAuditAction(value),
    ),
    entity: optionsFrom(
      logs.map((log) => log.entity),
      t(`pages.admin.auditLogs.filters.allEntities`),
      translateAdminEntity,
    ),
    actor: optionsFrom(
      logs.map((log) => log.actor),
      t(`pages.admin.auditLogs.filters.allActors`),
    ),
  };

  const handleRefresh = () => {
    setFilters(DEFAULT_FILTERS);
    refetch();
  };

  const handleExport = () => {
    if (logs.length === 0) return;
    const columns = [
      [t("pages.admin.auditLogs.table.id"), "id"],
      [t("pages.admin.auditLogs.table.timestamp"), "time"],
      [t("pages.admin.auditLogs.table.actor"), "actor"],
      [t("pages.admin.auditLogs.table.role"), "role"],
      [t("pages.admin.auditLogs.table.action"), "action"],
      [t("pages.admin.auditLogs.table.entity"), "entity"],
      [t("pages.admin.auditLogs.table.entityId"), "entityId"],
      [t("pages.admin.auditLogs.table.previous"), "prev"],
      [t("pages.admin.auditLogs.table.new"), "newValue"],
      [t("pages.admin.auditLogs.table.ip"), "ip"],
    ];
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const exportValue = (log, key) => {
      if (key === "role" || key === "prev" || key === "newValue") {
        return translateAdminValue(log[key]);
      }
      if (key === "action")
        return translateAdminAuditAction(log.action, log.actionType);
      if (key === "entity") return translateAdminEntity(log.entity);
      return log[key];
    };
    const csv = [
      columns.map(([label]) => escape(label)).join(","),
      ...logs.map((log) =>
        columns.map(([, key]) => escape(exportValue(log, key))).join(","),
      ),
    ].join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit-logs.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-7 pb-16 bg-background text-[#222831] min-h-screen font-sans antialiased">
      <PageHeader
        title={t("pages.admin.auditLogs.title")}
        subtitle={t(`pages.admin.auditLogs.subtitle`)}
        meta={
          <>
            <span>{t(`pages.admin.auditLogs.readOnly`)}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{t(`pages.admin.auditLogs.records`, { count: total })}</span>
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={handleExport}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-border bg-white hover:bg-[#f5f2ec] transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />{" "}
              {t(`pages.admin.auditLogs.export`)}
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-[#182a4a] transition-colors disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />{" "}
              {t("pages.admin.auditLogs.refresh")}
            </button>
          </>
        }
      />

      {isPending && <AuditLogsListSkeleton />}

      {isError && (
        <ErrorState
          title={t(`pages.admin.auditLogs.loadFailed.title`)}
          description={
            error?.message || t(`pages.admin.auditLogs.loadFailed.description`)
          }
          onRetry={() => refetch()}
        />
      )}

      {!isPending && !isError && (
        <>
          <AuditLogsToolbar
            filters={filters}
            onFilterChange={setFilter}
            onClearFilters={() => setFilters(DEFAULT_FILTERS)}
            options={filterOptions}
            sortOptions={AUDIT_SORT_OPTIONS}
          />

          <AuditLogTable
            logs={logs}
            onSelectLog={setSelectedLog}
            page={page}
            pageCount={pageCount}
            onPageChange={(next) =>
              setFilters((prev) => ({ ...prev, page: next }))
            }
            range={{
              from: total === 0 ? 0 : (page - 1) * perPage + 1,
              to: total === 0 ? 0 : (page - 1) * perPage + logs.length,
              total,
            }}
          />

          <AuditLogDrawer
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        </>
      )}
    </div>
  );
}
