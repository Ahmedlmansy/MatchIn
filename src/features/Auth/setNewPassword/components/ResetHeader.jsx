import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocalizedPath } from "@/utils/routes";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default function ResetHeader() {
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("common");

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-stone-50 px-6 py-4 sm:px-8">
      <Link
        to={localizedPath("/auth/login")}
        className="flex items-center gap-2 text-sm font-semibold text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("auth.reset.back")}
      </Link>

      <LanguageSwitcher />
    </header>
  );
}
