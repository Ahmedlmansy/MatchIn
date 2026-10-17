import { useTranslation } from "react-i18next";
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
 *
 * Options arrive as `{ value, labelKey }`; the label is resolved here so the
 * constants module stays free of i18n (AUTH_LOGIC_CONVENTION.md §5).
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
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation("common");

  const labelOf = (options, value) => {
    const option = options?.find((candidate) => candidate.value === value);
    return option?.labelKey
      ? tCommon(option.labelKey)
      : (option?.label ?? value);
  };

  const activeChips = [];

  if (filters.search) {
    activeChips.push({
      key: "search",
      label: tCommon("ui.adminFilters.searchChip", { label: filters.search }),
      onRemove: () => onSearchChange(""),
    });
  }
  if (filters.status !== "all") {
    activeChips.push({
      key: "status",
      label: tCommon("ui.adminFilters.statusChip", {
        label: labelOf(statusOptions, filters.status),
      }),
      onRemove: () => onStatusFilterChange("all"),
    });
  }
  if (filters.date !== "any") {
    activeChips.push({
      key: "date",
      label: labelOf(dateOptions, filters.date),
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
            placeholder={t("pages.admin.companyList.searchPlaceholder")}
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
                {tCommon(option.labelKey)}
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
                {tCommon(option.labelKey)}
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
                aria-label={tCommon("ui.adminFilters.removeChip", {
                  label: chip.label,
                })}
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
            {tCommon("ui.adminFilters.clearAll")}
          </Button>
        </div>
      )}
    </div>
  );
}
