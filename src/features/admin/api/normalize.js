// src/features/admin/api/normalize.js
//
// Shared response-shaping primitives for every admin endpoint.
//
// Why this exists: the five admin domains (dashboard, jobs, companies, users,
// audit-logs) all receive Laravel resources, which means snake_case, nested
// `data` envelopes, numeric strings, and paginator wrappers. Each api module
// normalizes its own domain, but they all need the same low-level tools — so
// those live here once instead of being copy-pasted five times.
//
// Rule of thumb: a *request* module never lets a raw server field reach a
// component. If the server can name it two ways, pick() tries both.

/**
 * Unwraps the standard `{ data: {...} }` envelope.
 * Single resources, paginated lists and bare payloads all resolve correctly.
 */
export const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

/**
 * First non-null value among `keys`.
 * This is the whole tolerance strategy: a differently-named-but-equivalent
 * backend field only ever needs an alias added here.
 */
export function pick(source, keys, fallback = undefined) {
  if (!source || typeof source !== "object") return fallback;
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return fallback;
}

/** Coerces to a finite number; tolerates "1,234" and "" from serializers. */
export function toNumber(value, fallback = 0) {
  const parsed = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Coerces to a boolean; Laravel sends true/false, "1"/"0", 1/0. */
export const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

/** Always an array — a missing/!Array field becomes []. */
export const toList = (value) => (Array.isArray(value) ? value : []);

/** Trims a value into a display string; "" and null become null. */
export const toText = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
};

/** Coerces an id to a stable string key (routes, query keys, React keys). */
export const toId = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

/**
 * Normalizes every paginated list response to one shape.
 *
 * Handles all three Laravel conventions:
 *   { data: [...], meta: { total, current_page, last_page, per_page } }
 *   { data: { data: [...], ... } }
 *   { data: [...] }  (no paginator)
 *
 * Always returns items as an array, never undefined, so a component can map
 * over it without a guard.
 */
export function normalizePaginated(payload, { perPage = 15 } = {}) {
  const body = unwrap(payload);

  // Paginated: the rows live in body.data and meta/links describe the page.
  if (body && Array.isArray(body.data)) {
    const meta = body.meta ?? {};
    const total = toNumber(pick(meta, ["total"]), body.data.length);
    const page = toNumber(pick(meta, ["current_page", "currentPage", "page"]), 1);
    const size = toNumber(pick(meta, ["per_page", "perPage", "page_size"]), perPage);
    return {
      items: body.data,
      total,
      page,
      perPage: size,
      pageCount: Math.max(1, Math.ceil(total / (size || perPage))),
    };
  }

  // Unpaginated: a bare array, or a plain object that *is* the single record.
  if (Array.isArray(body)) {
    return {
      items: body,
      total: body.length,
      page: 1,
      perPage: body.length || perPage,
      pageCount: 1,
    };
  }

  return { items: [], total: 0, page: 1, perPage, pageCount: 1 };
}

/**
 * Drops empty filter values so a query key (and the URL) never carries
 * `search: ""` / `status: "all"` — otherwise every keystroke/filter reset
 * would produce a distinct cache entry for the same result set.
 */
export function pruneParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all" &&
        value !== "any",
    ),
  );
}