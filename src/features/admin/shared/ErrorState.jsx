import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * ErrorState
 * Centered error card with an icon, message and a retry action.
 */
export default function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  className,
}) {
  const { t } = useTranslation("common");

  // Defaults resolve at render time rather than as default parameter values:
  // a default parameter is evaluated once per module load and would freeze the
  // English string for the whole session.
  const heading = title ?? t("ui.adminShared.errorTitle");
  const body = description ?? t("ui.adminShared.errorDescription");
  const action = retryLabel ?? t("ui.adminShared.retry");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-border rounded-3xl py-20 px-6 text-center shadow-sm ${
        className ?? ""
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#B3271E]/10 flex items-center justify-center mx-auto mb-5 text-[#B3271E]">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="font-bold text-[20px] mb-2 text-[#1B1C1A]">{heading}</h2>
      <p className="text-[13.5px] text-muted max-w-sm mx-auto mb-7">
        {body}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-primary hover:bg-[#0F2036] text-white text-[13px] font-semibold px-6 h-11 rounded-full inline-flex items-center gap-2 shadow-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> {action}
        </button>
      )}
    </motion.div>
  );
}
