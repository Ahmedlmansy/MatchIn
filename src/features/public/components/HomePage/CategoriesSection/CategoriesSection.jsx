import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselItem, CarouselNav } from "@/components/ui/carousel";
import { useCarousel } from "@/components/shared/hooks/useCarousel";
import CategoryCard from "./CategoryCard";
import AIMentorCard from "../AIMentorCard";
import { CATEGORIES } from "@/features/public/shared/categories";
import { useTranslation } from "react-i18next";

/**
 * CategoriesSection — "One Platform for Every Career Path"
 *
 * A scroll-snap carousel. The previous 4-up grid became a single tall column
 * on a phone (four stacked cards, then the wide AI mentor card), which is a
 * lot of scrolling before anything else on the page. Horizontal snapping keeps
 * it to roughly one screen while staying direction-agnostic.
 */
export default function CategoriesSection() {
  const { t } = useTranslation("common");
  const { ref, scrollPrev, scrollNext } = useCarousel();

  return (
    <section
      id="categories"
      className="mx-auto w-full scroll-mt-20 max-w-[1280px] px-6 py-16 md:px-10 lg:px-16 lg:py-24"
    >
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
          {t("home.categories.badge")}
        </Badge>
        <h2 className="font-headline-xl text-[34px] font-bold tracking-tight text-ink sm:text-[42px]">
          {t("home.categories.title")}
        </h2>
        <p className="font-body-lg text-muted">{t("home.categories.description")}</p>

        <CarouselNav onPrev={scrollPrev} onNext={scrollNext} className="mt-2" />
      </motion.div>

      <Carousel ref={ref} aria-label={t("home.categories.title")}>
        {CATEGORIES.map((category, index) => (
          <CarouselItem key={category.id}>
            <CategoryCard category={category} index={index} />
          </CarouselItem>
        ))}
      </Carousel>

      <AIMentorCard />
    </section>
  );
}