// src/components/shared/hooks/useCarousel.js
//
// Minimal scroll-by-page behaviour for the scroll-snap Carousel.
//
// Deliberately tiny: it reads scrollWidth/clientWidth and calls scrollBy, so
// it never needs to know the index of the current slide. Because the scroller
// inherits `direction` from the document, the browser already resolves
// scrollLeft semantics correctly for RTL — no sign flipping needed here, and
// adding any would be the bug.

import { useCallback, useEffect, useRef, useState } from "react";

export function useCarousel() {
  const ref = useRef(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  // Recalculate on resize so a rotated phone or a window resize re-enables
  // the arrows when the content stops overflowing.
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const update = () => {
      // maxScroll is 0 (or negative) when everything already fits, which is
      // how we decide to hide the controls entirely.
      const maxScroll = element.scrollWidth - element.clientWidth;
      setCanScrollBack(element.scrollLeft > 1);
      setCanScrollForward(element.scrollLeft < maxScroll - 1);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const scrollByPage = useCallback((direction) => {
    const element = ref.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: "smooth" });
  }, []);

  return {
    ref,
    canScrollBack,
    canScrollForward,
    scrollPrev: useCallback(() => scrollByPage(-1), [scrollByPage]),
    scrollNext: useCallback(() => scrollByPage(1), [scrollByPage]),
  };
}