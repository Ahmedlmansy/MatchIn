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

const isNormalized = (error) =>
  Boolean(
    error &&
      typeof error === "object" &&
      !error.response &&
      "fieldErrors" in error &&
      "status" in error,
  );

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
      message:
        "The server took too long to respond. It may be slow or overloaded — please try again.",
      fieldErrors: null,
      isTimeout: true,
    };
  }

  // No response and not a timeout: DNS failure, refused connection, CORS, or an
  // offline client. Same class of problem, different wording.
  if (!error?.response && error?.request) {
    return {
      status,
      message:
        "Could not reach the server. Check your connection and that the API is running.",
      fieldErrors: null,
      isNetworkError: true,
    };
  }

  return {
    status,
    message: data?.message ?? error?.message ?? "Something went wrong",
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