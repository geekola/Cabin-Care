# Cabin Care Platform

**Tagline:** We Make Cabin Care Easy

**Brand Essence:** Reliable. Warm. Local. Professional.

Cabin Care helps remote property owners manage inspections, maintenance, seasonal readiness, and staff coordination from anywhere. The platform combines property management, inspection ordering, job execution, repair tracking, and staff communication into a single system.

**Target customers:** Non-local property owners, vacation cabin owners, STR/MTR/LTR operators, property managers, and maintenance teams.

---

## Brand Assets

| Asset | Path |
|---|---|
| Logo (light background) | `screenshots/logo-light.png` |
| Logo (dark background) | `screenshots/logo-dark.png` |
| Favicon | `screenshots/favicon.png` |

Logo style: gold shield containing a pine tree, house roofline, and checkmark. "CABIN CARE" in spaced caps with "SERVICES" subtitle flanked by gold rule lines.

### Colors

| Name | Hex |
|---|---|
| Evergreen | `#1F4D3A` |
| Cabin Gold | `#D9A441` |
| Mountain Mist | `#E8ECEB` |
| Pine Shadow | `#2C3A32` |
| Sky Blue | `#8BBBD9` |
| Warm Sand | `#F5E9D3` |

Primary buttons: Evergreen. Accents: Cabin Gold.

### Typography

Roboto — headings and body.

### Voice

Warm, helpful, reassuring, professional. Write like a trusted local expert. Avoid corporate jargon.

---

## Architecture Overview

### Data Model Flow

```
Property Owner
  └── creates Booking (inspection booking: property + checklists + date)
        └── Assignment (field work unit, assigned to staff)
              ├── AssignmentResults  (checklist item responses)
              ├── AssignmentPhotos   (images per result)
              └── RepairItems (flagged repairs with cost estimates)
                    └── WorkOrder (created after customer approves a RepairItem)
```

### Roles

| Role | Description |
|---|---|
| `customer` | Property owner — creates bookings, reviews reports, approves repairs |
| `staff` | Inspector — receives and completes assignments |
| `repair_tech` | Executes approved repair work orders |
| `admin` | Platform admin |

### Status Enums

- **BookingStatus:** `pending → confirmed → assigned → in_progress → completed / cancelled`
- **AssignmentStatus:** `pending → in_progress → completed / cancelled`
- **RepairStatus:** `pending → approved / declined → completed`
- **WorkOrderStatus:** `pending → scheduled → in_progress → completed`

---

## Core Modules

### Property Management

Create, edit, and archive properties. Store access instructions, lockbox codes, and notes. Every property has a history timeline showing all activity.

### Bookings (Inspection Orders)

Property owners book inspections by selecting a property, one or more checklists, and a scheduled date (+ optional backup date). This creates a `Booking`. Payment is handled via a platform subscription (see below), not per-inspection.

### Checklist Management

System-provided templates and custom owner-created checklists. Items support types: `pass_fail`, `yes_no`, `number`, `text`, `photo`. Items are grouped by `sectionName` with `sortOrder`.

### Assignments (Field Work)

When a Booking is confirmed and staff is assigned, an `Assignment` is created. Staff use the mobile dashboard to view assigned work, submit checklist results (`AssignmentResult` per item), upload photos (`AssignmentPhoto`), and flag repair issues (`RepairItem` with cost estimate).

### Repair Workflow

Staff flags a `RepairItem` on a completed Assignment → owner reviews estimate and approves or declines → approved items generate a `WorkOrder` assigned to a `repair_tech`.

### Staff Management

Invite staff by email, assign to properties, activate/deactivate, and track activity.

### Reporting

Inspection reports (results + photos + notes), repair recommendations and estimates, and full property activity history.

---

## Notification Workflows

### New Assignment

Staff receives email + in-app notification containing: property, assignment details, scheduled date, and a View Assignment button.

### Assignment Completion

Owner receives a completion notification when staff submits results. Assignment moves to Property History.

### Repair Estimate

Owner receives a notification to review and approve or decline a RepairItem.

### Monthly Seasonal Email *(planned)*

Auto-send monthly emails to owners: seasonal maintenance reminders, safety recommendations, weather prep suggestions, and property care best practices.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Material UI, React Query, React Hook Form, Zod, tRPC client |
| Backend | Node.js, Express, tRPC |
| Database | PostgreSQL via Prisma ORM (hosted on Railway) |
| Auth | Clerk (sessions, refresh tokens, email verification, roles) |
| Storage | Cloudflare R2 (S3-compatible, no egress fees) |
| Payments | Stripe |
| Email | Resend |
| Frontend hosting | Vercel |
| Backend hosting | Railway |

---

## UI Requirements

