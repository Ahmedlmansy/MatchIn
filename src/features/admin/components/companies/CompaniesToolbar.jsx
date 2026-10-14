import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * CompaniesToolbar
 * Search + status + date filters with the active-filter chip row.
 * Filter options are passed in from the page rather than imported from a
 * hard-coded list, so the toolbar stays a dumb control.
 */
export default function CompaniesToolbar({
  filters,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onClearFilters,
  statusOptions,
  dateOptions,
}) {
  const activeChips = [];

  if (filters.status !== "all") {
    const option = statusOptions.find((o) => o.value === filters.status);
    activeChips.push({
      key: "status",
      label: `Status: ${option?.label ?? filters.status}`,
      onRemove: () => onStatusFilterChange("all"),
    });
  }
  if (filters.date !== "any") {
    const option = dateOptions.find((o) => o.value === filters.date);
    activeChips.push({
      key: "date",
      label: option?.label ?? filters.date,
      onRemove: () => onDateFilterChange("any"),
    });
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by company name, email, or ID…"
            className="h-[42px] rounded-xl border-border bg-surface ps-10 text-[14px] text-ink shadow-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-0"
          />
        </div>

        <Select value={filters.status} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-[42px] min-w-[150px] rounded-xl border-border bg-surface text-[13.5px] font-medium text-ink">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.date} onValueChange={onDateFilterChange}>
          <SelectTrigger className="h-[42px] min-w-[150px] rounded-xl border-border bg-surface text-[13.5px] font-medium text-ink">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 text-[12.5px] font-semibold text-primary"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remove ${chip.label} filter`}
                className="opacity-65 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={onClearFilters}
            className="h-auto px-1 text-[12.5px] font-semibold text-muted hover:bg-transparent hover:text-ink hover:underline"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}