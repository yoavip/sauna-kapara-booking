# VERSION_CHANGE_REVIEW.md

_Snapshot of the current app before planning the next version. No code has been modified._

---

## 1. Overview

This is a Hebrew (RTL) community web app for **בית קשת** built with React 18 + Vite + TypeScript + Tailwind + shadcn/ui, using **Lovable Cloud (Supabase)** as the backend. It bundles several loosely-coupled sub-products under one deployment:

1. **Sauna booking** — community sauna time-slot registration with real-time occupancy.
2. **Snooker booking** — separate table-time registration for the snooker room.
3. **Snooker statistics** — analytics dashboard for snooker usage (for committee reports).
4. **Effi booking** — private landing page for a specific host ("אפי") to accept vacation stay requests.
5. **Effi admin** — private admin view of incoming Effi bookings.
6. **Tour guide** — public marketing / contact page for a Galilee tour guide (uses an email edge function).

The sauna and snooker systems are intentionally isolated (separate tables, stores, welcome screens, sessions).

---

## 2. Pages, Routes, Screens & Main Flows

### Routes (`src/App.tsx`)

| Path | Component | Purpose |
|---|---|---|
| `/` | `pages/Index.tsx` | Sauna app shell (welcome / register / view / admin / snooker sub-screen) |
| `/snooker` | `pages/SnookerLanding.tsx` | Snooker landing page |
| `/snooker/rules` | `pages/SnookerRules.tsx` | Snooker rules page |
| `/snooker/register` | `pages/SnookerRegister.tsx` | Wraps `SnookerRegistration` component |
| `/snooker/stats` | `pages/SnookerStats.tsx` | Usage analytics dashboard (Excel export gated by password `1981`) |
| `/tour-guide` | `pages/TourGuide.tsx` | Public tour-guide landing + contact form |
| `/effi` | `pages/EffiBooking.tsx` | Private booking form for Effi's house |
| `/effi/admin` | `pages/EffiAdmin.tsx` | Private admin panel for Effi bookings |
| `*` | `pages/NotFound.tsx` | 404 |

### Sub-screens inside `/` (state machine in `Index.tsx`)
`welcome` → `register` → `view` → `admin-users` → `snooker`. Browser back button always returns to `welcome`.

### Primary user flows
- **Sauna**: user enters name/lastName/phone on Welcome + accepts rules → session stored in `userStore` (zustand, persisted) → picks an hour on `RegistrationScreen` → row in `registrations`. Can add guest participants. Can cancel own or guest registrations. Can view "who's here" (`ViewRegistrations`) with WhatsApp contact templates. Admins see extra "ניהול משתמשים" button.
- **Snooker**: fully parallel flow, `snookerUserStore`, `snooker_registrations` table, `SnookerRegistration` + `SnookerViewRegistrations`.
- **Effi**: no auth — visitor fills form → insert into `effi_bookings` → thank-you screen. Admin page reads all rows and can delete.
- **Tour guide**: submits contact form → `send-tour-contact` edge function sends email via Resend.

---

## 3. Existing Features

- **Real-time slot occupancy** for sauna and snooker via Supabase Realtime subscription (see architecture memory).
- **Dynamic display names** — DB triggers/functions ensure "first name + first letter of last name" only when there's a first-name conflict.
- **Thermometer background** (`ThermometerBackground.tsx`) that visualizes sauna occupancy 22°C → 80°C.
- **Cancellation logic** — user can cancel own registration; cascading prompts for guests they added.
- **Guest / additional-participant registration** (`AddSingleParticipantSheet.tsx`).
- **Rules sheets** (`RulesSheet.tsx`, `SnookerRulesSheet.tsx`) — scroll-to-accept for snooker; links to Google Docs "Golden Rules" and operating instructions for sauna.
- **Admin management** (`AdminUsersPage.tsx`) — list users, delete, CSV exports, activity logs. Access via role `admin` in `user_roles` or phone `12345678` (per memory).
- **Analytics tracking** (`src/lib/analytics.ts`) — `page_view`, `registration`, `cancellation`, `user_created` written to `analytics` table.
- **Snooker statistics** (`SnookerStats.tsx`) — KPIs (total hours, unique users, avg hours/day, occupancy, avg occupied/day, peak day, peak hour), weekly trend `LineChart`, day-of-week `BarChart`, hour-of-day `BarChart`, top-users table, Excel export via `xlsx` gated by password `1981`.
- **Effi bookings** — form with date range, guest counter, house rules, notes, zod validation; admin page lists + deletes.
- **Tour guide contact form** → Resend email via edge function.
- **Feedback button** (`ReportBugButton.tsx`) — floating yellow WhatsApp support button (per memory).
- **OG social preview** via `og-proxy` edge function for dynamic previews per route.

---

## 4. Main Files, Components, Hooks, Services, Integrations

### Stores (Zustand, persisted to localStorage)
- `src/stores/userStore.ts` — sauna user (name, lastName, phone, userId, `_isAdmin`), upserts into `users` table, checks role via `has_role` RPC, refreshes display-name cache.
- `src/stores/snookerUserStore.ts` — snooker user (isolated, no DB write; local only + `agreedToRules`).