- Mobile-first, responsive Material UI components
- Warm, trustworthy appearance — soft card layouts, rounded icons, large spacing
- Evergreen primary buttons, Cabin Gold accents
- Dark mode support with light/dark theme switcher
- Offline-friendly inspection forms where possible

---

## Development Standards

- TypeScript throughout
- tRPC for type-safe API (no REST boilerplate)
- Prisma migrations for all schema changes
- Role-based authorization via Clerk
- Input validation with Zod
- Reusable component architecture and modular service layer
- Comprehensive error handling
- Audit logging for critical actions
- Production-ready code only — no placeholders or TODOs

---

## Folder Structure

```
Cabin Care/
  01 Daily Logs/         Session handoff notes
  screenshots/           Brand assets (logo-light.png, logo-dark.png, favicon.png)
  client/                Vite + React frontend (deploys to Vercel)
    public/images/       Logo and favicon served statically (logo-light.png, logo-dark.png, favicon.png)
    src/
      components/        Reusable UI components (properties/, orders/)
      contexts/          ColorModeContext.tsx (dark mode, localStorage persistence)
      layouts/           CustomerLayout (sidebar + appbar)
      lib/               theme.ts (createAppTheme), shared utilities
      pages/             DashboardPage, PropertiesPage, BookingsPage,
                         NewBookingPage, HistoryPage
      trpc/              tRPC client setup with Clerk auth token
      utils/
  server/                Express + tRPC backend (deploys to Railway)
    prisma/              schema.prisma, migrations/, seed.ts
    src/
      lib/               context.ts (Clerk auth), prisma.ts, trpc.ts, getDbUser.ts
      middleware/        clerkWebhook.ts
      routers/           index.ts, users, properties, checklists, bookings, assignments
      services/
  CLAUDE.md              Project context and standards
  package.json           Monorepo root (npm workspaces)
```

---

## Deferred Tasks

- **Clerk production instance** — Create a Clerk production instance when going live. Add the Vercel domain to Allowed Origins. Update `VITE_CLERK_PUBLISHABLE_KEY` (Vercel) and `CLERK_SECRET_KEY` + `CLERK_WEBHOOK_SECRET` (Railway) with production keys.
- **Admin MFA enforcement** — Require MFA (authenticator app) for `admin` role accounts via Clerk before going live. Not yet configured.
- **Naming refactor** — ✅ Complete. `Order` → `Booking`, `Job` → `Assignment` across schema, routers, pages, and components.
- **Subscription billing (Stripe)** — Property owners pay a monthly subscription for platform access. The first property owner account is exempt from the subscription requirement (used for testing). Implement in the final phase: Stripe subscription creation, webhook handling for payment events, and gating access based on subscription status. The existing `PaymentStatus` enum may need to be revised or replaced to support this model.
- **WorkOrder UI** — ✅ Complete. Admin creates work orders from approved repairs, assigns repair_tech, tech updates status.
- **RepairItem UI** — ✅ Complete. Staff flags repairs on assignments; owner reviews and approves/declines.
- **Monthly seasonal email** — ✅ Complete. POST `/api/cron/seasonal-email` (protected by `CRON_SECRET` header) sends branded seasonal tips to all active property owners via Resend. Static templates for Spring/Summer/Fall/Winter. Schedule via Railway cron: `0 9 1 * *` (1st of each month, 09:00 UTC). Requires `RESEND_API_KEY`, `CRON_SECRET`, and `APP_URL` in Railway environment variables.
- **Staff invitation flow** — ✅ Complete. Admin invites staff by email + role via Clerk's invitation API (publicMetadata carries the role). Webhook reads the role on user.created. StaffPage shows active/inactive staff with activate/deactivate controls.
- **Add Property UI** — ✅ Complete. PropertiesPage has Add/Edit dialog (PropertyForm) with propertyName, address, accessInstructions, lockboxCode, notes, wired to `properties.create`/`update`/`delete`.

---

# Cabin Care - Authentication (Clerk)

**Status:** Core auth + invitations are live (originally planned as Phases 1 & 3). Org-based onboarding (Phase 2) and the MFA/security dashboard (Phase 4) were never built — the simpler model below is what's actually running and fits current scale. Org-based onboarding has been moved to Future Enhancements.

## Goal

Use Clerk as the authentication and user management platform for Cabin Care to eliminate custom development of:

* Authentication
* Session management
* Password resets
* User invitations
* User profile management

---

## Authentication Strategy (live)

### Enabled

* Email + Password
* Email Verification
* Email OTP (Passwordless Login)
* Google OAuth

### Disabled (Future Releases)

* SMS Login
* Passkeys
* Enterprise SSO
* Social Providers Beyond Google

---

## User Roles (live)

```typescript
type Role = "customer" | "staff" | "admin" | "repair_tech"
```

This is the Prisma `Role` enum (`server/prisma/schema.prisma`) — single source of truth, matches the Architecture Overview roles table above.

