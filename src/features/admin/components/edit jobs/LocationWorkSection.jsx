import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LocationWorkDetailsSection({ formData, onChange }) {
  const workModes = ["On-site", "Hybrid", "Remote"];
  const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];

  return (
    <Card className="bg-white border border-[#ECEAE5] shadow-none rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F0EC]">
        <h2 className="text-sm font-bold text-[#09090B]">Location & Work Details</h2>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Location & Experience Level Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Input */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#09090B]">
              Location <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              value={formData?.location || "Cairo, Egypt"}
              onChange={(e) => onChange?.("location", e.target.value)}
              className="h-12 w-full bg-white border-[#E4E4E7] rounded-xl text-sm px-4 focus-visible:ring-[#1D2A44]"
            />
          </div>

          {/* Experience Level Dropdown (Full Width & h-12) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#09090B]">
              Experience Level <span className="text-[#DC2626]">*</span>
            </Label>
            <Select
              value={formData?.experienceLevel || "Senior"}
              onValueChange={(val) => onChange?.("experienceLevel", val)}
            >
              <SelectTrigger className="h-12 w-full bg-white border-[#E4E4E7] rounded-xl text-sm px-4 focus:ring-[#1D2A44]">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Work Mode Pill Buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-[#09090B]">
            Work Mode <span className="text-[#DC2626]">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {workModes.map((mode) => {
              const active = (formData?.workMode || "Hybrid") === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChange?.("workMode", mode)}
                  className={`px-5 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                    active
                      ? "bg-[#1D2A44] text-white border-[#1D2A44]"
                      : "bg-white text-[#09090B] border-[#E4E4E7] hover:bg-[#F4F4F5]"
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Job Type Pill Buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-[#09090B]">
            Job Type <span className="text-[#DC2626]">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {jobTypes.map((type) => {
              const active = (formData?.jobType || "Full-time") === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange?.("jobType", type)}
                  className={`px-5 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                    active
                      ? "bg-[#1D2A44] text-white border-[#1D2A44]"
                      : "bg-white text-[#09090B] border-[#E4E4E7] hover:bg-[#F4F4F5]"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}