### Libraries
- `src/lib/analytics.ts` — `trackEvent`, `trackPageView`, `trackRegistration`, `trackCancellation`, `trackUserCreated`.
- `src/lib/displayName.ts` — cache of display-name resolution.
- `src/lib/utils.ts` — `cn` helper.

### Key components
- Sauna: `WelcomeScreen`, `RegistrationScreen`, `ViewRegistrations`, `AdminUsersPage`, `RulesSheet`, `AddSingleParticipantSheet`, `ThermometerBackground`, `BookingForm`.
- Snooker: `SnookerRegistration`, `SnookerViewRegistrations`, `SnookerRulesSheet` + pages under `/snooker/*`.
- Tour guide marketing: `Header`, `Hero`, `About`, `Contact`, `Footer`, `NavLink`.
- Global: `ReportBugButton`.

### Integrations
- **Supabase (Lovable Cloud)** — client at `src/integrations/supabase/client.ts` (do not edit).
- **Supabase Edge Functions**:
  - `supabase/functions/og-proxy/index.ts` — dynamic OpenGraph metadata.
  - `supabase/functions/send-tour-contact/index.ts` — sends emails via Resend (`RESEND_API_KEY` secret).
- **Google Docs links** — Golden Rules & operating instructions embedded as external links.
- **WhatsApp `wa.me`** deep links for participant contact and feedback.
- **`xlsx`** npm package for stats export.
- **`recharts`** for statistics charts.
- **`react-router-dom`**, **`@tanstack/react-query`**, **`zod`**, **`date-fns`**, **`zustand`**, **`sonner`**, **shadcn/ui**.

---

## 5. Current Logic

### Bookings (sauna / snooker)
- Slots are per-hour integers (`hour` column). No date column on `registrations` / `snooker_registrations` — rows are effectively per current day/session (see Risks).
- Realtime subscription refreshes list on insert/delete. Manual refresh is also called after mutations to avoid stale UI (per memory).
- Sauna hides past hours for "today"; snooker has its own hour list.

### Users & permissions
- `users` keyed by `phone` (not `auth.users`). Upsert on session save. `display_name` recomputed by DB functions.
- Roles stored in **separate** `user_roles` table with enum `app_role ('admin','user')`.
- Admin check uses `has_role(_phone, _role)` SECURITY DEFINER RPC. Client also treats phone `12345678` as admin (per memory).
- **There is no Supabase Auth** — identity is a phone number entered by the user. All RLS policies below are effectively open.

### Payments
- **None.**

### Notifications
- Contact-by-WhatsApp templates opened via `window.open('https://wa.me/...')`. No push/SMS/email to sauna or snooker users.
- Tour-guide contact form triggers Resend email via edge function.
- Effi does not currently get notified of new bookings — he must open `/effi/admin` to see them.

### Admin actions
- Delete users; CSV export of users / registrations / activity; view activity log with full names (per memory).
- Effi admin: view + delete `effi_bookings` rows.

### Stats logic (`SnookerStats.tsx`)
- Pulls all rows from `snooker_registrations` where `registered_at >= 2026-01-01`.
- `totalHours` = row count. `totalOccupied` = unique `date|hour`. `avgHoursPerDay` / `avgOccupiedPerDay` divide by unique dates.
- Excel export prompts for password (`1981`) client-side; not a real security boundary.

---

## 6. Database & Backend

### Tables (public schema)
| Table | Purpose | Notable columns | RLS state |
|---|---|---|---|
| `users` | Sauna+shared identity keyed by phone | `phone`, `name`, `last_name`, `display_name` | **Anyone** can SELECT/INSERT/UPDATE/DELETE |
| `user_roles` | Role assignments | `user_id → users.id`, `role app_role` | **Anyone** SELECT/INSERT/DELETE |
| `registrations` | Sauna time-slot bookings | `name`, `phone`, `hour`, `registered_at` | Anyone SELECT/INSERT/DELETE, no UPDATE |
| `snooker_registrations` | Snooker time-slot bookings | Same shape as `registrations` | Same as above |
| `effi_bookings` | Vacation-house bookings | `full_name`, `phone`, `check_in`, `check_out`, `guests_count`, `rules_accepted`, `notes` | Anyone SELECT/INSERT/DELETE |
| `analytics` | Event log | `event_type`, `event_data jsonb`, `user_name`, `user_phone` | Anyone SELECT/INSERT |

### Functions
- `has_role(_phone, _role)` — SECURITY DEFINER role check.
- `update_display_names()` / `recalculate_display_name_on_update()` — display-name conflict logic (SECURITY DEFINER).

### Enum
- `app_role` = `'admin' | 'user'`.

### Edge functions
- `og-proxy` — social preview HTML per route.
- `send-tour-contact` — Resend email for tour-guide contact form.

### Storage buckets
- **None.**

