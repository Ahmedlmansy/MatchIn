import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function FooterLinkColumn({ column }) {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-headline-sm text-[14px] font-bold text-ink">{t(column.titleKey)}</h4>
      <ul className="flex flex-col gap-2 font-body-sm text-[13px] text-muted">
        {column.links.map((link) => (
          <li key={link.labelKey}>
            <Link to={link.to} className="transition-colors hover:text-primary">
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
