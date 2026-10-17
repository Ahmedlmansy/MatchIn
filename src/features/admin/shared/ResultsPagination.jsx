// src/features/admin/shared/ResultsPagination.jsx
//
// The one pager for every admin list.
//
// ── Why it replaces the two copies it supersedes ──────────────────────────
// UserManagementPage/Pagination.jsx and companies/CompanyPagination.jsx were
// near-identical, and both rendered `Array.from({ length: pageCount })` — one
// button per page. That was harmless only because pageCount was always 1: the
// normalizer threw the paginator metadata away, so every list reported a single
// page and no pager was ever reachable. With pagination fixed, the naive render
// becomes a real problem of its own: 340 users at 8 per page is 43 buttons in
// a row. So the page list is windowed here rather than exhaustive.
//
// Renders first / last / current±1 with ellipses, which stays readable at any
// page count.

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/** How many pages either side of the current one to keep visible. */
const WINDOW = 1;

/**
 * [1, …, 4, 5, 6, …, 20] — the page numbers to render, with `null` standing in
 * for an ellipsis. Always includes the first and last page so the user can see
 * how far there is to go and jump to either end.
 */
function visiblePages(page, pageCount) {
  if (pageCount <= 1) return [1];

  const pages = new Set([1, pageCount]);
  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= pageCount) pages.add(candidate);
  }

  const sorted = [...pages].sort((a, b) => a - b);

  // Turn the gaps between consecutive numbers into a single ellipsis.
  return sorted.reduce((result, current, index) => {
    if (index > 0 && current - sorted[index - 1] > 1) result.push(null);
    result.push(current);
    return result;
  }, []);
}

export default function ResultsPagination({
  page = 1,
  pageCount = 1,
  onPageChange,
  /** Rendered on the left, e.g. "Showing 1–8 of 340 users". */
  summary = null,
  label,
}) {
  const { t } = useTranslation("common");

  if (pageCount <= 1) return null;

  const goTo = (next) => onPageChange(Math.min(pageCount, Math.max(1, next)));

  return (
    <nav
      aria-label={label ?? t("ui.a11y.resultsPages")}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3.5"
    >
      <div className="text-[13px] text-muted">
        {summary ?? t("ui.pagination.page", { page, total: pageCount })}
      </div>

      <div className="flex items-center gap-1.5">
        <PageButton
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          aria-label={t("ui.pagination.previous")}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </PageButton>

        {visiblePages(page, pageCount).map((pageNumber, index) =>
          pageNumber === null ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="min-w-[22px] text-center text-[13px] text-muted"
            >
              …
            </span>
          ) : (
            <PageButton
              key={pageNumber}
              active={pageNumber === page}
              onClick={() => goTo(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </PageButton>
          ),
        )}

        <PageButton
          disabled={page >= pageCount}
          onClick={() => goTo(page + 1)}
          aria-label={t("ui.pagination.next")}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({ children, active, disabled, onClick, ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-[34px] min-w-[34px] rounded-lg border px-2.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-ink hover:bg-background",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
