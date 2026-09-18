import { Link } from "react-router-dom";
import { MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AI Mentor teaser card for the candidate dashboard.
 * Uses only MatchIn @theme tokens.
 *
 * @param {{
 *   description?: string,
 *   className?: string,
 * }} props
 */
export default function AIMentorCard({
  description = "Not sure what to focus on? Ask your mentor — it knows your profile, jobs, and roadmap.",
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <MessagesSquare className="h-5 w-5 text-primary" />
        <h2 className="text-[16px] font-bold text-primary">AI Mentor</h2>
      </div>

      <p className="mb-4 text-[12.5px] leading-relaxed text-muted">
        {description}
      </p>

      <Link
        to="/mentor"
        className="inline-flex w-full items-center justify-center rounded-xl bg-primary py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Ask AI Mentor
      </Link>
    </div>
  );
}
