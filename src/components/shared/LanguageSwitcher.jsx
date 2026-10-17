import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function LanguageSwitcher() {
  const { lang = "en" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const nextLanguage = lang === "ar" ? "en" : "ar";

  const changeLanguage = () => {
    const pathWithoutLanguage =
      location.pathname.replace(/^\/(en|ar)/, "") || "/";
    navigate(`/${nextLanguage}${pathWithoutLanguage}${location.search}`, {
      replace: true,
    });
  };

  return (
    <button
      type="button"
      onClick={changeLanguage}
      className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
      aria-label={t("auth.switchLanguage")}
    >
      <Globe className="h-4 w-4" />
      {t("auth.language")}
    </button>
  );
}
