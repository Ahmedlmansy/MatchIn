// src/components/ui/carousel.jsx
//
// A CSS-scroll-snap carousel. No JS slider library.
//
// Why scroll-snap rather than a transform-based slider: it keeps native
// momentum scrolling, keyboard support, touch gestures and screen-reader
// focus for free, and it degrades to a plain horizontally-scrollable strip if
// anything fails. A transform slider has to reimplement all of that.
//
// ── RTL ──────────────────────────────────────────────────────────────────
// The track inherits `direction` from <html>, so the browser lays it out
// right-to-left and resolves scrollLeft semantics itself. We therefore never
// touch scroll position manually — snapping and the initial position are
// handled natively, which is exactly what makes this direction-agnostic.
//
// The chevrons flip automatically via the `[dir="rtl"] .lucide-*` rules in
// index.css, so they need no per-component `rtl:` variants here.
//
// Track/item styling lives in index.css (.carousel-track / .carousel-item) so
// the same responsive widths are shared by every carousel on the site.

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Carousel = forwardRef(function Carousel({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("carousel-track -mx-6 px-6 pb-2 md:mx-0 md:px-0", className)}
      {...props}
    >
      {children}
    </div>
  );
});

const CarouselItem = forwardRef(function CarouselItem({ className, ...props }, ref) {
  return <div ref={ref} className={cn("carousel-item", className)} {...props} />;
});

/**
 * CarouselNav
 * Prev/next buttons, meant to sit inline in the section header rather than as
 * an overlay on the track — an absolutely-positioned overlay lands exactly on
 * top of the first/last card and blocks it on wide screens.
 *
 * Hidden on phones, where swiping is the expected interaction and the buttons
 * would only consume width. Arrows flip automatically in RTL (index.css).
 */
function CarouselNav({ className, onPrev, onNext, labels = {} }) {
  return (
    <div className={cn("hidden items-center gap-2 md:flex", className)}>
      <NavButton onClick={onPrev} label={labels.prev ?? "Previous"}>
        <ChevronLeft className="h-4 w-4" />
      </NavButton>

      <NavButton onClick={onNext} label={labels.next ?? "Next"}>
        <ChevronRight className="h-4 w-4" />
      </NavButton>
    </div>
  );
}

function NavButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-ink shadow-sm transition-colors hover:bg-background"
    >
      {children}
    </button>
  );
}

export { Carousel, CarouselItem, CarouselNav };