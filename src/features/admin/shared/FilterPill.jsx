import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * FilterPill
 * Selectable pill button used for status/source filters.
 *
 * `label` renders verbatim; `labelKey` resolves against the `common` namespace
 * so the shared toolbar components can stay free of a namespace prop. The
 * constants module holds no i18n, so the list travels as keys and the label is
 * resolved here.
 */
export default function FilterPill({
  active = false,
  label,
  labelKey,
  onClick,
  className,
}) {
  const { t } = useTranslation("common");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 px-3.5 h-8 rounded-full border text-[12px] font-semibold transition-colors",
        active
          ? "bg-primary text-white border-primary"
          : "bg-white text-[#44474E] border-border hover:bg-background",
        className,
      )}
    >
      {labelKey ? t(labelKey) : label}
    </button>
  );
}