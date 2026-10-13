import { FilterX } from "lucide-react";
import {
  SearchInput,
  SortDropdown,
  FilterPillGroup,
} from "@/features/admin/shared";

/**
 * JobManagementToolbar
 * Search input, status/source filter pills, sort dropdown and "Clear Filters".
 *
 * Options are passed in rather than imported so the page owns which filter set
 * is active (and the toolbar stays reusable if a second job list appears).
 */
export default function JobManagementToolbar({
  filters,
  onFilterChange,
  onClearFilters,
  statusOptions,
  sourceOptions,
  sortOptions,
}) {
  return (
    <div className="space-y-4">
      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <SearchInput
          value={filters.search}
          onChange={onFilterChange("search")}
          placeholder="Search by job title or company..."
        />
        <SortDropdown
          value={filters.sort}
          onChange={onFilterChange("sort")}
          options={sortOptions}
        />
      </div>

      {/* Filter Pills + Clear Filters */}
      <div className="flex items-center gap-2">
        <FilterPillGroup
          options={statusOptions}
          value={filters.status}
          onChange={onFilterChange("status")}
          className="flex-1"
        />

        <span className="w-px h-5 bg-border shrink-0 mx-1" />

        <FilterPillGroup
          options={sourceOptions}
          value={filters.source}
          onChange={onFilterChange("source")}
          className="flex-1"
        />

        <button
          type="button"
          onClick={onClearFilters}
          className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-border bg-white text-[12px] font-semibold text-[#44474E] hover:bg-background transition-colors"
        >
          <FilterX className="w-3.5 h-3.5 text-muted" />
          Clear Filters
        </button>
      </div>
    </div>
  );
}