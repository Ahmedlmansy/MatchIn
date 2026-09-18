import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ListFilter, Search } from "lucide-react";

export default function JobFilters({ open, onToggle }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-0 flex flex-col gap-3 md:flex-row">
        <div className="relative flex flex-1 items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
          <Search className="h-5 w-5 text-muted" />
          <input
            type="search"
            aria-label="Search jobs"
            placeholder="Search by job title, skill, or company..."
            className="w-full border-none bg-transparent p-2.5 text-sm outline-none focus:ring-0"
          />
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="filters-drawer"
          className="flex h-11 items-center gap-2 rounded-xl border border-border bg-[rgb(234,232,228)] px-4 text-sm font-bold text-primary transition-colors hover:bg-border"
        >
          <ListFilter
            className={`h-4.5 w-4.5 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
          Filters
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
            2
          </span>
        </button>
        <button
          type="button"
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-[#052045]"
        >
          Search
        </button>
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
                label="Location"
                options={["All Locations", "Cairo, Egypt", "Remote"]}
              />
              <FilterSelect
                label="Work Type"
                options={["All Types", "Remote", "Hybrid", "On-site"]}
              />
              <FilterSelect
                label="Experience Level"
                options={["Junior", "Mid-Senior", "Lead"]}
              />
              <div className="flex flex-1 items-end gap-2">
                <button className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-white">
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({ label, options }) {
  return (
    <div className="flex-1">
      <label className="mb-1 block text-xs font-bold text-secondary">
        {label}
      </label>
      <div className="relative">
        <ChevronDown className="absolute inset-e-3 top-[50%] h-4 w-4 translate-y-[-50%]" />
        <select className="w-full appearance-none rounded-lg border border-border bg-background p-2 text-xs outline-none">
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
