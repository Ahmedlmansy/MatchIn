import { useTranslation } from "react-i18next";
import LogoText from "@/assets/logo/logo_text.svg";

const CURRENT_YEAR = new Date().getFullYear();

export default function DashboardFooter() {
  const { t: tCommon } = useTranslation("common");
  return (
    <footer className="w-full border-t border-border bg-surface py-8">
      <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-4 px-6 text-muted sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="font-serif text-[18px] font-bold text-primary">
            <img src={LogoText} alt={tCommon("ui.footer.logoAlt")} />
          </span>
          <span className="text-[12px] text-muted/70">
            {tCommon("home.footer.copyright", { year: CURRENT_YEAR })}
          </span>
        </div>
        <div className="flex items-center gap-6 text-[13px]">
          <a
            href="#"
            className="font-medium transition-colors hover:text-primary"
          >
            {tCommon("ui.footer.platformIntegrity")}
          </a>
          <a
            href="#"
            className="font-medium transition-colors hover:text-primary"
          >
            {tCommon("ui.footer.privacyArchitecture")}
          </a>
          <a
            href="#"
            className="font-medium transition-colors hover:text-primary"
          >
            {tCommon("ui.footer.termsOfService")}
          </a>
          <a
            href="#"
            className="font-medium transition-colors hover:text-primary"
          >
            {tCommon("ui.footer.talentApi")}
          </a>
        </div>
      </div>
    </footer>
  );
}
