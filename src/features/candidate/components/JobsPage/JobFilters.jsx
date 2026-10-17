import { AnimatePresence, motion } from "framer-motion";
import { ListFilter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function JobFilters({
  open,
  onToggle,
  filters,
  onFilterChange,
  onSearch,
}) {
  // Every key this file uses lives under ui.*, which is in the `common`
  // namespace. Resolving against `dashboard` made all four labels fall back
  // to the English string they used to carry inline.
  const { t } = useTranslation("common");

  const activeFilterCount = [
    filters.search,
    filters.location !== "All Locations",
    filters.workType !== "All Types",
    filters.experienceLevel !== "Junior",
  ].filter(Boolean).length;

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleFilterSelectChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: "",
      location: "All Locations",
      workType: "All Types",
      experienceLevel: "Junior",
      sortBy: "match",
    });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-0 flex flex-col gap-3 md:flex-row">
        <div className="relative flex flex-1 items-center">
          <Search className="absolute inset-s-3 z-10 h-5 w-5 text-muted" />
          <Input
            type="search"
            aria-label={t("ui.jobFilters.searchAria")}
            placeholder={t("ui.jobFilters.searchPlaceholder")}
            value={filters.search}
            onChange={handleSearchChange}
            className="h-11 rounded-xl border-border bg-background ps-10 pe-3 text-sm focus-visible:border-primary focus-visible:ring-primary/10"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="absolute inset-e-3 h-5 w-5 text-muted hover:text-primary"
              aria-label={t("ui.jobFilters.clearSearchAria")}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="filters-drawer"
          variant="outline"
          className="h-11 rounded-xl border-border bg-[rgb(234,232,228)] px-4 font-bold text-primary hover:bg-border"
        >
          <ListFilter
            className={`h-4.5 w-4.5 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
          {t("ui.jobFilters.filters")}
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <Button
          type="button"
          onClick={() => onFilterChange({ sortBy: "match" })}
          className="h-11 rounded-xl px-6 font-bold"
        >
          {t("ui.jobFilters.search")}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="filters-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-4 border-t border-border pt-3 md:flex-row">
              <FilterSelect
                label={t("ui.jobFilters.location")}
                value={filters.location}
                onChange={(value) => handleFilterSelectChange("location", value)}
                // Wire values, not copy: these are sent verbatim as query
                // params, so localising them would break the API contract.
                options={["All Locations", "Cairo, Egypt", "Remote", "Alexandria, Egypt", "Giza, Egypt", "Riyadh, KSA", "Dubai, UAE", "Remote Worldwide"]}
              />
              <FilterSelect
                label={t("ui.jobFilters.workType")}
                value={filters.workType}
                onChange={(value) => handleFilterSelectChange("workType", value)}
                // Wire values, as above.
                options={["All Types", "Remote", "Hybrid", "On-site"]}
              />
              <FilterSelect
                label={t("ui.jobFilters.experienceLevel")}
                value={filters.experienceLevel}
                onChange={(value) => handleFilterSelectChange("experienceLevel", value)}
                options={["Junior", "Mid-Senior", "Lead"]}
              />
              <FilterSelect
                label={t("ui.jobFilters.sortBy")}
                value={filters.sortBy}
                onChange={(value) => handleFilterSelectChange("sortBy", value)}
                options={[
                  { value: "match", labelKey: "ui.jobFilters.bestMatch" },
                  { value: "recent", labelKey: "ui.jobFilters.mostRecent" },
                  { value: "salary", labelKey: "ui.jobFilters.highestSalary" },
                ]}
              />
              <div className="flex flex-1 items-end gap-2">
                <Button type="button" size="sm" className="w-full font-bold" onClick={clearAllFilters} variant="outline">
                  {t("ui.jobFilters.clearAll")}
                </Button>
                <Button type="button" size="sm" className="w-full font-bold">
                  {t("ui.jobFilters.applyFilters")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  const { t } = useTranslation("dashboard");
  const isArrayOfObjects = options.length > 0 && typeof options[0] === "object";

  return (
    <div className="flex-1">
      <label className="mb-1 block text-xs font-bold text-secondary">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full rounded-lg border-border bg-background text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={isArrayOfObjects ? option.value : option} value={isArrayOfObjects ? option.value : option}>
              {isArrayOfObjects
                ? option.labelKey
                  ? t(option.labelKey)
                  : option.label
                : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}