### Secrets present
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`.

---

## 7. Current Version — Important Behavior (do not break)

- Hebrew RTL layout across every user-facing page.
- Sauna and snooker must stay **fully isolated**: separate tables, stores, welcomes, sessions, visual identities.
- Display-name rule: first name only unless conflict, then add first letter of last name — enforced by DB triggers, do not bypass.
- Mobile browser back button returns to sauna welcome screen (does not exit app).
- Admin gate: phone `12345678` OR `user_roles.role = 'admin'`.
- **No "Share" (שיתוף) buttons.** Never re-introduce.
- "Change details" button removed — session reset only via "לא אני".
- Feedback button (yellow WhatsApp) must remain floating and global.
- Snooker rules require scroll-to-accept, and grant the lockbox code (8264) and radio bar access afterward.
- OG proxy edge function must continue to serve dynamic previews per route.
- Real-time subscriptions + manual re-fetch pattern must remain (prevents stale UI).
- Stats page uses cutoff date `2026-01-01`; Excel export gated by password `1981`.
- Effi booking is a private, unlinked page (URL-only access) — must not be exposed in nav.

---

## 8. Risks / Fragile Areas

- **No authentication.** Every RLS policy is `using: true` / `check: true`. Any visitor can read/insert/delete every row in every table, including `user_roles`. **Anyone can grant themselves admin.** High-severity risk if next version exposes anything sensitive.
- **Admin backdoor phone `12345678`** hardcoded — trivial to bypass admin gate from the client.
- **Excel-export password `1981`** is a client-side check only; data is publicly readable anyway (`snooker_registrations` RLS is open).
- **`registrations` / `snooker_registrations` have no `date` column** — only `hour` (integer) and `registered_at` timestamp. Anything that computes "today" relies on `registered_at` and local timezone; historical filtering and per-day dedupe in stats depend on this and is easy to get wrong.
- **Two parallel user models** (`userStore` writes to DB; `snookerUserStore` is local-only). Divergence is easy.
- **Display-name logic lives in DB triggers** — client cache (`displayName.ts`) must be refreshed manually after writes. Missed refresh = stale names.
- **Analytics table grows unbounded** with public write access — spam / cost risk.
- **`Index.tsx` uses a custom hash-history state machine** alongside React Router — mixing the two makes deep-linking sauna sub-screens brittle.
- **Large components**: `SnookerRegistration.tsx` (657 lines), `RegistrationScreen.tsx` (587), `AdminUsersPage.tsx` (474), `SnookerLanding.tsx` (432) — high blast radius for edits.
- **Effi admin has no auth** — anyone with the URL can view/delete bookings.
- **`user_roles` policies allow public INSERT** — direct privilege escalation vector.
- **Client env keys duplicated** — `.env` uses `VITE_SUPABASE_PUBLISHABLE_KEY`; ensure any new code uses the same names generated by Lovable Cloud.
- Some Effi rule copy is duplicated (icon `🕚` used for both check-in and check-out).

---

## 9. Recommended Structure for Next Version Changes

Use a section per feature. Suggested template:

```
### <Feature name>
- Goal:
- Affected routes / pages:
- Affected components:
- DB changes (tables / columns / policies / functions):
- Edge functions / secrets:
- New dependencies:
- Analytics events to add:
- Acceptance criteria:
- Out of scope:
- Risks / regressions to watch:
```

Suggested buckets to slot future work into:
1. **Auth & permissions** (close the open-RLS problem).
2. **Sauna booking changes**.
3. **Snooker booking changes**.
4. **Snooker statistics changes**.
5. **Effi booking / admin changes**.
6. **Tour guide changes**.
7. **Notifications** (WhatsApp / email / push).
8. **Admin tools & exports**.
9. **Design system / theming**.
10. **Infrastructure** (edge functions, migrations, cleanup).

---

## 10. Questions Before Implementation

1. **Auth strategy** — do we finally introduce Supabase Auth (phone OTP? email magic link? Google?) and lock down RLS, or keep the "phone as identity" model?
2. **Scope of next version** — which of the sub-products (sauna / snooker / stats / Effi / tour) is actually changing?
3. **Effi flow** — should Effi be notified of new bookings automatically (email / WhatsApp), and should `/effi/admin` be protected?
4. **Snooker stats** — is the `2026-01-01` cutoff still correct, and should the `1981` export password be replaced with real auth?
5. **`user_roles` public writes** — OK to lock this down now, or is any current admin flow relying on client-side inserts?
6. **Date handling for bookings** — do we need to add a proper `date` column to `registrations` / `snooker_registrations`, or keep the current "hour-of-today" assumption?
7. **Localization** — staying Hebrew-only, or is English needed anywhere (e.g. tour guide)?
8. **Payments** — any monetization coming (sauna dues, snooker fee, Effi deposit)? Would decide whether to enable Stripe/Paddle.
9. **Analytics** — keep the public `analytics` table, or migrate to a proper provider / restrict writes?
10. **Admin identity** — retire the `12345678` backdoor?

---

_End of review._
