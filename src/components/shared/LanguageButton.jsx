import { useTranslation } from "react-i18next";

const LABELS = {
  en: "EN",
  ar: "AR",
};

/**
 * Single-button language switch.
 *
 * Deliberately not the two-option pill (LanguageToggle): on a phone header
 * that pill spends ~72px of a 360px bar and reads as a control the user has to
 * inspect before touching. This renders only the language it will switch TO,
 * so one tap is unambiguous. The accessible name still spells out the full
 * target language via `auth.switchLanguage` ("العربية" / "English").
 *
 * Controlled: pass `language` (current code) and `onChange` (receives target).
 */
export default function LanguageButton({ language = "en", onChange, className = "" }) {
  const { t } = useTranslation("common");
  const target = language === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => onChange?.(target)}
      aria-label={t("auth.switchLanguage")}
      title={t("auth.switchLanguage")}
      className={`inline-flex h-9 shrink-0 items-center rounded-full border border-border bg-background px-3 font-headline-sm text-[12px] font-semibold tracking-wide text-primary transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none ${className}`}
    >
      {LABELS[target]}
    </button>
  );
}
