# MatchIn Frontend

**MatchIn** is a candidate-to-job matching platform frontend built with React 19 and Vite. It serves two user roles — **candidate** and **administrator** — with full Arabic/English internationalization (RTL/LTR). The frontend consumes a Node.js/Express backend (with an optional FastAPI AI microservice) and provides job discovery, applications, CV management, career roadmaps, AI chat, and an admin dashboard for users, companies, jobs, and audit logs.

> ⚠️ **Documentation-only note**: This README describes the existing codebase as-is. No application code was modified or created as part of producing this document.

---

## Table of Contents

- [Project Overview](#a-project-overview)
- [Technology Stack](#b-technology-stack)
- [Installation and Setup](#c-installation-and-setup)
- [Project Structure](#d-project-structure)
- [Application Architecture](#e-application-architecture)
- [Routes and Pages](#f-routes-and-pages)
- [Features and Business Workflows](#g-features-and-business-workflows)
- [API and Backend Integration](#h-api-and-backend-integration)
- [State Management and Data Fetching](#i-state-management-and-data-fetching)
- [Authentication and Security](#j-authentication-and-security)
- [Internationalization](#k-internationalization)
- [Coding Conventions and Development Guidelines](#l-coding-conventions-and-development-guidelines)
- [Environment Variables](#m-environment-variables)
- [Available Scripts](#n-available-scripts)
- [Known Limitations and Technical Debt](#o-known-limitations-and-technical-debt)
- [Guide for Future AI Agents](#p-guide-for-future-ai-agents)

---

## A. Project Overview

**Project name:** MatchIn (repository `skillmatch-frontend`).

**Purpose and target users:** A career-matching platform where candidates discover and apply to jobs, build CVs, follow AI-generated career roadmaps, and chat with an AI career mentor; administrators manage users, companies, jobs, and review audit logs.

**Main features and capabilities (verified from source):**

| Feature | Status | Notes |
|---|---|---|
| Authentication (register, login, OTP email verification, forgot/reset password) | Fully implemented | `POST /api/auth/*`, Redux session, token refresh on 401 |
| Public job browsing & details | Implemented (backend-backed) | `GET /api/jobs`, `GET /api/jobs/:id`; mock catalog in `src/constants/jobsMock.js` also consumed by landing page |
| Job save / unsave & apply | Implemented | `POST/DELETE /api/jobs/:id/save`, `POST /api/jobs/:id/apply` |
| Candidate dashboard (overview, jobs, saved jobs, CV, roadmap, AI chat, notifications, applications, profile, onboarding) | Implemented | TanStack Query + backend APIs |
| CV upload, status, retry, verify extraction | Implemented | `POST /api/cv/upload`, `GET /api/cv/status/:id`, `POST /api/cv/retry/:id`, `POST /api/cv/extractions/:id/verify` |
| Career roadmap (generate, refresh, complete task) | Implemented | `POST /api/roadmaps`, `PATCH /api/roadmaps/tasks/:id/complete` |
| AI career mentor chat | Implemented | `GET/POST /api/mentor/*`, context preview |
| Candidate profile (read + update personal info & career preferences) | Implemented | `GET/PATCH /api/candidate/profile`, `PATCH /api/candidate/career-preferences` |
| Admin dashboard overview | Implemented | `GET /api/admin/dashboard` |
| Admin user management (CRUD, activate/deactivate, role change) | Implemented | `GET/POST/PATCH/DELETE /api/admin/users` |
| Admin company management (CRUD, verify/reject, merge) | Implemented | `GET/POST/PATCH /api/admin/companies`, `POST /merge` |
| Admin job management (CRUD) | Implemented | `GET/POST/PATCH /api/admin/jobs` |
| Admin audit logs (read-only) | Implemented | `GET /api/admin/audit-logs` |
| Admin CMS / auth settings pages | Present in router | Pages exist; backend integration level not independently verified |
| AI job matching, skill gaps, interview coach, application strategy, CV improvement | Not implemented in frontend | Listed as missing in `src/docs/AI_INTEGRATION_AUDIT.md` |
| AI Review Queue admin UI | Partially implemented | Page/routes exist; audit lists only some items per audit doc |

**Current implementation status:** The codebase builds and lints successfully (per `npm run build` and `npm run lint` verification notes in `src/docs/*`). Auth and the candidate/admin data hooks are wired to real backend endpoints. Several Overview-page cards and profile sub-tabs still use static/mock fallback data (see section O).

**Target users:** Job-seeking candidates and platform administrators.

---

## B. Technology Stack

Only technologies actually imported, configured, or referenced in source are listed.

### Core framework and language
- **React 19.2.8** + **react-dom 19.2.8** — UI framework (JSX, not TypeScript; `jsconfig.json` path aliases only)
- **Vite 8.2.2** + **@vitejs/plugin-react 6.1.0** — build tool and dev server
- **ECMAScript modules** (`"type": "module"` in package.json)

### UI and styling
- **Tailwind CSS 4.3.3** + **@tailwindcss/vite** — utility-first CSS; custom MatchIn design tokens in `src/index.css` (`--color-primary`, `--color-secondary`, `--color-accent`, fonts Inter / DM Sans / Alexandria / Tajawal)
- **tw-animate-css** — animation utilities
- **lucide-react 1.42.0** — icon library
- **framer-motion 13.2.0** — animations
- **Radix UI 1.6.7** + **@radix-ui/react-slot** — headless UI primitives
- **shadcn/ui** components in `src/components/ui/` (button, card, dialog, sheet, select, input, tabs, etc.)
- **class-variance-authority**, **clsx**, **tailwind-merge**, **cn** (`src/lib/utils.js`) — class-name composition

### State management
- **Redux Toolkit 2.12.0** + **react-redux 9.3.0** — client session state only (`auth` slice: user/token/status; `language` slice: active lang)
- **TanStack Query (React Query) 5.102.8** + devtools — all server state (queries and mutations)

### API and data fetching
- **axios 1.20.0** — `src/services/axios/axiosInstance.js` (the single active client) with request/response interceptors, automatic token-refresh queue on 401, `Accept-Language` header injection, `withCredentials: true`
- A second client `apiAi` (`src/services/axios/axiosInsranceAi.js`) is defined but **not imported anywhere** (unused/dead code)

### Authentication and security
- httpOnly session cookie + optional bearer `access_token` persisted in `localStorage` (`tokenStore.js`)
- Automatic refresh-token rotation on 401 via axios interceptor
- Role-based access: `isAdminRole()` / `isCandidateRole()` in `src/features/auth/store/auth.roles.js`

### Forms and validation
- **react-hook-form 7.88.0** + **@hookform/resolvers 5.9.1** + **zod 4.6.1** — form state and schema validation (`src/features/auth/schema/`, `src/features/candidate/schema/`)
- **input-otp 1.5.0** — OTP input component

### Internationalization
- **i18next 26.4.2** + **react-i18next 17.0.13** — translations
- Locales: `en` and `ar` (`common.json`, `dashboard.json`, `validation.json` under `src/components/shared/i18n/locales/`)
- RTL/LTR: `dir` set on `<html>` by `I18nSync.jsx`; mirrored Lucide icons in `src/index.css`

### Utilities and other important libraries
- **cmdk 1.1.1** — command palette (command.jsx)
- **js-cookie 3.0.8** — installed dependency; **no imports found in `src/`** (appears unused)

### Development and build tools
- **oxlint 1.79.0** — linting (`npm run lint` → `oxlint src`)
- **jest 30.5.2** — installed as devDependency; **no test files or `test` script exist** (per `CLIXAD.md`: "No tests configured")

---

## C. Installation and Setup

### Prerequisites
- **Node.js** (LTS recommended) and **npm** — no `.nvmrc` or `engines` field constrains a specific version
- A running backend reachable at the configured `VITE_API_URL` (see environment variables below)

### Installing dependencies
The project uses **npm** (a `package-lock.json` is committed):

```bash
cd skillmatch-frontend
npm install
```

### Configuring environment variables

Copy `.env.example` to `.env` (or edit the existing `.env`) and set the values appropriate for your environment:

```bash
cp .env.example .env
```

| Variable | Purpose | Default / notes |
|---|---|---|
| `VITE_API_URL` | Base URL for the main `api` axios client. Empty means requests go through the Vite dev proxy (`/api` → `VITE_API_PROXY_TARGET`). | Empty in dev |
| `VITE_API_PROXY_TARGET` | Target host for the Vite `/api` dev proxy. | `https://similarly-postposted-filled-row.trycloudflare.com` in `.env.example` |
| `VITE_API_TIMEOUT` | Request timeout in milliseconds. | `30000` |
| `VITE_API_AI_URL` | Base URL for the (unused) `apiAi` client. | `https://ai-serv5.fastapicloud.dev/api/v1` |
| `VITE_ADMIN_LOG` | Set to `false` to silence admin dev-layer logging during local development. | Enabled by default in dev |

Environment values are read by Vite at dev-server startup (`loadEnv` in `vite.config.js`) and at build time (`import.meta.env.*` in `axiosInstance.js`). Restart the dev server after changing them.

> The committed `.env` and `.env.local` are gitignored (`.gitignore` lists `.env` and `.env.local`). Never commit real secrets.

### Running the development server

```bash
npm run dev
```

Starts Vite with HMR. Requests to `/api` are proxied to `VITE_API_PROXY_TARGET` only when `VITE_API_URL` is empty, keeping the session cookie same-origin (no CORS).

### Building the project

```bash
npm run build
```

Produces a production bundle in `dist/`.

### Running tests and linting

- Lint: `npm run lint` → `oxlint src`
- Tests: no `test` script and no test files exist; `jest` is installed but unused

### Previewing the production build

```bash
npm run preview
```

Serves the `dist/` bundle locally (Vite preview). `vercel.json` rewrites all paths to `/index.html` for SPA fallback on Vercel.

---

## D. Project Structure

```
skillmatch-frontend/
├── .env / .env.example / .env.local          # Runtime configuration (gitignored)
├── index.html                                 # Entry HTML; mounts #root
├── vite.config.js                             # Vite config, /api dev proxy, @ alias
├── jsconfig.json                              # Path alias @/* → ./src/*
├── package.json                               # Scripts & dependencies (npm)
├── vercel.json                                # SPA fallback rewrite
├── public/
├── src/
│   ├── main.jsx                               # React root; imports App + i18n init
│   ├── index.css                              # Tailwind + design tokens + RTL overrides
│   ├── app/
│   │   ├── App.jsx                            # AppProviders + RouterProvider
│   │   ├── providers.jsx                      # Redux + QueryClient + AuthInitializer
│   │   ├── router.jsx                         # createBrowserRouter route tree + guards
│   │   └── routes/
│   │       ├── auth.routes.jsx                # /auth/login, /register, /forgot-password, /reset-password
│   │       ├── dashboard.routes.jsx           # candidate + admin dashboard route trees
│   │       ├── LanguageLayout.jsx             # /:lang wrapper; i18n sync + route tracking
│   │       ├── RootRedirect.jsx               # / → /:lang
│   │       ├── RouteTracker.jsx               # persists last language to localStorage
│   │       └── guards/                        # RequireAuth, RequireOnboarding, DashboardRoleTree
│   ├── components/
│   │   ├── layouts/                           # MainLayout, AuthLayout, DashboardLayout (+Sidebar/Topbar/Footer)
│   │   ├── shared/                            # cross-feature UI (JobCard, Status, Modal, LanguageSwitcher, i18n)
│   │   │   └── i18n/                          # i18n init, I18nSync, languageStorage, validationMessage, locales/
│   │   └── ui/                                # shadcn/ui primitives
│   ├── features/
│   │   ├── auth/                              # auth domain: api, hooks, pages, schema, shared, store
│   │   ├── candidate/                         # candidate domain: api, hooks, pages, schema, shared, constants
│   │   ├── admin/                             # admin domain: api, hooks, pages, shared, components, constants
│   │   ├── language/                          # language Redux slice
│   │   └── public/                            # public pages: HomePage, NotFoundPage
│   ├── hooks/                                 # (empty)
│   ├── lib/                                   # queryClient, normalizeApiError, cn
│   ├── services/
│   │   └── axios/                             # axiosInstance, tokenStore, apiAi (unused)
│   ├── store/                                 # Redux store + slices (auth.slice, language.slice)
│   ├── utils/                                 # routes.js (localizedPath), buildSidebarNav.js
│   ├── constants/                             # jobsMock.js (shared mock job catalog)
│   ├── assets/                                # fonts, icons, logo
│   └── docs/                                  # implementation & audit reports
│       ├── AI_INTEGRATION_AUDIT.md
│       ├── FEATURE_IMPLEMENTATION_PLAN.md
│       ├── OVERVIEW_ERROR_ISOLATION_REPORT.md
│       └── PROFILE_INTEGRATION_REPORT.md
```

**Responsibility of major directories:**

- `src/app/` — App composition: router, providers, route guards. The single place route trees are assembled.
- `src/features/<domain>/` — Feature-based organization. Each domain owns its `api/` (axios calls + response normalization), `hooks/` (React Query wrappers), `pages/` (route-level components), `schema/` (Zod), `shared/` (local data/utilities), and `components/`.
- `src/components/layouts/` — Shell layouts: `MainLayout` (public), `AuthLayout` (login/register), `DashboardLayout` (sidebar + topbar).
- `src/components/ui/` — shadcn/ui primitive components (unstyled, reusable).
- `src/components/shared/` — Cross-feature presentational components and the i18n subsystem.
- `src/services/axios/` — HTTP layer: the one active `api` client, token persistence mirror, and the unused `apiAi`.
- `src/store/` — Redux store; only `auth` and `language` slices live here. Server state stays in React Query, not Redux.
- `src/lib/` — Shared utilities: `queryClient`, `normalizeApiError`, `cn`.
- `src/constants/` — Shared static data; only `jobsMock.js` remains here (consumed by both public landing and candidate job board).
- `src/docs/` — Implementation/audit reports written during prior feature work (read before touching AI or profile features).

---

## E. Application Architecture

### How the application starts
`index.html` → `src/main.jsx` renders `<App />` inside `<StrictMode>`. `main.jsx` imports `@/components/shared/i18n` (initializes i18next with en/ar resources) and renders `App`.

`App.jsx` wraps `<RouterProvider router={router} />` inside `AppProviders`.

`AppProviders` (`providers.jsx`) layers:
1. Redux `<Provider store={store}>`
2. TanStack `<QueryClientProvider client={queryClient}>`
3. `<AuthInitializer />` — runs `useInitializeAuth()` at boot to resolve the session (`/auth/me`, with refresh fallback) before any route guard runs
4. `<ReactQueryDevtools />`

### How routing works
`createBrowserRouter` in `src/app/router.jsx`. All routes live under a `:lang` segment (`en` or `ar`), enforced by `LanguageLayout.jsx` (unsupported languages redirect to `/en`).

Route summary:
- `/` → `RootRedirect` → `/{lang}`
- `/{lang}` → `MainLayout`
  - index → `HomePage`
  - `auth/*` → auth routes (login, register, forgot-password/reset-password/verify-otp)
- `/{lang}/dashboard` → `RequireAuth` → `RequireOnboarding` → `DashboardRoleTree` (picks candidate or admin tree from Redux role)
- `*` → `NotFoundPage`

### How layouts and pages are organized
- **Public:** `MainLayout` renders `Outlet` for `HomePage` / `NotFoundPage` / auth pages (wrapped in `AuthLayout`).
- **Authenticated:** `DashboardLayout` provides a persistent sidebar and topbar; page-level components live under `features/candidate/pages/` or `features/admin/pages/` and are rendered via `DashboardRoleTree` → `useRoutes`.
- Route-level components are page components; smaller UI lives in `features/*/components/*` or `src/components/shared/`.

### How shared components are reused
- `src/components/shared/` holds `JobCard`, `Status`, `Modal`, `LanguageSwitcher`, `LanguageToggle`, `ActionBanner`.
- `src/components/ui/` holds shadcn primitives used everywhere.
- `src/components/layouts/DashboardLayout/Sidebar.jsx` builds its nav from `dashboard.routes.jsx` route `handle` metadata via `buildSidebarNav.js`.

### How state is managed
- **Redux (client/session state):** `auth` (`user`, `token`, `status`) and `language` (`lang`). Redux is the single source of truth for the session; `store/index.js` subscribes and mirrors `auth.token` into `tokenStore` so the axios interceptor can read it synchronously.
- **React Query (server state):** All API reads/writes live in feature hooks (`useJobsQuery`, `useProfileQuery`, `useAdminUsersQuery`, …). Query data is never duplicated into Redux. `queryClient` defaults: `staleTime 5 min`, `gcTime 10 min`, `retry 1`, `refetchOnWindowFocus/mount/reconnect: false`.

### How data flows through the application
1. Component calls a feature hook (e.g. `useJobsQuery`).
2. Hook calls an API function in `features/*/api/*.api.js`, which calls the shared `api` axios instance.
3. `api` attaches `Accept-Language` and `Authorization: Bearer <token>` (from `tokenStore`, mirrored from Redux).
4. On 401 with an existing session, the response interceptor queues a token refresh (`/api/auth/refresh`), retries the request, or dispatches `clearCredentials()`.
5. Response is normalized (unwrap `{ data: … }` envelope, snake_case → camelCase aliases) and returned to the hook.
6. Component reads `data` / `isPending` / `isError` / `error` from the hook.

### How API requests are handled
Single active client `api` (`axiosInstance.js`):
- `baseURL: VITE_API_URL` (empty → same-origin via Vite proxy to `VITE_API_PROXY_TARGET`)
- `withCredentials: true` (httpOnly cookie attached by browser)
- Request interceptor #1: injects `Accept-Language: ar|en` from Redux language state / URL / detection
- Request interceptor #2: injects `Authorization: Bearer <token>` from `tokenStore` (skipped for refresh-tagged requests)
- Response interceptor: on 401 with a session, queues a single shared refresh and retries; on refresh failure dispatches `clearCredentials()`
- `apiAi` (`VITE_API_AI_URL`) exists but is **not imported anywhere**

### How authentication and authorization are implemented
- Boot: `useInitializeAuth()` calls `GET /api/auth/me`; on 401 without a token it attempts one `POST /api/auth/refresh` then re-probes.
- Login: `loginRequest` → `setAccessToken(token)` (localStorage + memory) → `setCredentials({ user, token })` in Redux. Role revalidated in background via `/auth/me` only when needed.
- Guards: `RequireAuth` (status `loading`/`idle` → spinner; not authenticated → navigate to `/:lang/auth/login`), `RequireOnboarding` (candidate-only, reads `GET /api/candidate/profile`), `DashboardRoleTree` (picks candidate vs admin tree via `isAdminRole()`).
- Roles: `ADMIN_ROLES = ["super_admin","superadmin","admin","administrator"]`; anything else is candidate-or-unknown.
- Logout: `logoutRequest` → `clearCredentials()` → `queryClient.clear()` → navigate to `/:lang/auth/login`. Backend call failure does not block client cleanup.

### How errors, loading states, and empty states are handled
- Errors: `normalizeApiError` (`src/lib/normalizeApiError.js`) converts Axios errors to `{ status, message, fieldErrors }`. Auth mutations additionally run `applyAuthStatusMessage` to swap in i18n status copy (`auth.errors.*`). Admin hooks (`useAdminQuery`/`useAdminMutation`) normalize errors inside `queryFn`/`mutationFn` so `query.error`/`mutation.error` already has the standard shape.
- Loading: `isPending` / `isError` / `data` read directly from React Query; spinners in guards (`Loader2`), skeletons on pages.
- Empty: components render empty states (e.g. empty jobs list, no roadmap → `null` from `useRoadmapQuery` on 404).

---

## F. Routes and Pages

All paths are prefixed with `/{lang}` (`en` or `ar`). Derived from `router.jsx`, `auth.routes.jsx`, `dashboard.routes.jsx`.

| Route | Page / Feature | Purpose | Auth required | Layout / restrictions |
|---|---|---|---|---|
| `/` | RootRedirect | Redirects to last-used or default language (`/en` or `/ar`) | No | — |
| `/{lang}` | HomePage | Public landing page (hero, jobs, categories, CTA) | No | MainLayout |
| `/{lang}/auth/login` | LoginPage | Email/password sign-in | No | AuthLayout |
| `/{lang}/auth/register` | RegisterPage | Account creation + email OTP verification | No | AuthLayout |
| `/{lang}/auth/forgot-password` | ForgetPasswordPage | Request password-reset link | No | AuthLayout |
| `/{lang}/auth/forgot-password/verify-otp` | VerifyOtpPage | Verify reset OTP code | No | AuthLayout |
| `/{lang}/auth/reset-password` | SetNewPassword | Set new password with reset token | No | AuthLayout |
| `/{lang}/dashboard` | DashboardRoleTree → candidate or admin index | Role-based dashboard root | Yes (RequireAuth + RequireOnboarding for candidates) | DashboardLayout |
| `/{lang}/dashboard/overview` | Overview | Candidate dashboard summary | Yes | DashboardLayout |
| `/{lang}/dashboard/jobs` | JobsPage | Browse jobs (list) | Yes | DashboardLayout |
| `/{lang}/dashboard/jobs/:jobId` | JobsDetails | Job detail | Yes | DashboardLayout |
| `/{lang}/dashboard/saved-jobs` | SavedJobs | Saved/bookmarked jobs | Yes | DashboardLayout |
| `/{lang}/dashboard/cv-management` | CvManagementPage | CV upload & extraction status | Yes | DashboardLayout |
| `/{lang}/dashboard/ai-chat` | AiChatPage | AI career mentor chat | Yes | DashboardLayout |
| `/{lang}/dashboard/roadmap` | RoadmapPage | Career roadmap | Yes | DashboardLayout |
| `/{lang}/dashboard/roadmap/:roleId` | RoadmapDetailsPage | Roadmap for a role | Yes | DashboardLayout |
| `/{lang}/dashboard/onboarding` | OnboardingPage | Candidate onboarding wizard | Yes (candidate only) | DashboardLayout |
| `/{lang}/dashboard/applications` | ApplicationPage | Application tracker | Yes | DashboardLayout |
| `/{lang}/dashboard/applications/:applicationId` | ApplicationDetail | Application detail | Yes | DashboardLayout |
| `/{lang}/dashboard/profile` | ProfilePage | Candidate profile (tabs: personal, preferences, skills, experience, education, projects) | Yes | DashboardLayout |
| `/{lang}/dashboard/notifications` | NotificationsPage | Notifications | Yes | DashboardLayout |
| `/{lang}/dashboard/job-management` | JobManagement | Admin: job list | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/job-management/edit/:jobId` | EditJobs | Admin: edit job | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/job-management/:jobId` | JobDetailsPage | Admin: job detail | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/company-management` | CompaniesPage | Admin: company list | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/company-management/:id` | CompanyDetails | Admin: company detail | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/user-management` | UserManagementPage | Admin: user list | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/user-management/:id` | UsersDetailsPage | Admin: user detail | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/audit-logs` | AuditLogsList | Admin: audit log list | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/audit-logs/:auditId` | AuditLogDetails | Admin: audit log detail | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/cms` | CmsHomePage | Admin CMS | Yes (admin) | DashboardLayout |
| `/{lang}/dashboard/dashboard-auth` | AuthSettingsPage | Admin auth settings | Yes (admin) | DashboardLayout |
| `*` | NotFoundPage | 404 | No | — |

Access note: candidate vs admin tree selection happens at render time in `DashboardRoleTree` via Redux `user.role` (`isAdminRole`). Route guards do not hardcode roles.

---

## G. Features and Business Workflows

Each feature lists the relevant pages, components, hooks, services, and state modules, and its implementation maturity.

### 1. Authentication
**Status:** Fully implemented.
- Pages: `LoginPage`, `RegisterPage`, `ForgetPasswordPage`, `VerifyOtpPage`, `SetNewPassword`
- API: `src/features/auth/api/auth.api.js` (`/api/auth/register`, `/login`, `/me`, `/refresh`, `/forgot-password`, `/verify-email-otp`, `/forgot-password/verify-otp`, `/resend-email-otp`, `/reset-password`, `/logout`)
- Hooks: `useLoginMutation`, `useRegisterMutation`, `useVerifyOtpMutation`, `useForgotPasswordMutation`, `useVerifyForgotOtpMutation`, `useResendOtpMutation`, `useResetPasswordMutation`, `useLogoutMutation`, `useInitializeAuth`, `useRefreshToken`, `useAuthApiMutation`, `useApiMutation`
- State: Redux `auth` slice (`user`, `token`, `status`); `tokenStore` localStorage mirror
- Schemas: `login-schema.js`, `auth-schema.js` (register, OTP), Zod + react-hook-form
- Notes: Dual session support (httpOnly cookie + bearer token). Logout UI buttons were removed from Topbar/Sidebar (per `PROFILE_INTEGRATION_REPORT.md`) but the logout hook and endpoint remain functional.

### 2. Language / i18n
**Status:** Fully implemented.
- State: Redux `language` slice (`lang`); `I18nSync.jsx` sets `document.documentElement.lang`/`dir`
- Locales: `en`, `ar` (`common.json`, `dashboard.json`, `validation.json`)
- Route-scoped: every route under `/:lang`; `useLocalizedPath()` builds localized links

### 3. Public home & job browsing
**Status:** Partially backend-backed / partially mock.
- `HomePage` consumes `JOBS` from `src/constants/jobsMock.js` for the public job carousel, plus real `GET /api/jobs` via `useJobsQuery` on candidate dashboard
- Job detail: `GET /api/jobs/:jobId`
- Save/unsave: `POST/DELETE /api/jobs/:id/save`
- Apply: `POST /api/jobs/:id/apply` (body: `{ cvId, authorized, startDate, note }`)

### 4. Candidate dashboard & profile
**Status:** Implemented (profile tabs partially read-only).
- Profile: `GET/PATCH /api/candidate/profile` (personal info), `PATCH /api/candidate/career-preferences`
- Profile sub-tabs Skills/Experience/Education/Projects load from profile data; create/update/delete on those tabs is **local state only**, not backend-connected (per `PROFILE_INTEGRATION_REPORT.md`)
- Avatar upload: not implemented

### 5. CV management
**Status:** Implemented.
- `POST /api/cv/upload` (multipart, PDF/DOCX, ≤5 MB), `GET /api/cv/status/:id`, `POST /api/cv/retry/:id`, `POST /api/cv/extractions/:id/verify`
- Normalizers handle both old (`status`) and new (`parsing_status`, `parsed_data`) backend schemas

### 6. Job applications
**Status:** Implemented.
- `GET /applications` (note: no `/api/` prefix in `applications.api.js`; inherits `api` baseURL), `GET /applications/:id`, `POST /applications/:id/withdraw`

### 7. Career roadmap
**Status:** Implemented (audit-fixed per `AI_INTEGRATION_AUDIT.md`).
- `GET /api/roadmaps`, `GET /api/roadmaps/:id`, `POST /api/roadmaps` (body `{ target_role, role_family, skill_gaps[] }`), `PATCH /api/roadmaps/tasks/:id/complete`, `POST /api/roadmaps/:id/refresh`
- Rate limit 5 req/min on generation (backend-enforced)

### 8. AI career mentor (chat)
**Status:** Implemented (endpoints rewritten to `/api/mentor/*`; `AiChatPage.jsx` component update noted as pending in audit).
- `GET/POST /api/mentor/conversations`, `POST /api/mentor/conversations/:id/messages`, `GET /api/mentor/context-preview`
- SSE streaming documented in backend docs but not implemented in frontend

### 9. Notifications
**Status:** Implemented.
- `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`

### 10. Admin dashboard
**Status:** Implemented.
- Overview: `GET /api/admin/dashboard` (tolerant normalizer with alias lists for stats, recent activity, audit logs)
- Users: full CRUD + activate/deactivate/role change (`/api/admin/users`)
- Companies: CRUD + verify/reject + merge (`/api/admin/companies`)
- Jobs: CRUD (`/api/admin/jobs`)
- Audit logs: read-only list + detail resolved from cache (`/api/admin/audit-logs`; no `/{id}` backend route documented)
- CMS / Auth Settings pages present; integration depth not independently verified

### 11. Missing / not implemented features (from `AI_INTEGRATION_AUDIT.md`)
- AI Job Matching & Skill Gaps (`GET /api/jobs/:id/match`, `GET /api/candidate/recommended-jobs`, `GET /api/candidate/skill-gaps`)
- AI Interview Coach
- Application Strategy
- CV Improvement Assistant
- AI Review Queue admin UI (partial)

---

## H. API and Backend Integration

### API base URL configuration
- Main client: `baseURL = import.meta.env.VITE_API_URL`. When empty, the Vite dev server proxies `/api` to `VITE_API_PROXY_TARGET` (same-origin, cookie-friendly). When set to an absolute URL, the app talks cross-origin directly.
- `VITE_API_TIMEOUT` (default `30000` ms) applies to all `api` requests; CV upload uses a per-request 120 s timeout.
- `apiAi` uses `VITE_API_AI_URL` with a hard 10 s timeout but is **not imported anywhere**.

### Axios instances and interceptors
One active client (`axiosInstance.js`):
1. Request interceptor A — injects `Accept-Language: ar`/`en` from Redux language state, falling back to URL segment or `detectInitialLanguage()`.
2. Request interceptor B — attaches `Authorization: Bearer <token>` from `tokenStore`, skipped for refresh-tagged requests.
3. Response interceptor — on 401 with an active session, queues a single shared token refresh (`/api/auth/refresh`) and retries; on refresh failure dispatches `clearCredentials()`. 403 and requests without a session are not refreshed.

### Authentication token handling
- `access_token` from login is persisted to `localStorage` (`matchin.access_token`) via `tokenStore` and mirrored into Redux `auth.token` by a store subscription.
- `withCredentials: true` ensures the httpOnly session cookie is sent cross-origin/same-origin as appropriate.
- The backend sets the cookie on login/email verification; JS never reads the cookie directly.

### Refresh-token behavior
- On any 401 while a session exists, the interceptor enqueues the request and runs one `refreshTokenRequest()`. Success retries all queued requests with the new credential; failure dispatches `clearCredentials()` and rejects the queue.
- Refresh requests are tagged with header `x-skillmatch-refresh-retry` so they never re-enter the queue.
- Boot-time (`useInitializeAuth`): `/auth/me` → on 401 without token → one refresh attempt → re-probe → `clearCredentials()` if still failing.

### Request and response patterns
- API functions return `res.data` or the unwrapped inner envelope (`res.data?.data ?? res.data`). `meRequest` unwraps to `body?.user ?? body` (Laravel `AuthResource` nests user one level deeper).
- Admin normalizers use alias lists (`pick()`) to tolerate snake_case/camelCase and nested/flat disagreements (`src/features/admin/api/normalize.js`).
- Mutations go through `useApiMutation` (auth) or `useAdminMutation` (admin), which normalize errors into `{ status, message, fieldErrors }`.

### Language headers / locale configuration
- Every outgoing `api` and `apiAi` request gets `Accept-Language: ar` or `en`, derived from the active language (URL segment → Redux → detection → default `en`).

### Error handling
- `normalizeApiError` distinguishes timeouts, network failures, and HTTP errors; returns `{ status, message, fieldErrors, isTimeout?, isNetworkError? }`.
- Auth errors are further enriched by `applyAuthStatusMessage` (`auth-error-messages.js`) mapping statuses (419, 404, 429, 401/403/410, 5xx) to i18n keys.
- Admin queries log start/success/error via `adminDevLog.js` (dev-only, gated by `VITE_ADMIN_LOG`).

### API service organization
- `src/services/axios/axiosInstance.js` — shared client + interceptors
- `src/features/<domain>/api/*.api.js` — per-domain request functions + response normalizers
- No raw `axios` calls in components or pages; all calls flow through feature API modules.

### Backend endpoints referenced by the frontend (verified from source)
Auth: `/api/auth/{register,login,me,refresh,logout,forgot-password,verify-email-otp,resend-email-otp,reset-password,forgot-password/verify-otp}`
Candidate: `/api/candidate/{profile,career-preferences}`, `/api/cv/{upload,status/:id,retry/:id,extractions/:id/verify}`, `/api/jobs`, `/api/jobs/:id`, `/api/jobs/:id/save`, `/api/jobs/:id/apply`, `/api/saved-jobs`, `/api/roadmaps`, `/api/roadmaps/:id`, `/api/roadmaps/tasks/:id/complete`, `/api/roadmaps/:id/refresh`, `/api/mentor/{conversations,conversations/:id/messages,context-preview}`, `/api/notifications`, `/notifications` (no `/api/` prefix), `/applications*`
Admin: `/api/admin/{dashboard,jobs,companies,users,audit-logs}`
AI (backend docs only, not implemented in frontend): `/api/mentor/*` (implemented), `/api/jobs/:id/match`, `/api/candidate/recommended-jobs`, `/api/candidate/skill-gaps`, `/api/interview-prep/*`, `/api/application-strategy/assess`, `/api/candidate/cv-improvements/*`, `/api/admin/ai-review-items/*`

If backend documentation exists for review, it is `README_AI_INTEGRATION.md` (root) and `API_README_CHANGES.md` (root) — both describe backend contracts the frontend should match. The frontend source itself is the source of truth for what is actually implemented.

---

## I. State Management and Data Fetching

### Global state organization
Redux store (`src/store/index.js`) holds exactly two slices:
- `auth`: `{ user, token, status }` where `status ∈ { loading, authenticated, unauthenticated }`
- `language`: `{ lang }` (`"en"` or `"ar"`)

No other client state lives in Redux. Server state is exclusively in TanStack Query.

### Redux slices
- `src/features/auth/store/auth.slice.js` — `setCredentials`, `updateUser`, `clearCredentials`
- `src/features/language/store/language.slice.js` — `setLanguage`; `initialState.lang` from `detectInitialLanguage()`
- Selectors: `selectCurrentUser`, `selectUserRole`, `selectAuthStatus`, `selectIsAuthenticated`, `selectCurrentLanguage`

### React Query configuration and query organization
`src/lib/queryClient.js`: `staleTime 5 min`, `gcTime 10 min`, `retry 1`, `refetchOnWindowFocus: false`, `refetchOnMount: false`, `refetchOnReconnect: false`.

Query keys:
- Candidate: `candidateKeys` (`src/features/candidate/constants/candidate.query-keys.js`) — profile, cv (history/status), jobs (list/details/saved), applications, roadmap, notifications, aiChat (conversations/conversation/contextPreview)
- Admin: `adminKeys` (`src/features/admin/constants/admin.query-keys.js`) — dashboard, jobs (list/detail/root), companies, users, audit-logs (list/detail/root). Invalidation targets resource **roots** so all filtered/paged variants refresh after a write.

### Cache and invalidation strategies
- Admin mutations invalidate resource roots + dashboard + auditLogs with `refetchType: "all"` (so cached-but-unmounted queries refetch on remount).
- Login clears the whole query cache (`queryClient.clear()`) to prevent cross-account data bleed.
- CV upload invalidates `cv.history`.
- Job save/apply invalidates saved jobs, job details, applications, and jobs list.

### Local component state conventions
- Component state is used only for UI transients (form fields, open/closed dialogs, wizard steps). Server data is never duplicated into local state or Redux.
- Auth forms use react-hook-form + zod resolver; validation error messages are i18n keys via `validationMessage.js`.

### Server data vs static configuration vs mock data
- Server data: all feature API calls above.
- Static configuration: `JOBS` / `JOB_CATEGORIES` in `src/constants/jobsMock.js` — consumed by the **public landing page** and the candidate job board (a shared mock catalog; real `GET /api/jobs` also exists).
- Mock fallbacks in candidate pages: `PipelineOverviewCard`, `AIMentorCard`, and `competencyData` in `useDashboardSummaryQuery` are static/mock (not backend-connected). Profile sub-tabs (skills/experience/education/projects) fall back to default data when the API returns none, but their write operations are local-only.

---

## J. Authentication and Security

### Authentication flow
1. **Boot:** `AuthInitializer` runs `useInitializeAuth()` → `GET /api/auth/me`. If 401 and no bearer token, one `POST /api/auth/refresh` then re-probe. Result dispatched to Redux `auth`.
2. **Login:** `POST /api/auth/login` → `setAccessToken(token)` (localStorage + memory) → `setCredentials({ user, token })`. Role revalidated in background via `/auth/me` only when the echoed user lacks a role.
3. **OTP registration:** register → OTP verify → `meRequest()` to read user into Redux → session established.
4. **Password reset:** forgot-password → verify-otp (returns `reset_token`) → reset-password.

### Protected routes
- `RequireAuth`: blocks unauthenticated access to `/dashboard/*`; shows spinner while `status` is `loading`/`idle`; redirects to `/:lang/auth/login` otherwise.
- `RequireOnboarding`: candidate-only; blocks candidate dashboard access until `GET /api/candidate/profile` shows `profile_completed_at` or `profile_exists`. Staff (non-candidate) bypass entirely (avoids 401 on candidate-gated endpoint).
- `DashboardRoleTree`: renders candidate or admin route tree based on `isAdminRole(user.role)`.

### Role-based access
`ADMIN_ROLES = ["super_admin","superadmin","admin","administrator"]`. `isAdminRole()` accepts a role string or user object. Unknown roles get no workspace (`NoRoleAssigned`) — a security decision, not a UX edge case.

### Session handling
- Token mirrored Redux → `tokenStore` → axios `Authorization` header.
- `withCredentials: true` sends httpOnly cookie.
- 401 → refresh queue → retry or `clearCredentials()` + redirect to login.

### Logout behavior
`useLogoutMutation` calls `POST /api/auth/logout` (failure tolerated), then `clearCredentials()`, `queryClient.clear()`, and navigates to `/:lang/auth/login`.

> **Security note:** Client-side role checks (`RequireAuth`, `DashboardRoleTree`) are UX guards only; the backend authorizes every protected endpoint. Tokens are short-lived (60 min) and invalidated server-side on logout. `localStorage` persistence trades XSS exposure for reload convenience (documented tradeoff in `tokenStore.js`).

### Environment-variable requirements (no secrets)
- `VITE_API_URL`, `VITE_API_PROXY_TARGET`, `VITE_API_TIMEOUT`, `VITE_API_AI_URL` — see section M. No real keys or credentials are stored in the repo.

---

## K. Internationalization

### Supported languages
`en` (English) and `ar` (Arabic). Enforced in `LanguageLayout.jsx` (`SUPPORTED_LANGUAGES = ["en","ar"]`) and `I18nSync.jsx`.

### Translation file organization
`src/components/shared/i18n/locales/{en,ar}/{common,dashboard,validation}.json`, initialized in `src/components/shared/i18n/index.js` with `fallbackLng: "en"`, `defaultNS: "common"`, `interpolation.escapeValue: false`.

### How the active language is selected
1. URL `:lang` segment (read by `I18nSync` on every route change)
2. Redux `language.lang` (initial value from `detectInitialLanguage()`: URL segment → `localStorage` `skillmatch_last_route` → default `en`)
3. `document.documentElement.lang` and `dir` (`rtl` for `ar`, `ltr` for `en`) set by `I18nSync`
4. Last route persisted to `localStorage` by `RouteTracker`/`languageStorage.js`; `RootRedirect` restores it on `/`

### RTL/LTR handling
- `dir` on `<html>`; Tailwind logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) handle most layout mirroring.
- Physical glyphs (arrows, chevrons, log-in/out icons) are mirrored via `scale: -1 1` under `[dir="rtl"]` in `src/index.css`.
- Gradient angles, transforms, and decorative icon glyphs are deliberately not mirrored.

### How to add or update translations
1. Add the key to `src/components/shared/i18n/locales/en/<namespace>.json` and the matching key to the `ar/` file.
2. Use `useTranslation("common")` / `t("key")` in components; `validationMessage(key)` for Zod error messages.
3. `validationMessage.js` translates raw backend error strings (email required, password rules, file type/size, etc.) into i18n keys by pattern matching.

### Rules for static UI text vs translated backend content
- All static UI text must go through i18n (both locales). New features must add keys to both `en` and `ar` files.
- Backend error strings are normalized by `validationMessage.js` / `auth-error-messages.js` into i18n keys where possible; otherwise the server message is shown directly.

---

## L. Coding Conventions and Development Guidelines

Conventions already used in the codebase (do not impose a new architecture):

### Naming conventions
- Files: camelCase (`.jsx` for React components, `.js` otherwise). Route guards/pages exported as named or default consistently per module.
- API functions: `fetchXRequest` / `normalizeX` / `useXQuery` / `useXMutation`.
- Query keys: plain nested arrays under domain keys (`candidateKeys.*`, `adminKeys.*`).

### Component organization
- Feature domains own their pages, components, hooks, API, schemas, and shared data under `src/features/<domain>/`.
- Cross-feature UI: `src/components/{layouts,shared,ui}/`.
- Route-level components are pages; layout shells are under `src/components/layouts/`.

### Hooks and service patterns
- Every data read/write is a feature hook wrapping React Query; components never call `api` directly.
- API modules export request functions and normalizers; hooks export query/mutation hooks and re-export normalizers where needed.
- `useAdminQuery`/`useAdminMutation` are the single admin factories (logging, error normalization, invalidation). Candidate domain uses `useApiMutation` + per-domain `useQuery`/`useMutation`.

### TypeScript practices
- The project is **not TypeScript** (`jsconfig.json` only, no `tsconfig`, all `.js`/`.jsx`). No TS types to maintain; JSDoc-style comments are used sparingly.

### Error and loading state conventions
- Components read `isPending`/`isError`/`data`/`error` from hooks directly — no local loading booleans.
- Errors normalized to `{ status, message, fieldErrors }` before reaching components.
- Admin: `useAdminQuery` normalizes inside `queryFn`; mutations invalidate only on success.

### Styling conventions
- Tailwind utility classes; Matchin design tokens in `src/index.css` (`--color-primary`, `--color-secondary`, `--color-accent`, fonts).
- Use `cn()` from `src/lib/utils.js` for conditional classes.
- Prefer logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) for RTL.
- Mirror directional Lucide icons under `[dir="rtl"]` via existing `index.css` rules rather than per-component `rtl:` variants.

### Guidelines for adding a new page, feature, or API integration
1. Place the feature under `src/features/<domain>/` with `api/`, `hooks/`, `pages/`, `schema/`, `shared/` as appropriate.
2. Add the route to `src/app/routes/*.routes.jsx` (auth) or `src/app/routes/dashboard.routes.jsx` (dashboard) and update `DashboardRoleTree`/sidebar `handle` metadata if it should appear in navigation.
3. Use the shared `api` client (`src/services/axios/axiosInstance.js`); do not create a new axios instance.
4. Normalize responses at the API boundary (`unwrap`, `pick` alias lists); never let raw server fields reach components.
5. Add translations to both `en` and `ar` locale files; verify `dir`/`lang` behavior.
6. Guard candidate-only endpoints with `isCandidateRole()` inside the hook (not at each call site) to prevent admins hitting 401 → refresh → logout loops.
7. Inspect `src/docs/` reports (`AI_INTEGRATION_AUDIT.md`, `FEATURE_IMPLEMENTATION_PLAN.md`, `PROFILE_INTEGRATION_REPORT.md`) before touching AI, profile, or Overview features.
8. Run `npm run build` and `npm run lint` after changes (no test suite exists).

---

## M. Environment Variables

Inspected from `.env.example`, `.env`, `.env.local`, `vite.config.js`, and `src/services/axios/axiosInstance.js`.

| Variable | Purpose | Required | Example format |
|---|---|---|---|
| `VITE_API_URL` | Base URL for the main `api` axios client. Empty = use Vite `/api` dev proxy to `VITE_API_PROXY_TARGET`. | No | `https://api.example.com` or (empty) |
| `VITE_API_PROXY_TARGET` | Target host for the Vite `/api` dev proxy (dev only). | No | `https://backend.example.com` |
| `VITE_API_TIMEOUT` | Request timeout in ms for all `api` requests. | No | `30000` |
| `VITE_API_AI_URL` | Base URL for the `apiAi` client (currently unused). | No | `https://ai.example.com/api/v1` |
| `VITE_ADMIN_LOG` | Set `false` to silence admin dev-layer console logging. | No | `false` |

Values prefixed `VITE_` are exposed to the Vite/front-end build. Restart the dev server after changes. Real secrets must never be committed; `.env` and `.env.local` are gitignored.

---

## N. Available Scripts

From `package.json`:

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start dev server with HMR; `/api` requests proxied when `VITE_API_URL` is empty |
| `build` | `vite build` | Production build to `dist/` |
| `lint` | `oxlint src` | Lint the `src` tree with Oxlint (react + oxc plugins) |
| `preview` | `vite preview` | Serve the production bundle locally |

No `test` script exists; `jest` is installed but no test files are present.

---

## O. Known Limitations and Technical Debt

All items verified from the codebase:

1. **Mock data still in use:** `src/constants/jobsMock.js` (`JOBS` catalog) feeds the public landing page and candidate job board alongside real `GET /api/jobs`. `src/features/candidate/shared/*Mock.js` files exist (mock notifications, roadmap phases, CV, pipeline stats, competency data).
2. **Overview page static cards:** `PipelineOverviewCard` and `AIMentorCard` on the dashboard Overview use static/mock data; `competencyData` in `useDashboardSummaryQuery.js` is hardcoded (noted in `FEATURE_IMPLEMENTATION_PLAN.md` and `PROFILE_INTEGRATION_REPORT.md`).
3. **Profile sub-tabs write operations local-only:** Skills/Experience/Education/Projects tabs load from the profile API but create/update/delete are local state only; avatar upload and profile image are not implemented (backend support unconfirmed).
4. **Unused axios client:** `src/services/axios/axiosInsranceApi.js` (`apiAi`) is defined but never imported.
5. **Unused dependency:** `js-cookie` is installed but no imports found in `src/`.
6. **No tests:** `jest` is a devDependency but no test files or `test` script exist.
7. **Not TypeScript:** `jsconfig.json` path aliases only; no static type checking.
8. **Missing AI features:** AI Job Matching, Skill Gaps, Interview Coach, Application Strategy, CV Improvement Assistant, and full AI Review Queue admin UI are documented as not implemented in `src/docs/AI_INTEGRATION_AUDIT.md`.
9. **Admin CMS/Auth Settings integration depth:** Pages exist in the router but backend integration was not independently verified from source.
10. **`applications.api.js` uses paths without `/api/` prefix** (`/applications`, `/applications/:id`) — works only because `api` baseURL may already include a prefix; behavior depends on backend deployment.

No application code was modified to address these as part of this documentation task.

---

## P. Guide for Future AI Agents

### Application purpose and architecture
MatchIn is a React 19 + Vite SPA for job candidates and administrators. Candidates browse/apply to jobs, manage CVs, follow AI roadmaps, and chat with an AI mentor; administrators manage users, companies, jobs, and audit logs. The app is fully localized (`en`/`ar`, RTL/LTR).

**Key architectural rule:** server state → TanStack Query; client/session state → Redux (only `auth` and `language` slices). Never duplicate Query data into Redux.

### Main source directories
- `src/app/` — router, providers, route guards (`RequireAuth`, `RequireOnboarding`, `DashboardRoleTree`)
- `src/features/<domain>/` — per-domain `api/`, `hooks/`, `pages/`, `schema/`, `shared/`, `components/`
- `src/components/{layouts,shared,ui}/` — layout shells, cross-feature UI, shadcn primitives
- `src/services/axios/` — the single active axios client + token store
- `src/store/` — Redux store (auth + language slices)
- `src/lib/` — `queryClient`, `normalizeApiError`, `cn`
- `src/docs/` — implementation/audit reports (read before touching AI/profile/Overview)

### Important entry points and configuration files
- `index.html` → `src/main.jsx` → `src/app/App.jsx` → `src/app/router.jsx`
- `src/app/providers.jsx` — Redux + QueryClient + `AuthInitializer` (`useInitializeAuth`)
- `src/services/axios/axiosInstance.js` — THE one axios client (do not add another)
- `src/store/index.js` — Redux store + token mirror subscription
- `src/lib/queryClient.js` — React Query defaults
- `vite.config.js`, `package.json`, `.env.example`

### Routing and state management conventions
- All routes under `/{lang}` (`en`/`ar`); use `useLocalizedPath()` from `@/utils/routes` for internal links.
- Route guards: `RequireAuth` (auth), `RequireOnboarding` (candidate profile completion), `DashboardRoleTree` (candidate vs admin tree by `isAdminRole()`).
- Sidebar nav is built from `dashboard.routes.jsx` `handle` metadata via `buildSidebarNav.js` — keep both in sync when adding admin routes.
- Redux owns only the session; all data fetching goes through feature hooks in `features/*/hooks/`.

### API integration patterns
- Use `api` from `@/services/axios/axiosInstance` only. It attaches `Accept-Language` and `Authorization: Bearer <token>`, and auto-refreshes on 401.
- Normalize responses at the API boundary: `unwrap` (`res.data?.data ?? res.data`) and `pick()` alias lists for snake_case/camelCase tolerance (`src/features/admin/api/normalize.js`).
- Errors flow through `normalizeApiError` (`@/lib/normalizeApiError`) → `{ status, message, fieldErrors }`.
- New admin reads/writes should use `useAdminQuery`/`useAdminMutation` from `@/features/admin/hooks` for consistent logging, normalization, and cache invalidation.
- Candidate-only hooks must gate on `isCandidateRole()` inside the hook (see `useProfileQuery`).

### Authentication and authorization rules
- `isAdminRole(role)` in `src/features/auth/store/auth.roles.js` is the single source of truth for admin status (`super_admin`, `superadmin`, `admin`, `administrator`).
- Unknown roles → no workspace (`NoRoleAssigned`); never grant admin access to an unrecognized role.
- `RequireAuth` and `DashboardRoleTree` are UX guards only — backend authorizes every endpoint.

### Internationalization conventions
- Add keys to both `en` and `ar` under `src/components/shared/i18n/locales/<lang>/<namespace>.json`.
- Use `useTranslation(ns)` / `t()`; `validationMessage(key)` for Zod errors.
- `I18nSync` sets `document.documentElement.lang`/`dir`; mirror directional icons via existing `[dir="rtl"]` CSS rules.

### Existing documentation files to read before making changes
- `src/docs/AI_INTEGRATION_AUDIT.md` — AI endpoint contracts, discrepancies, missing features
- `src/docs/FEATURE_IMPLEMENTATION_PLAN.md` — Overview error isolation + profile integration details
- `src/docs/OVERVIEW_ERROR_ISOLATION_REPORT.md` — per-section error handling pattern
- `src/docs/PROFILE_INTEGRATION_REPORT.md` — profile tabs, read-only vs backend-connected
- Root: `README_AI_INTEGRATION.md`, `API_README_CHANGES.md`, `CLIXAD.md` (backend contracts and conventions)

### Critical implementation constraints
- Do not create a second axios client; `apiAi` exists but is unused.
- Do not add test infrastructure (none configured; `jest` unused).
- Do not treat localStorage token persistence as a security boundary — it is a deliberate reliability tradeoff (XSS exposure vs. one refresh round-trip per reload).
- Candidate-only endpoints called by non-candidates trigger 401 → refresh → `clearCredentials()` (logout). Gate at the hook level.

### Recommended workflow for analyzing and implementing new features safely
1. **Inspect before changing:** read the relevant feature's `api/*.api.js`, `hooks/*.js`, and any `docs/*` report covering the area.
2. **Verify the route:** confirm the path exists in `router.jsx` / `dashboard.routes.jsx` / `auth.routes.jsx` and decide which guard applies.
3. **Confirm state location:** server data → React Query hook; session data → Redux `auth` slice. Do not mix.
4. **Add i18n keys** to both locales for any new static text.
5. **Run verification:** `npm run build` and `npm run lint` after every change (no test suite exists).
6. **Update this README** if you add routes, env variables, scripts, or state slices so it stays the source of truth.

---

## Verification

- Project structure, route paths, API endpoints, environment variables, and scripts were verified against `package.json`, `vite.config.js`, `.env*`, `src/app/router.jsx`, `src/app/routes/*.jsx`, `src/services/axios/axiosInstance.js`, and feature `api/`/`hooks/` modules.
- Only `README.md` was created/modified. No application source files were changed.
