// src/features/admin/shared/companyDateFormat.js
//
// Date helpers for the company screens. Both are defensive because the server
// may legitimately omit created_at / updated_at on a partially-hydrated record
// (e.g. a company created by a queued job before its timestamps are written).

const parseDate = (value) => {
  if (!value) return null;
  // Date-only strings ("2026-09-22") are parsed at midday so a timezone west
  // of UTC can't shift them into the previous day.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value.slice(0, 10)}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function formatDisplayDate(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getRelativeLabel(value) {
  const date = parseDate(value);
  if (!date) return "—";

  const elapsedDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);

  if (elapsedDays <= 0) return "Today";
  if (elapsedDays === 1) return "Yesterday";
  if (elapsedDays < 7) return `${elapsedDays} days ago`;
  if (elapsedDays < 30) return `${Math.floor(elapsedDays / 7)} weeks ago`;
  if (elapsedDays < 365) return `${Math.floor(elapsedDays / 30)} months ago`;
  return `${Math.floor(elapsedDays / 365)} years ago`;
}