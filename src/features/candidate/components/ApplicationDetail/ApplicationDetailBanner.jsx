import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Ban, CalendarClock, XCircle } from "lucide-react";

const bannerIcons = {
  expired: CalendarClock,
  withdrawn: XCircle,
  closed: Ban,
};

// Keys, not resolved text: this object is built at module scope, so calling
// t() here would resolve the title once for the language active at import time
// and never update on a locale switch.
const bannerStates = {
  expired: { titleKey: "bannerExpired", subKey: "bannerExpiredSub" },
  withdrawn: { titleKey: "bannerWithdrew", subKey: "bannerWithdrewSub" },
  closed: { titleKey: "bannerClosed", subKey: "bannerClosedSub" },
};

export default function ApplicationDetailBanner({ viewState }) {
  const { t } = useTranslation("dashboard");
  if (!["expired", "withdrawn", "closed"].includes(viewState)) return null;

  const BannerIcon = bannerIcons[viewState];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-5 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm bg-background border border-border text-[#44474E]"
    >
      <BannerIcon className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <div className="text-[13.5px] font-semibold">
          {t(`pages.applicationDetail.${bannerStates[viewState].titleKey}`)}
        </div>
        <div className="text-[12.5px] mt-0.5 opacity-80">
          {t(`pages.applicationDetail.${bannerStates[viewState].subKey}`)}
        </div>
      </div>
    </motion.div>
  );
}
