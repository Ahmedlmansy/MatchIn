import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * SearchInput
 * Rounded search field with a leading icon, used across admin toolbars.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}) {
  const { t } = useTranslation("common");

  return (
    <div
      className={`flex-1 flex items-center gap-2 border border-border rounded-full bg-white h-11 px-4 shadow-sm focus-within:border-primary transition-colors ${
        className ?? ""
      }`}
    >
      <Search className="w-4 h-4 text-muted shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder ?? t("ui.adminShared.searchPlaceholder")}
        className="flex-1 outline-none text-[13.5px] placeholder:text-muted bg-transparent"
      />
    </div>
  );
}
