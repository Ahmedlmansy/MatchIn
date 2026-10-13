import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Building, RefreshCcw } from "lucide-react";
import { JOB_STATUS_OPTIONS } from "@/features/admin/constants/admin.filters";

/**
 * JobActionMenu
 * Row-level "MoreVertical" dropdown with click-outside detection and a
 * Framer Motion enter/exit animation. Actions are real: open the company,
 * or change the job status through the update mutation.
 */
export default function JobActionMenu({
  job,
  isOpen,
  onToggle,
  companyHref,
  onChangeStatus,
  isUpdating,
}) {
  const menuRef = useRef(null);

  // Close the menu when clicking anywhere outside of it.
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-background transition-colors"
        aria-label={`Actions for ${job.title}`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 z-20 bg-white border border-border rounded-xl shadow-lg py-1.5 w-48"
          >
            {companyHref && (
              <Link
                to={companyHref}
                onClick={() => onToggle(false)}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-[12.5px] text-[#44474E] hover:bg-background transition-colors text-left"
              >
                <Building className="w-4 h-4 text-muted" /> Open Company
              </Link>
            )}

            <p className="px-3.5 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Set status
            </p>
            {JOB_STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                disabled={isUpdating}
                onClick={() => onChangeStatus(option)}
                className={`w-full flex items-center justify-between rounded-lg px-3.5 py-1.5 text-[12.5px] transition-colors text-left ${
                  job.status === option.toLowerCase()
                    ? "font-bold text-primary"
                    : "text-[#44474E] hover:bg-background"
                } disabled:opacity-50`}
              >
                {option}
                {isUpdating && job.status !== option.toLowerCase() && (
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}