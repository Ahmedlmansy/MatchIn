import { pageFromUrlParams } from "@/features/admin/api/normalize";
import {
  AUDIT_SORT_OPTIONS,
  COMPANY_DATE_FILTER_KEYS,
  COMPANY_SORT_FILTER_KEYS,
  COMPANY_STATUS_FILTER_KEYS,
  JOB_SORT_KEYS,
  JOB_SOURCE_FILTER_KEYS,
  JOB_STATUS_FILTER_KEYS,
} from "@/features/admin/constants/admin.filters";

const pickAllowed = (params, key, allowed, fallback) => {
  const value = params.get(key);
  return value && allowed.includes(value) ? value : fallback;
};

export function jobFiltersFromParams(params, defaults) {
  return {
    ...defaults,
    search: params.get("search") ?? defaults.search,
    status: pickAllowed(
      params,
      "status",
      JOB_STATUS_FILTER_KEYS.map(({ id }) => id),
      defaults.status,
    ),
    source: pickAllowed(
      params,
      "source",
      JOB_SOURCE_FILTER_KEYS.map(({ id }) => id),
      defaults.source,
    ),
    sort: pickAllowed(
      params,
      "sort",
      JOB_SORT_KEYS.map(({ value }) => value),
      defaults.sort,
    ),
    page: pageFromUrlParams(params, defaults.page),
  };
}

export function companyFiltersFromParams(params, defaults) {
  return {
    ...defaults,
    search: params.get("search") ?? defaults.search,
    status: pickAllowed(
      params,
      "status",
      COMPANY_STATUS_FILTER_KEYS.map(({ value }) => value),
      defaults.status,
    ),
    date: pickAllowed(
      params,
      "date",
      COMPANY_DATE_FILTER_KEYS.map(({ value }) => value),
      defaults.date,
    ),
    sort: pickAllowed(
      params,
      "sort",
      COMPANY_SORT_FILTER_KEYS.map(({ value }) => value),
      defaults.sort,
    ),
    page: pageFromUrlParams(params, defaults.page),
  };
}

export function auditFiltersFromParams(params, defaults) {
  return {
    ...defaults,
    search: params.get("search") ?? defaults.search,
    action: params.get("action") ?? defaults.action,
    entity: params.get("entity") ?? defaults.entity,
    actor: params.get("actor") ?? defaults.actor,
    sort: pickAllowed(
      params,
      "sort",
      AUDIT_SORT_OPTIONS.map(({ value }) => value),
      defaults.sort,
    ),
    page: pageFromUrlParams(params, defaults.page),
  };
}
