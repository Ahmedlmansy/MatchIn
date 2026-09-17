import { ArrowLeft, Globe } from "lucide-react";

export default function ResetHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-stone-50 px-6 py-4 sm:px-8">
      <a
        href="#"
        className="flex items-center gap-2 text-sm font-semibold text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Login
      </a>

      <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <Globe className="h-4 w-4" />
        English
      </button>
    </header>
  );
}