Role is set via Clerk `publicMetadata.role` at invite time, then synced to the `User.role` column by the `user.created` webhook (`server/src/middleware/clerkWebhook.ts`). Defaults to `customer` if no role metadata is present.

---

## Invitation-Based User Management (live)

Admins can invite:

* Property Owners (`customer`) — via Customers page
* Inspectors (`staff`) — via Staff page
* Repair Techs (`repair_tech`) — via Staff page

Workflow (implemented via `staff.invite` mutation):

```text
Admin Invites User (email + role)
↓
Clerk sends email invitation (publicMetadata.role set)
↓
User creates account
↓
Webhook (user.created) reads role, creates User row
↓
Access granted per role
```

Benefits:

* No manual user creation
* Faster onboarding
* Cleaner permissions management

---

## Route Protection (live)

`client/src/App.tsx` wraps all routes: `<SignedIn>` renders the route tree inside `CustomerLayout`, `<SignedOut>` renders `<RedirectToSignIn />` (Clerk's hosted sign-in). Role-based UI visibility (which nav items/pages a user sees) is handled per-role in `CustomerLayout` (`NAV_BY_ROLE`); server-side authorization is enforced per-procedure in the tRPC routers via `requireDbUser` + role checks.

---

## Role-Based Access (live)

### customer (Property Owner)

* Properties
* Bookings
* Repair approvals
* History/reports

### staff (Inspector)

* My Assignments
* Checklists
* Photo uploads
* Flag repair items

### repair_tech

* My Work Orders
* Update work order status
* Completion photos

### admin

* Work Orders (create/assign)
* Staff management
* Customers (property owners) management
* Full platform access

---

## User Profile Fields

### Clerk Profile (live)

```typescript
{
  firstName,
  lastName,
  email,
  phone,
  role  // via publicMetadata
}
```

### Cabin Care Profile (not yet implemented)

Planned extension fields — not yet in the `User` model:

```typescript
{
  companyName,
  vendorLicense,
  serviceArea,
  certifications,
  emergencyContact
}
```

Use Clerk's profile management UI whenever possible.

---

## Security

### All Users (live, via Clerk defaults)

* Verified email required
* Secure sessions
* Device tracking

### Admin Accounts (pre-launch checklist — not yet configured)

Require before going live:

* MFA
* Authenticator app
* Backup codes

See "Admin MFA enforcement" in Deferred Tasks.

---

## Database Design (live)

Clerk remains the source of truth for authentication. App DB mirrors the minimum needed for app logic:

```text
users
├─ clerkId   (unique, links to Clerk)
├─ role      (customer | staff | admin | repair_tech)
├─ status    (active | inactive | suspended)
```

Properties, bookings, assignments, etc. reference `User.id` directly — no `organizationId` (single-tenant).

Never store passwords locally.

---

## Future Enhancements (not currently planned — revisit if/when needed)

### Multi-Tenant Organizations + Onboarding Wizard

If Cabin Care ever needs to support multiple management companies (each managing their own set of cabins), revisit the original Phase 2 plan:

* Add an `organizations` table; scope properties/users to an org
* Onboarding wizard: Sign Up → Verify Email → Select Account Type → Create Organization → Create First Property → Invite Team
* Expand roles to `OWNER` / `PROPERTY_MANAGER` per-org if needed

Not needed at current scale (single company managing all cabins).

### Passkeys

Ideal for:

* Inspectors
* Repair Techs
* Internal Staff

### Enterprise SSO

Support:

* Microsoft Entra ID
* Google Workspace

For larger management companies and resorts — only relevant alongside multi-tenant organizations above.

---

## Implementation Status

### Phase 1 - Core Authentication — ✅ Complete

* Clerk installed, middleware configured
* Protected routes (`SignedIn`/`SignedOut` in `App.tsx`)
* Sign In / Sign Up (Clerk hosted UI)
* Google OAuth, Email Verification

### Phase 2 - Roles & Onboarding — Superseded

* Simple role model (`customer/staff/admin/repair_tech`) implemented directly via Prisma enum + webhook — no onboarding wizard or organizations needed
* Org-based onboarding wizard moved to Future Enhancements

### Phase 3 - Invitations — ✅ Complete

* Admin-driven invitations for property owners, inspectors, repair techs via `staff.invite`
* Automatic role assignment via `publicMetadata.role` + webhook

### Phase 4 - Security — Pending (pre-launch)

* Admin MFA — not yet configured (see Deferred Tasks)
* Session auditing / user management dashboard — not built, no current need beyond StaffPage/CustomersPage active/inactive controls

---

## Outcome (achieved)

* Secure authentication (Clerk-managed)
* Google login + passwordless login
* Role-based permissions (4 roles)
* Invitation-driven user creation
* Reduced authentication maintenance vs. custom build
