import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { FilterSelect } from "@/features/admin/shared";

/**
 * AuditLogsToolbar
 * Search + action/entity/actor filters + the sort dropdown.
 *
 * Filter option lists are built from the loaded rows by the page and passed
 * in, so the toolbar can never offer a filter value the data doesn't have.
 */
export default function AuditLogsToolbar({
  filters,
  onFilterChange,
  onClearFilters,
  options,
  sortOptions,
}) {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation("common");
  const chip = (name, value) => t(`pages.admin.auditLogs.toolbar.chips.${name}`, { label: value });

  const activeChips = [];

  if (filters.search) {
    activeChips.push({
      key: "search",
      label: chip("search", filters.search),
      onRemove: () => onFilterChange("search")(""),
    });
  }
  if (filters.action) {
    activeChips.push({
      key: "action",
      label: chip("action", filters.action),
      onRemove: () => onFilterChange("action")(""),
    });
  }
  if (filters.entity) {
    activeChips.push({
      key: "entity",
      label: chip("entity", filters.entity),
      onRemove: () => onFilterChange("entity")(""),
    });
  }
  if (filters.actor) {
    activeChips.push({
      key: "actor",
      label: chip("actor", filters.actor),
      onRemove: () => onFilterChange("actor")(""),
    });
  }

  return (
    <div className="space-y-3.5 mb-5">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-60 relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange("search")(event.target.value)}
            placeholder={t(`pages.admin.auditLogs.toolbar.searchPlaceholder`)}
            className="w-full h-10.5 ps-10 pe-3.5 border border-border rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted"
          />
        </div>
        <FilterSelect
          size="sm"
          value={filters.action}
          onChange={onFilterChange("action")}
          options={options.action}
          ariaLabel={t(`pages.admin.auditLogs.toolbar.actionAria`)}
        />
        <FilterSelect
          size="sm"
          value={filters.entity}
          onChange={onFilterChange("entity")}
          options={options.entity}
          ariaLabel={t(`pages.admin.auditLogs.toolbar.entityAria`)}
        />
        <FilterSelect
          size="sm"
          value={filters.actor}
          onChange={onFilterChange("actor")}
          options={options.actor}
          ariaLabel={t(`pages.admin.auditLogs.toolbar.actorAria`)}
        />
        <FilterSelect
          size="sm"
          value={filters.sort}
          onChange={onFilterChange("sort")}
          options={sortOptions}
          ariaLabel={t(`pages.admin.auditLogs.toolbar.sortAria`)}
        />
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeChips.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-primary/10 text-primary rounded-full text-xs font-semibold"
            >
              {filter.label}
              <button
                type="button"
                aria-label={tCommon("ui.adminFilters.removeChip", { label: filter.label })}
                onClick={filter.onRemove}
                className="hover:opacity-75"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold text-muted hover:text-[#222831] hover:underline px-1"
          >
            {t("pages.admin.auditLogs.filters.clearAll")}
          </button>
        </div>
      )}
    </div>
  );
}