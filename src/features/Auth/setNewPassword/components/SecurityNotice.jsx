import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SecurityNotice() {
  const { t } = useTranslation("common");
  return (
    <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-slate-50 px-3 py-3 text-[11px] leading-relaxed text-slate-500">
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {t("auth.reset.security")}
      </span>
    </div>
  );
}
