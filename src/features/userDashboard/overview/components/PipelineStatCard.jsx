import { motion } from "framer-motion";

export default function PipelineStatCard({ stat, index = 0 }) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group rounded-xl border border-border/70 bg-background p-4 transition-all hover:border-border"
    >
      <div className="mb-2 flex items-center justify-between text-muted">
        <span className="text-[11px] font-bold uppercase tracking-wider">{stat.label}</span>
        <Icon className={`h-4 w-4 ${stat.iconClass}`} />
      </div>

      <div className="flex items-baseline gap-2">
        <div className={`font-serif text-[28px] font-bold leading-none ${stat.valueClass}`}>
          {stat.value}
        </div>
        <span className={`text-[11px] font-semibold ${stat.suffixClass}`}>{stat.suffix}</span>
      </div>

    </motion.div>
  );
}
