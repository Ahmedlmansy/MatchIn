import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileText } from "lucide-react";

export default function ProfileHeader({ 
  name = "Ahmed Mahmoud",
  title = "Senior Frontend Engineer • Cairo, Egypt",
  initials = "AM",
  completionPercentage = 85, 
  cvPath = "/dashboard/cv" 
}) {
  return (
    <div className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-xl text-slate-700 shrink-0">
          {initials}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            {name}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified & AI-Extracted CV</span>
          </div>
        </div>
      </div>

      <div className="w-[280px] bg-[#FAF8F5] p-3.5 rounded-2xl border border-gray-100/80 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
            Profile Completion
          </h3>
          <span className="text-xs font-bold text-[#1E3A8A]">
            {completionPercentage}%
          </span>
        </div>

        <div className="w-full h-2 bg-[#EAE8E3] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E3A8A] rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="pt-0.5">
          <Link
            to={cvPath}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] hover:text-[#92400E] hover:underline transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Manage your CV file</span>
          </Link>
        </div>
      </div>
    </div>
  );
}