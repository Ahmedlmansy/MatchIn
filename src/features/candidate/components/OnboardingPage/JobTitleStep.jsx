import { useState } from "react";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOB_TITLE_SUGGESTIONS } from "@/constants/jobTitleSuggestions";
import { useTranslation } from "react-i18next";
import { requiredFieldSchema } from "../../schema/onboardingSchema";
import { translateValidationMessage } from "@/features/auth/schema/validation-message";

export default function JobTitleStep({
  value,
  onContinue,
  onPrevious,
  isFirstStep,
}) {
  const { t } = useTranslation("common");
  const copy = t("ui.onboarding.jobTitle", { returnObjects: true });
  const [jobTitle, setJobTitle] = useState(value || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = requiredFieldSchema.safeParse(jobTitle);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    onContinue("jobTitle", jobTitle.trim());
  };

  return (
    <div>
      <h2 className="mb-1.5 text-[20px] font-bold text-ink">
        {copy.title}
      </h2>
      <p className="mb-6 text-[13px] text-muted">
        {copy.subtitle}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="jobTitle"
            className="mb-1.5 block text-[13px] font-semibold text-ink"
          >
            {copy.inputLabel}
          </label>
          <div className="relative">
            <Search className="absolute inset-s-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder={copy.placeholder}
              className={`w-full rounded-xl border bg-surface py-3 ps-10 pe-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary ${
                error ? "border-error" : "border-border"
              }`}
            />
          </div>
          {error && (
            <p className="mt-1.5 text-[12px] font-medium text-error">
              {translateValidationMessage(error)}
            </p>
          )}
        </div>

        <div className="mb-8">
          <span className="mb-2 block text-[12px] font-medium text-muted">
            {t("ui.onboarding.popularTitles")}
          </span>
          <div className="flex flex-wrap gap-2">
            {JOB_TITLE_SUGGESTIONS.map((title, index) => (
              <button
                key={title}
                type="button"
                onClick={() => {
                  setJobTitle(title);
                  if (error) setError("");
                }}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                  jobTitle === title
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted hover:border-primary/40 hover:text-primary"
                }`}
              >
                {copy.suggestions[index]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStep}
            className="h-11 flex-1 gap-1.5 rounded-xl border-border text-[13px] font-bold text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("ui.onboarding.previous")}
          </Button>
          <Button
            type="submit"
            className="h-11 flex-1 gap-1.5 rounded-xl bg-primary text-[13px] font-bold text-primary-foreground hover:bg-primary/90"
          >
            {t("ui.onboarding.continue")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
