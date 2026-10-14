import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import fullLogo from "@/assets/logo/Full_logo_light.svg";

/**
 * AuthSidePanel
 * The decorative half of the auth pages: background image, scrim, logo and
 * marketing copy.
 *
 * ── RTL notes ────────────────────────────────────────────────────────────
 * `dir` is set on <html> by I18nSync, which flips the *layout* (CSS Grid
 * reverses column order under RTL, so this panel sits on the right in Arabic).
 * But two things here are NOT logical and so do NOT follow the flip:
 *
 *   • `linear-gradient(90deg, …)` — a gradient angle is a PHYSICAL compass
 *     direction. 90deg always points right regardless of `dir`, so the scrim
 *     stayed dark on the left edge while the panel had moved to the right.
 *     There is no `to-inline-end` keyword in CSS, so the angle is driven by a
 *     custom property that the `rtl:` variant flips to 270deg.
 *
 *   • `rounded-ee-*` — the `br` shorthand is physical. `rounded-ee-*`
 *     (inline-end / block-end) is the logical equivalent and resolves to the
 *     bottom-right corner in LTR and the bottom-left corner in RTL, which is
 *     the corner that stays against the page edge in both.
 *
 * Everything else already uses logical properties (`ps-`/`pe-`, `inset-s-*`)
 * or is direction-neutral, so it needs no extra handling.
 */

// Two scrim layers. The horizontal one anchors the shadow to the *outer* edge
// of the panel; the vertical one keeps the text readable over any image.
const SCRIM_VERTICAL =
  "linear-gradient(180deg, rgba(15,32,54,0.05) 0%, rgba(15,32,54,0.15) 45%, rgba(15,32,54,0.92) 88%)";

const SCRIM_HORIZONTAL =
  "linear-gradient(var(--scrim-angle, 90deg), rgba(15,32,54,0.25) 0%, transparent 35%)";

export default function AuthSidePanel({
  imageSrc,
  imageAlt = "",
  badgeIcon,
  badgeText,
  title,
  description,
}) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <aside className="relative hidden h-screen overflow-hidden rounded-ee-[220px] bg-[#0F2036] lg:block">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />

      {/* Scrim overlay — angle is the one physical value, so it flips via the
          custom property instead of being hard-coded to 90deg. */}
      <div
        className="absolute inset-0 [--scrim-angle:90deg] rtl:[--scrim-angle:270deg]"
        style={{ background: `${SCRIM_VERTICAL}, ${SCRIM_HORIZONTAL}` }}
      />

      {/* Decorative blob */}
      <div className="absolute -bottom-22.5 -inset-s-15 h-55 w-55 rounded-full border border-white/10 bg-white/6" />

      <div className="relative z-1 flex h-full max-w-120 flex-col justify-between px-12 pb-14 pt-10 text-white">
        {/* logo - stays fixed in place, no animation */}
        <div className="logo">
          <img src={fullLogo} alt="MatchIn" />
        </div>

        {/* text content - slides in from the text-leading edge, so it reads as
            "coming from where the reader starts" in both directions. */}
        <motion.div
          initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.25 }}
        >
          {(badgeIcon || badgeText) && (
            <span className="mb-[1.1rem] inline-flex w-fit items-center gap-[0.45rem] rounded-full border border-white/[0.28] bg-white/[0.14] py-[0.4rem] ps-[0.6rem] pe-[0.85rem] text-[12.5px] font-semibold backdrop-blur-[6px]">
              {badgeIcon && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                  {badgeIcon}
                </span>
              )}
              {badgeText}
            </span>
          )}

          {title && (
            <h1 className="mb-4 font-['DM_Sans',sans-serif] text-[42px] font-bold leading-[1.15] tracking-[-0.02em]">
              {title}
            </h1>
          )}

          {description && (
            <p className="max-w-125 xl:w-125 text-[15px] leading-5.5 text-white/80">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </aside>
  );
}