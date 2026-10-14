import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";

import Section from "./Section";
import Field from "./Field";

/**
 * CompanyInformation
 * Read-only core profile grid. Every field falls back to "—" so a company the
 * backend has not filled in yet renders as empty rather than blank space.
 */
export default function CompanyInformation({ profile }) {
  const { t } = useTranslation("dashboard");
  const key = "pages.admin.companyDetails.fields";
  const value = (entry) => entry || "—";

  return (
    <Section
      title={t("pages.admin.companyDetails.companyInformation")}
      hint={t("pages.admin.companyDetails.coreProfileDetails")}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-[560px]:grid-cols-1">
        <Field label={t(`${key}.companyName`)} value={profile.companyName || "—"} />
        <Field label={t(`${key}.legalName`)} value={value(profile.legalName)} />
        <Field label={t(`${key}.industry`)} value={value(profile.industry)} />
        <Field label={t(`${key}.companySize`)} value={value(profile.size)} />
        <Field
          label={t(`${key}.website`)}
          value={
            profile.website ? (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                {profile.website}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              "—"
            )
          }
        />
        <Field label={t(`${key}.headquarters`)} value={value(profile.headquarters)} />
        <Field
          full
          label={t(`${key}.about`)}
          value={value(profile.about)}
          valueClassName="font-normal leading-relaxed text-muted"
        />
      </div>
    </Section>
  );
}