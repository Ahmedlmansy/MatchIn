import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselItem, CarouselNav } from "@/components/ui/carousel";
import { useCarousel } from "@/components/shared/hooks/useCarousel";
import JobCard from "@/components/shared/JobCard";
import { JOBS, JOB_CATEGORIES } from "@/constants/jobsMock";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";

/**
 * LatestJobsSection — "Latest Jobs & Open Roles"
 *
 * A scroll-snap carousel on every breakpoint. Previously this was a
 * `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` grid, which on a phone stacked
 * six full-width cards into a very long scroll and pushed "Explore all" far
 * below the fold. One card-width peek plus arrows is the expected mobile
 * pattern for this content and keeps the section a fixed height.
 *
 * The track inherits `direction`, so RTL reverses the scroll order natively.
 */
export default function LatestJobsSection() {
  const [category, setCategory] = useState("all");
  const { t } = useTranslation("common");
  const localizedPath = useLocalizedPath();
  const { ref, scrollPrev, scrollNext } = useCarousel();

  const filteredJobs = useMemo(
    () =>
      category === "all"
        ? JOBS
        : JOBS.filter((job) => job.categories.includes(category)),
    [category],
  );

  return (
    <section
      id="jobs"
      className="mx-auto w-full max-w-[1280px] scroll-mt-20 px-6 py-16 md:px-10 lg:px-16 lg:py-24"
    >
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex max-w-2xl flex-col gap-2">
          <Badge
            variant="outline"
            className="w-fit self-start rounded-full border-border bg-surface px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary"
          >
            {t("home.jobs.badge")}
          </Badge>
          <h2 className="font-headline-xl text-[32px] font-bold tracking-tight text-ink sm:text-[40px]">
            {t("home.jobs.title")}
          </h2>
          <p className="font-body-lg text-muted">{t("home.jobs.description")}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-body-sm text-[13px] text-muted">
              {t("home.jobs.updated")}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
          </div>

          <CarouselNav onPrev={scrollPrev} onNext={scrollNext} />
        </div>
      </div>

      {/* Category filters */}
      <Tabs
        value={category}
        onValueChange={setCategory}
        className="mb-8 min-w-0 overflow-x-auto border-b border-border pb-2"
      >
        <TabsList className="h-auto w-max min-w-full flex-nowrap justify-start gap-2 bg-transparent p-0">
          {JOB_CATEGORIES.map((c) => (
            <TabsTrigger
              key={c.value}
              value={c.value}
              className="flex-none rounded-full border border-border bg-surface px-4 py-1.5 font-headline-sm text-[13px] font-medium text-muted shadow-none transition-colors data-[state=active]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none hover:bg-background hover:text-ink"
            >
              {t(`home.jobCategories.${c.value}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Carousel */}
      <Carousel ref={ref} key={category} aria-label={t("home.jobs.title")}>
        {filteredJobs.map((job, index) => (
          <CarouselItem key={job.id}>
            <JobCard job={job} index={index} />
          </CarouselItem>
        ))}
      </Carousel>

      {/* Load more */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10 text-center"
      >
        <Button
          asChild
          variant="outline"
          className="gap-2 rounded-xl border-border bg-surface px-8 py-3 font-headline-sm text-[14px] font-semibold text-primary shadow-sm hover:bg-background hover:shadow"
        >
          {/* The arrow flips automatically in RTL (see index.css). */}
          <a href={localizedPath("/dashboard/jobs")}>
            {t("home.jobs.exploreAll")}
            <ArrowRight className="h-[18px] w-[18px]" />
          </a>
        </Button>
      </motion.div>
    </section>
  );
}