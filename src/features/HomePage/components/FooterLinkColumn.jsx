import { Link } from "react-router-dom";

export default function FooterLinkColumn({ column }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-headline-sm text-[14px] font-bold text-ink">{column.title}</h4>
      <ul className="flex flex-col gap-2 font-body-sm text-[13px] text-muted">
        {column.links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
