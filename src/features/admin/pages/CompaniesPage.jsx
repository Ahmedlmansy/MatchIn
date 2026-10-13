// src/features/admin/pages/CompaniesPage.jsx
//
// Admin company list. Reads through useAdminCompaniesQuery; verification
// actions go through useUpdateAdminCompanyMutation, which invalidates the list
// and the overview counters on success.

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAdminCompaniesQuery, useUpdateAdminCompanyMutation } from "@/features/admin/hooks";
import { ErrorState, ResultsPagination } from "@/features/admin/shared";
import { filtersToUrlParams } from "@/features/admin/api/normalize";
import {
  COMPANY_DATE_FILTER_OPTIONS,
  COMPANY_SORT_OPTIONS,
  COMPANY_STATUS_FILTER_OPTIONS,
} from "@/features/admin/constants/admin.filters";
import CompaniesPageHeader from "../components/companies/CompaniesPageHeader";
import CompaniesResultsBar from "../components/companies/CompaniesResultsBar";
import CompaniesTable from "../components/companies/CompaniesTable";
import CompaniesToolbar from "../components/companies/CompaniesToolbar";
import CompanyStatsStrip from "../components/companies/CompanyStatsStrip";
import CompanyStatusLegend from "../components/companies/CompanyStatusLegend";

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  date: "any",
  sort: "newest",
  page: 1,
};

/**
 * The dashboard's "Review Pending" action links to this list as
 * `?status=pending`. Seed the filters from the URL so that link lands on the
 * filtered list it advertises instead of on everything — values outside the
 * known option sets are ignored rather than pushed into the query.
 */
function filtersFromParams(params) {
  const pickFrom = (key, allowed) => {
    const value = params.get(key);
    return value && allowed.includes(value) ? value : null;
  };

  return {
    ...DEFAULT_FILTERS,
    search: params.get("search") ?? DEFAULT_FILTERS.search,
    status:
      pickFrom(
        "status",
        COMPANY_STATUS_FILTER_OPTIONS.map((option) => option.value),
      ) ?? DEFAULT_FILTERS.status,
  };
}

const CSV_COLUMNS = [
  ["Company ID", "id"],
  ["Company", "name"],
  ["Status", "status"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["Created", "createdAt"],
  ["Last updated", "updatedAt"],
];

function downloadCompaniesCsv(companies) {
  if (companies.length === 0) return;
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    CSV_COLUMNS.map(([label]) => escape(label)).join(","),
    ...companies.map((company) =>
      CSV_COLUMNS.map(([, key]) => escape(company[key])).join(","),
    ),
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "companies.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function CompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));

  // Keep the URL in step with the filters — see the same effect in JobManagement.
  useEffect(() => {
    setSearchParams(filtersToUrlParams(filters), { replace: true });
  }, [filters, setSearchParams]);

  // Any filter change resets to page 1 — otherwise changing a filter while on
  // page 3 can land the user on a page that no longer exists.
  const setFilter = (key) => (value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const { data, isPending, isError, error, refetch, isFetching } = useAdminCompaniesQuery(filters);
  const {
    mutate: setStatus,
    isPending: isUpdating,
    error: statusError,
  } = useUpdateAdminCompanyMutation();

  const companies = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const pageCount = data?.pageCount ?? 1;
  const start = total === 0 ? 0 : (page - 1) * (data?.perPage ?? 0) + 1;
  const end = start + companies.length - 1;

  const refresh = () => {
    setFilters(DEFAULT_FILTERS);
    refetch();
  };

  const renderContent = () => {
    if (isPending || !isError) return null;
    return (
      <ErrorState
        title="Couldn't load companies"
        description={error?.message || "Something went wrong while fetching the company list."}
        onRetry={() => refetch()}
      />
    );
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-ink antialiased sm:px-7 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <CompaniesPageHeader
          onExport={() => downloadCompaniesCsv(companies)}
          onRefresh={refresh}
          isRefreshing={isFetching && !isPending}
        />

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
              statusOptions={COMPANY_STATUS_FILTER_OPTIONS}
              dateOptions={COMPANY_DATE_FILTER_OPTIONS}
            />

            {!isPending && (
              <CompaniesResultsBar
                total={total}
                start={start}
                end={end}
                sort={filters.sort}
                onSortChange={setFilter("sort")}
                sortOptions={COMPANY_SORT_OPTIONS}
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
                onPageChange={(next) => setFilters((prev) => ({ ...prev, page: next }))}
                label="Company results pages"
                summary={total > 0 ? `Showing ${start}–${end} of ${total} companies` : null}
              />
            </section>

            <CompanyStatusLegend />
          </>
        )}
      </div>
    </main>
  );
}