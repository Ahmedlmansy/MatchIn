import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from "lucide-react";

export default function ProfileCompletionCard({
  completionPercentage = 85,
  linkText = "Manage your CV file",
  cvPath = "/dashboard/cv"
}) {
  return (
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
          <span>{linkText}</span>
        </Link>
      </div>
    </div>
  );
}