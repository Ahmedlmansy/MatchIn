import PhilosophyContent from "./PhilosophyContent";
import PhilosophyVisual from "./PhilosophyVisual";


export default function PhilosophySection() {
  return (
    <section className="w-full border-y border-border bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <PhilosophyVisual />
          <PhilosophyContent />
        </div>
      </div>
    </section>
  );
}
