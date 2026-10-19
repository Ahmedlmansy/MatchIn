import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ActionCard from "./ActionCard";
import { containerVariants } from "../../shared/motionVariants";


export default function QuickActions({ actions = [], title }) {
  const { t } = useTranslation("dashboard");

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-[#222831]">
          {title ?? t("pages.admin.overview.sections.quickActions")}
        </h2>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 min-[480px]:grid-cols-2 min-[900px]:grid-cols-4 gap-3.5"
      >
        {actions.map((action) => (
          <ActionCard key={action.id} {...action} />
        ))}
      </motion.div>
    </section>
  );
}