import { ShieldCheck } from "lucide-react";

export default function SecurityNotice() {
  return (
    <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-slate-50 px-3 py-3 text-[11px] leading-relaxed text-slate-500">
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        Advanced protection for your career data and application history
        adhering to top digital identity security standards and AES-256-bit
        encryption.
      </span>
    </div>
  );
}
