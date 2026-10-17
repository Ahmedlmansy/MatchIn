import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import ListItem from "./ListItem";


export default function AuditLogs({
  items = [],
  title,
  viewAllHref = "#",
}) {
  const { t } = useTranslation(["common", "dashboard"]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-3.5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-[#222831]">
          {title ?? t("dashboard:pages.admin.overview.sections.auditLogs")}
        </h2>
        <a
          href={viewAllHref}
          className="text-[13px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          {t("ui.adminActivity.viewAll")}
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="bg-white border border-border rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <ListItem key={item.id} {...item} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}