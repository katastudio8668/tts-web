# KATA TTS Web — Admin Console

> **Status:** DESIGN / PLANNED. No Admin route is currently listed in the Web README. This file defines the future UI; it does not claim the screens are implemented.
> **Backend contract:** [Admin Console — User, Revenue, Credit and TTS Analytics](https://github.com/thanhtai-personal/korva-tts-api/blob/main/docs/21-admin-console-and-analytics.md)

## 1. Product direction

Add a protected Admin workspace to the existing React + TypeScript application. Keep customer routes and the Admin area in one app so they share the existing Supabase Auth session, API client, query infrastructure, design tokens and deployment.

Use a distinct Admin layout with its own navigation and overview. Do not create a second frontend app or connect the browser directly to PostgreSQL/Supabase business tables.

## 2. Reuse from Clothe Rental

The clothe-rental-management source was inspected at DashboardShell, DashboardNav, RevenueReportPage, SettingsUsersPage and useDashboardShell. Reuse these as design/interaction references:
- DashboardShell for responsive/collapsible navigation and a consistent dashboard frame.
- DashboardNav for grouped navigation, active-route indication, icons and focus styling.
- RevenueReportPage for the reporting-page pattern and date-filtered chart composition.
- SettingsUsersPage for access-denied, loading/error states, searchable/paginated user lists and create/edit drawers.
- useDashboardShell for the principle of role-aware navigation, always paired with backend authorization.

These are not drop-in components: Clothe Rental uses Next.js App Router + MobX and branch-scoped roles, while KATA uses Vite/React Router + TanStack Query and a single ADMIN role. Rebuild/adapt only the relevant presentation patterns using KATA's existing dependencies. Do not copy Next.js route files, Clothe Rental database tables, branch-scoped permissions, Supabase data-access code or domain logic.

## 3. Route map

Proposed routes (final path syntax must follow the current router implementation):

| Route | Page |
|---|---|
| /admin | Overview dashboard |
| /admin/users | User directory |
| /admin/users/:userId | User detail |
| /admin/transactions | Payment transactions |
| /admin/credits | Credit ledger |
| /admin/generations | Voice generation/API activity |
| /admin/models | Model analytics |
| /admin/audit-logs | Admin audit history |

The Admin entry should be shown only for an authenticated ADMIN account. Direct navigation by a non-admin should show an access-denied state or redirect to the customer area. The API remains the security authority.

## 4. Layout and navigation

Desktop:
- Persistent left navigation with Overview, Users, Transactions, Credits, Generations, Models and Audit.
- Compact top bar with page title, selected date range, current admin identity and sign-out.
- Main content area with consistent page width, responsive tables and charts.
- Breadcrumbs on detail pages.

Mobile/tablet:
- Collapsible navigation drawer.
- KPI cards stack; wide tables use responsive horizontal scroll or compact row cards.
- Filters remain reachable without covering primary content.

Use existing typography, spacing, color tokens, buttons, inputs, dialogs, cards and chart libraries already present in the app. Avoid introducing a new UI library unless the current system lacks a required primitive.

## 5. Page requirements

### Overview

- Default time range: last 30 days; timezone: Asia/Ho_Chi_Minh.
- KPI cards: paid revenue (VND), paid orders, new users, active users, successful jobs, successful characters, success rate, credits consumed.
- Revenue trend and successful characters/jobs trend.
- Usage by model and top users.
- Recent payment and generation failures.
- Every chart displays the selected period and a useful empty/loading/error state.

### Users

- Search email/name/internal ID.
- Filter role, created date, paid status and credit range.
- Table columns: user, role, created date, available/reserved credits, lifetime paid VND, successful characters/jobs, last activity.
- Detail tabs: Profile, Credits, Payments, Usage, Models and Audit.
- Credit grant dialog must display amount, reason, target account and idempotency behavior; require explicit confirmation.
- Never show raw keys, tokens, user text, audio or private storage paths.

### Transactions

- Search order code and user; filter provider, status, date and amount.
- Display package snapshot, amount VND, credit quantity, payment status, created/paid times and masked provider transaction reference.
- Detail view shows sanitized payment event timeline.
- Count only persisted PAID orders as revenue.

### Credits

- Separate ledger view, not mixed with payment orders.
- Show signed credit amount, entry kind, user, reason/description, actor/source, timestamp and safe reference.
- Filters: user, kind, date and amount.

### Generations

- Distinguish API request events, unique generation jobs and engine attempts.
- Filters: user, date, status, model/version, voice and language.
- Show submitted/accepted/replayed/rejected request counts, jobs by terminal state, success rate, successful characters, credits charged and latency.
- Do not display generation text or audio.

### Models

- Group by immutable model code/version and engine/provider.
- Show request count, unique jobs, attempts, successful/failed jobs, success rate, successful characters, credits charged and latency p50/p95.
- If historical model attribution is unavailable, display an explicit unavailable/unknown bucket and explain the coverage start date. Never infer past model identity from current runtime configuration.

### Audit logs

- Filter actor, action, target type/ID and time range.
- Show who performed what, on which target and when.
- Metadata is allow-listed and redacted.

## 6. Data fetching and UI state

Follow the current app's architecture:
Page/Component -> feature hook -> TanStack Query -> API service -> NestJS Admin API.

- Use shared API client and typed DTOs.
- Use stable query keys containing all filters and pagination.
- Server-paginate tables; do not fetch all users/orders/jobs into the browser.
- Keep filter state in URL query parameters when practical so views can be bookmarked.
- Debounce text search; do not debounce date/status selectors unnecessarily.
- Show skeleton/loading, error with retry, empty state, stale-data indication and success feedback.
- Invalidate affected user/ledger/overview queries after a credit grant.
- Prevent duplicate mutations with pending state and stable idempotency key.
- Avoid optimistic credit/revenue changes; refresh from the API's persisted response.
- Abort stale requests when filters change or the page unmounts.

## 7. Security and accessibility

- Route guard is UX only; every endpoint must enforce Admin authorization server-side.
- Never trust role data supplied by the browser without a verified session/API response.
- Do not put secrets in VITE_* variables.
- Ensure keyboard navigation, visible focus, semantic table headings, labelled filters, accessible chart summaries and dialog focus management.
- Confirm before sensitive mutations; provide clear error messages without internal stack/provider details.

## 8. UI acceptance checklist

- [ ] Non-admin cannot view Admin pages or call Admin APIs.
- [ ] Admin navigation and route states work on desktop and mobile.
- [ ] All pages have loading, error, empty and populated states.
- [ ] Tables support server-side filtering, sorting and pagination.
- [ ] Date filters use Asia/Ho_Chi_Minh by default and match backend interval semantics.
- [ ] Revenue uses paid orders only; customer paid amount is distinct from credits consumed.
- [ ] API requests, unique jobs and engine attempts are labelled separately.
- [ ] Successful characters count only persisted successful usage.
- [ ] Model/version grouping uses historical persisted attribution.
- [ ] Sensitive content and credentials are never rendered.
- [ ] Credit grant confirmation and post-mutation refresh are correct.
