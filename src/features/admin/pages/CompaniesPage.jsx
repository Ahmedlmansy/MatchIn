// src/features/admin/pages/CompaniesPage.jsx
//
// Admin company list. Reads through useAdminCompaniesQuery; verification
// actions go through useUpdateAdminCompanyMutation, which invalidates the list
// and the overview counters on success. Creation goes through
// useCreateAdminCompanyMutation, which invalidates the same keys — so the new
// row appears without a manual refetch.

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  useAdminCompaniesQuery,
  useCreateAdminCompanyMutation,
  useUpdateAdminCompanyMutation,
} from "@/features/admin/hooks";
import { ErrorState, ResultsPagination } from "@/features/admin/shared";
import { filtersToUrlParams } from "@/features/admin/api/normalize";
import { translateAdminValue } from "@/features/admin/shared/formatting/locale";
import { companyFiltersFromParams } from "@/features/admin/shared/listFilterParams";
import {
  COMPANY_DATE_FILTER_KEYS,
  COMPANY_SORT_FILTER_KEYS,
  COMPANY_STATUS_FILTER_KEYS,
} from "@/features/admin/constants/admin.filters";
import CompaniesPageHeader from "../components/companies/CompaniesPageHeader";
import CompaniesResultsBar from "../components/companies/CompaniesResultsBar";
import CompaniesTable from "../components/companies/CompaniesTable";
import CompaniesToolbar from "../components/companies/CompaniesToolbar";
import CompanyStatsStrip from "../components/companies/CompanyStatsStrip";
import CompanyStatusLegend from "../components/companies/CompanyStatusLegend";
import {
  CompanyDialog,
  CompanyFormBody,
} from "../components/companies/CompanyDialogs";

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  date: "any",
  sort: "newest",
  page: 1,
};

/**
 * CSV headers are localized — an admin exporting from an Arabic session was
 * previously handed a file with English column names. The *values* stay raw:
 * dates are exported as the ISO timestamp the server sent rather than through
 * Intl, so a spreadsheet parses them as dates rather than as prose.
 */
function downloadCompaniesCsv(companies, t) {
  if (companies.length === 0) return;
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const column = (key) => t(`pages.admin.companyList.columns.${key}`);
  const headers = [
    column("company"),
    column("verification"),
    column("contact"),
    column("created"),
    column("lastUpdated"),
  ];

  const csv = [
    ["id", ...headers].map(escape).join(","),
    ...companies.map((company) =>
      [
        company.id,
        company.name,
        translateAdminValue(company.status),
        company.email,
        company.phone,
        company.createdAt,
        company.updatedAt,
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\r\n");

  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "companies.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function CompaniesPage() {
  const { t } = useTranslation("dashboard");
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() =>
    companyFiltersFromParams(searchParams, DEFAULT_FILTERS),
  );
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Keep the URL in step with the filters — see the same effect in JobManagement.
  useEffect(() => {
    setSearchParams(filtersToUrlParams(filters), { replace: true });
  }, [filters, setSearchParams]);

  // Any filter change resets to page 1 — otherwise changing a filter while on
  // page 3 can land the user on a page that no longer exists.
  const setFilter = (key) => (value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const { data, isPending, isError, error, refetch, isFetching } =
    useAdminCompaniesQuery(filters);
  const {
    mutate: setStatus,
    isPending: isUpdating,
    error: statusError,
  } = useUpdateAdminCompanyMutation();
  const createCompany = useCreateAdminCompanyMutation();

  // Drop any error from a previous attempt when the dialog closes, otherwise
  // reopening it shows a stale failure for a form that is now empty.
  const closeAddDialog = () => {
    createCompany.reset();
    setIsAddOpen(false);
  };

  const companies = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const pageCount = data?.pageCount ?? 1;
  const start = total === 0 ? 0 : (page - 1) * (data?.perPage ?? 0) + 1;
  const end = start + companies.length - 1;

  const refresh = () => {
    const hasActiveFilters = Object.entries(DEFAULT_FILTERS).some(
      ([key, value]) => filters[key] !== value,
    );

    if (hasActiveFilters) setFilters(DEFAULT_FILTERS);
    else refetch();
  };

  const renderContent = () => {
    if (isPending || !isError) return null;
    return (
      <ErrorState
        title={t("pages.admin.companyList.loadFailed.title")}
        description={
          error?.message || t("pages.admin.companyList.loadFailed.description")
        }
        onRetry={() => refetch()}
      />
    );
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-ink antialiased sm:px-7 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <CompaniesPageHeader
          onAdd={() => setIsAddOpen(true)}
          onExport={() => downloadCompaniesCsv(companies, t)}
          onRefresh={refresh}
          isRefreshing={isFetching && !isPending}
        />

        <AnimatePresence>
          {isAddOpen && (
            <CompanyDialog onClose={closeAddDialog}>
              <CompanyFormBody
                busy={createCompany.isPending}
                error={createCompany.error?.message}
                onCancel={closeAddDialog}
                onSubmit={(form) =>
                  createCompany.mutate(form, { onSuccess: closeAddDialog })
                }
                title={t("pages.admin.companyList.form.title")}
                subtitle={t("pages.admin.companyList.form.subtitle")}
                submitLabel={t("pages.admin.companyList.form.submit")}
              />
            </CompanyDialog>
          )}
        </AnimatePresence>

        {renderContent()}

        {/* Verify/Reject from the row menu produced no feedback at all on
            failure — the switch snapped back and nothing explained why. */}
        {!isError && statusError ? (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-[13px] font-medium text-destructive"
          >
            {statusError.message}
          </p>
        ) : null}

        {!isError && (
          <>
            <CompanyStatsStrip companies={companies} total={total} />

            <CompaniesToolbar
              filters={filters}
              onSearchChange={setFilter("search")}
              onStatusFilterChange={setFilter("status")}
              onDateFilterChange={setFilter("date")}
              onClearFilters={() => setFilters(DEFAULT_FILTERS)}
              statusOptions={COMPANY_STATUS_FILTER_KEYS}
              dateOptions={COMPANY_DATE_FILTER_KEYS}
            />

            {!isPending && (
              <CompaniesResultsBar
                total={total}
                start={start}
                end={end}
                sort={filters.sort}
                onSortChange={setFilter("sort")}
                sortOptions={COMPANY_SORT_FILTER_KEYS}
              />
            )}

            <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <CompaniesTable
                companies={companies}
                isLoading={isPending}
                onVerify={(id) => setStatus({ id, status: "verified" })}
                onReject={(id) => setStatus({ id, status: "not-verified" })}
                isUpdating={isUpdating}
              />
              <ResultsPagination
                page={page}
                pageCount={pageCount}
                onPageChange={(next) =>
                  setFilters((prev) => ({ ...prev, page: next }))
                }
                label={t("pages.admin.companyList.pagesLabel")}
                summary={
                  total > 0
                    ? t("pages.admin.companyList.resultsCount", {
                        count: total,
                        start,
                        end,
                        total,
                      })
                    : null
                }
              />
            </section>

            <CompanyStatusLegend />
          </>
        )}
      </div>
    </main>
  );
}
