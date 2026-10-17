// src/lib/normalizeApiError.js
//
// One app-wide error normalizer, shared by every feature (auth, admin,
// candidate). It lives in lib/ rather than under a feature because the admin
// dashboard, the auth mutations and every upcoming admin query all need the
// exact same { status, message, fieldErrors } contract — owning it in
// features/auth meant importing an auth file from the admin domain.
//
// Contract:
//   { status: number | undefined, message: string, fieldErrors: object | null }
// where fieldErrors is Laravel's 422 shape: { email: ["..."], ... }.
//
// On localization: the three client-side messages below are the only strings
// this module invents, and they are translated here because the client is the
// only party that knows it timed out or lost the network. A backend `message`
// is passed through untouched — every request already carries Accept-Language,
// so the server's copy is the localized one. That means these three are
// resolved at throw time: switching language while an error is on screen leaves
// the old text until the next request.

import i18n from "@/components/shared/i18n";

const translate = (key) => i18n.t(key, { ns: "common" });

const isNormalized = (error) =>
  Boolean(
    error &&
      typeof error === "object" &&
      !error.response &&
      "fieldErrors" in error &&
      "status" in error,
  );

/**
 * Zod reports a rejected body as an array of issues:
 *
 *   [{"code":"invalid_type","expected":"boolean","received":"undefined",
 *     "path":["is_active"],"message":"Invalid input: expected boolean, received undefined"}]
 *
 * Backends that only implement Laravel's `errors` bag put that JSON *string*
 * in `message`, so the UI rendered a wall of raw JSON and — worse — the one
 * piece of information needed to fix the request, the offending field name, sat
 * in a `path` array nobody reads.
 *
 * Parsed into the same { field: [message] } shape Laravel uses, so it renders
 * per field like every other validation error. Anything that is not an array of
 * issue objects is left alone: `message` is free-form and a real message can
 * begin with "[".
 */
const parseZodIssues = (message) => {
  if (typeof message !== "string") return null;
  const trimmed = message.trim();
  if (!trimmed.startsWith("[")) return null;

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  if (!parsed.every((issue) => issue && typeof issue === "object" && typeof issue.message === "string")) {
    return null;
  }

  const fieldErrors = {};
  for (const issue of parsed) {
    const path = Array.isArray(issue.path) ? issue.path : [];
    const field = path.length ? path.join(".") : "_";
    (fieldErrors[field] ??= []).push(issue.message);
  }

  // The first issue is the most specific, so it leads the summary; every
  // offending field is still reachable through fieldErrors.
  const fields = Object.keys(fieldErrors);
  const summary =
    fields.length === 1 && fields[0] === "_"
      ? parsed[0].message
      : `${parsed[0].message} (${fields.join(", ")})`;

  return { message: summary, fieldErrors };
};

/**
 * Axios failure -> { status, message, fieldErrors }.
 *
 * Idempotent: an error already in that shape passes through untouched, so a
 * second pass cannot wipe an enriched message or field errors.
 */
export function normalizeApiError(error) {
  if (isNormalized(error)) return error;

  const status = error?.response?.status;
  const data = error?.response?.data;

  // A timeout has no response at all, so the raw axios message
  // ("timeout of 30000ms exceeded") is the only thing available — and it reads
  // like a bug rather than a slow server. Say what actually happened.
  if (error?.code === "ECONNABORTED" || /timeout/i.test(error?.message ?? "")) {
    return {
      status,
      message: translate("errors.timeout"),
      fieldErrors: null,
      isTimeout: true,
    };
  }

  // No response and not a timeout: DNS failure, refused connection, CORS, or an
  // offline client. Same class of problem, different wording.
  if (!error?.response && error?.request) {
    return {
      status,
      message: translate("errors.network"),
      fieldErrors: null,
      isNetworkError: true,
    };
  }

  return {
    status,
    message: data?.message ?? error?.message ?? translate("errors.generic"),
    fieldErrors: data?.errors ?? null,
  };
}

/** True when the failure was a 404, whatever shape it arrived in. */
export const isNotFoundError = (error) => normalizeApiError(error).status === 404;

/** First validation message for a field, or null when the field is valid. */
export const fieldError = (error, field) => {
  const errors = normalizeApiError(error).fieldErrors;
  const entry = errors?.[field];
  if (!entry) return null;
  return Array.isArray(entry) ? entry[0] : String(entry);
};