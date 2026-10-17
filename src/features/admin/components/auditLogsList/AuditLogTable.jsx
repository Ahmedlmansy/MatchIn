import { useTranslation } from "react-i18next";
import { ArrowUpDown, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import AuditLogRow from "./AuditLogRow";

// The trailing column has no header, so it carries no key.
const COLUMNS = [
  { key: "timestamp", labelKey: "timestamp", sortable: true },
  { key: "actor", labelKey: "actor" },
  { key: "action", labelKey: "action" },
  { key: "entity", labelKey: "entity" },
  { key: "previous", labelKey: "previous" },
  { key: "new", labelKey: "new" },
  { key: "ip", labelKey: "ip" },
  { key: "actions", labelKey: null },
];

const KEY = "pages.admin.auditLogs.table";

/** Window of up to 3 page numbers centered around the current page. */
function getPageNumbers(page, pageCount) {
  const start = Math.min(
    Math.max(page, 1),
    Math.max(pageCount - 2, 1),
  );
  return Array.from(
    { length: Math.min(3, pageCount) },
    (_, index) => start + index,
  ).filter((number) => number <= pageCount);
}

/**
 * AuditLogTable
 * Table card container: manages column headers, rows, the empty state
 * and the pagination footer.
 */
export default function AuditLogTable({
  logs = [],
  onSelectLog,
  page = 1,
  pageCount = 1,
  onPageChange,
  range,
  emptyMessage,
  className,
}) {
  const { t } = useTranslation("dashboard");
  const pageNumbers = getPageNumbers(page, pageCount);

  return (
    <div
      className={cn(
        "bg-white border border-border rounded-2xl shadow-sm overflow-hidden",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse min-w-225">
          <thead>
            <tr className="bg-[#f7f4ef] border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "py-3 px-4",
                    column.sortable && "cursor-pointer hover:text-[#222831]",
                    column.key === "actions" && "w-12",
                  )}
                >
                  {column.sortable ? (
                    <div className="flex items-center gap-1">
                      {t(`${KEY}.${column.labelKey}`)}
                      <ArrowUpDown className="w-3 h-3 text-primary" />
                    </div>
                  ) : (
                    column.labelKey && t(`${KEY}.${column.labelKey}`)
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs sm:text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-16 text-center">
                  <Inbox className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-[13.5px] text-muted">
                    {emptyMessage ?? t(`${KEY}.empty`)}
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <AuditLogRow key={log.id} log={log} onSelect={onSelectLog} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3.5 px-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs sm:text-sm text-muted">
          {range
            ? t(`${KEY}.showing`, {
                count: range.total,
                from: range.from,
                to: range.to,
                total: range.total,
              })
            : t(`${KEY}.pageOf`, { page, total: pageCount })}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 hover:enabled:bg-[#f5f2ec] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange?.(pageNumber)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-semibold transition-colors",
                pageNumber === page
                  ? "bg-primary text-white"
                  : "border border-border hover:bg-[#f5f2ec]",
              )}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => onPageChange?.(page + 1)}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 hover:enabled:bg-[#f5f2ec] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
