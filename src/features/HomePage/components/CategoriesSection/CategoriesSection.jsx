import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import CategoryCard from "./CategoryCard";
import AIMentorCard from "../AIMentorCard";
import { CATEGORIES } from "@/constants/categories";


export default function CategoriesSection() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-10 lg:px-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-2 text-center"
      >
        <Badge
          variant="outline"
          className="w-fit self-center rounded-full border-border bg-surface px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary"
        >
          Specialized Sectors
        </Badge>
        <h2 className="font-headline-xl text-[34px] font-bold tracking-tight text-ink sm:text-[42px]">
          One Platform for Every Career Path
        </h2>
        <p className="font-body-lg text-muted">
          Browse curated categories and use AI-powered guidance to find opportunities that match
          your goals and skills.
        </p>
      </motion.div>

      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>

      <AIMentorCard />
    </section>
  );
}
