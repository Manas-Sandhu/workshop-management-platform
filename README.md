<div align="center">

<img src="./client/public/favicon.png" alt="WORKSHOP Logo" width="96" height="96" />

# WORKSHOP.

### Curated Workshop Discovery, Capacity-Safe Registration & Community Operations Platform

A full-stack, production-grade SaaS platform engineered for brands, educators, and communities to publish interactive workshops, enforce concurrency-safe seat limits, automate transactional confirmations, and onboard participants directly into session-specific WhatsApp communities.

[![Live Application](https://img.shields.io/badge/Live_Platform-workshop--client--delta.vercel.app-142933?style=for-the-badge&logo=vercel&logoColor=CBA765)](https://workshop-client-delta.vercel.app/)
[![Backend API Health](https://img.shields.io/badge/API_Health-workshop--server.vercel.app-25D366?style=for-the-badge&logo=express&logoColor=white)](https://workshop-server.vercel.app/health)

[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.3-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-7.10-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Zod](https://img.shields.io/badge/Zod-4.6-3E67B1?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)
[![Resend](https://img.shields.io/badge/Resend-Transactional_Email-000000?style=flat-square&logo=resend&logoColor=white)](https://resend.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-CBA765?style=flat-square)](./server/package.json)

<br />

[**Explore Live Demo**](https://workshop-client-delta.vercel.app/) · [**System Architecture**](#9-system-architecture) · [**API Reference**](#12-api-documentation) · [**Database Design**](#11-database-design) · [**Deployment Guide**](#16-deployment-guide)

</div>

---

## 2. Table of Contents

1. [Project Header](#workshop)
2. [Table of Contents](#2-table-of-contents)
3. [Project Overview](#3-project-overview)
4. [Problem Statement](#4-problem-statement)
5. [Our Solution](#5-our-solution)
6. [Complete Features](#6-complete-features)
7. [User Roles and Permissions](#7-user-roles-and-permissions)
8. [Complete Application Workflow](#8-complete-application-workflow)
9. [System Architecture](#9-system-architecture)
10. [Technology Stack](#10-technology-stack)
11. [Database Design](#11-database-design)
12. [API Documentation](#12-api-documentation)
13. [Folder Structure](#13-folder-structure)
14. [Installation and Local Setup](#14-installation-and-local-setup)
15. [Environment Variables](#15-environment-variables)
16. [Deployment Guide](#16-deployment-guide)
17. [Security and Reliability](#17-security-and-reliability)
18. [UI/UX and Design](#18-uiux-and-design)
19. [Future Scope](#19-future-scope)
20. [Contributing Guidelines](#20-contributing-guidelines)
21. [Troubleshooting](#21-troubleshooting)
22. [License and Acknowledgements](#22-license-and-acknowledgements)

---

## 3. Project Overview

**WORKSHOP.** is a full-stack workshop discovery, registration, and administration platform built for organizations, creator-led communities, and educational brands that host live interactive sessions.

The platform operates through two strictly isolated portals backed by a unified PostgreSQL data layer:

1. **Participant Portal (`/`, `/workshops`, `/my-workshops`, `/profile`)**: Enables learners to browse upcoming published workshops, search and sort sessions in real time, reserve seats with instant capacity verification, receive automated email confirmations via **Resend**, and join the cohort's dedicated **WhatsApp group** immediately after booking.
2. **Administration Portal (`/admin/login`, `/admin/workshops`, `/admin/workshops/:workshopId/registrations`)**: Provides authorized administrators with a dedicated control center to create and edit workshops, enforce participant capacity constraints, cancel or republish sessions, and search or audit per-workshop participant directories.

### Intended Users
- **Learners & Community Members (`USER` role)**: Individuals looking to discover upcoming workshops, track their registered sessions across upcoming/past/cancelled states, and access session communication channels.
- **Program Managers & Brand Administrators (`ADMIN` role)**: Operations teams responsible for scheduling sessions, managing seat inventory, monitoring registration velocity, and contacting attendees.

---

## 4. Problem Statement

Organizing recurring live workshops using generic form builders or spreadsheets introduces critical operational failure modes:

1. **Race Conditions & Overbooking**: Standard form tools check seat availability in application memory without database row locking. When multiple users submit registrations simultaneously for the last remaining seats, capacity limits are breached.
2. **Fragmented Post-Registration Handoff**: After a participant registers, organizers manually email confirmation details and WhatsApp invite links. Delays or公开-shared invite links lead to unauthorized group access or missed sessions.
3. **Duplicate Bookings & Stale Discovery Lists**: Users frequently lose track of which sessions they have already joined, cluttering discovery feeds with already-booked events or creating duplicate registration records.
4. **Unsafe Capacity Modifications**: When administrators edit an active workshop's capacity without transactional checks against existing registrations, seat counts become negative or inconsistent.
5. **Cross-Origin Session Fragility**: Deploying decoupled React frontends and Express backends across separate domains causes modern browsers to block third-party `SameSite` authentication cookies, breaking persistent login sessions.

---

## 5. Our Solution

**WORKSHOP.** solves these challenges directly at the database, API, and infrastructure layers:

- **Pessimistic Row-Level Locking (`SELECT ... FOR UPDATE`)**: Every seat reservation, workshop update, cancellation, and republication executes inside an interactive PostgreSQL transaction (`prisma.$transaction`) that acquires a row-level exclusive lock on the target `Workshop` record before evaluating capacity or status.
- **Automated Dual-Channel Onboarding**: Immediately upon transaction commit, the backend dispatches a timezone-localized (`Asia/Kolkata` IST) confirmation email via **Resend** and returns the workshop's protected `whatsappLink` to the confirmation view and the user's **My Workshops** dashboard.
- **Context-Aware Discovery Feed**: The public `GET /api/v1/workshops` endpoint runs `optionalAuthenticateUser` middleware. Guests see all upcoming published workshops, while authenticated users automatically have workshops they've already registered for filtered out of their discovery grid.
- **Isolated Dual-Cookie Token Architecture**: User sessions (`sessionToken`) and Administrator sessions (`adminSessionToken`) use separate `HttpOnly`, `Secure`, `SameSite=Lax` cookies backed by SHA-256 hashed tokens in the `RefreshToken` table, allowing both portals to operate independently without session collision.
- **Same-Origin Proxy Deployment**: Both local development (Vite proxy) and production (Vercel edge rewrites) route `/api/*` requests from the frontend origin to the backend `/api/v1/*` endpoints, guaranteeing first-party cookie transmission with zero third-party cookie drops.

---

## 6. Complete Features

Every feature below is verified directly against the production source code.

### 6.1 Dual-Portal Authentication & Session Persistence
- **What it does**: Provides separate registration, login, session restoration, and logout flows for regular participants (`USER`) and administrators (`ADMIN`).
- **How it works**:
  - Passwords are hashed with `bcrypt` using `12` salt rounds (`SALT_ROUNDS = 12`).
  - On login, the server generates a 32-byte cryptographically random hex token (`crypto.randomBytes(32).toString("hex")`), stores only its SHA-256 digest (`tokenHash`) in the `RefreshToken` table with a 7-day expiry (`SESSION_DURATION_DAYS = 7`), and sets the raw token in an `HttpOnly` cookie (`sessionToken` for users, `adminSessionToken` for admins).
  - On page load, `AuthContext` (`GET /api/v1/auth/me`) and `AdminAuthContext` (`GET /api/v1/admin/me`) automatically restore active sessions. Expired tokens are deleted from PostgreSQL and cleared from the browser cookie store.
- **Who uses it**: Participants (`/register`, `/login`) and Administrators (`/admin/login`).
- **Technical implementation**:
  - Backend: `server/src/controllers/auth.controller.js`, `server/src/controllers/admin.controller.js`, `server/src/services/auth.service.js`, `server/src/services/admin.service.js`, `server/src/middleware/auth.middleware.js`, `server/src/middleware/admin.middleware.js`.
  - Frontend: `client/src/context/AuthContext.jsx`, `client/src/context/AdminAuthContext.jsx`, `client/src/pages/user/LoginPage.jsx`, `client/src/pages/user/RegisterPage.jsx`, `client/src/pages/admin/AdminLoginPage.jsx`.
- **System connection**: Supplies `req.user` and `req.admin` to downstream controllers and drives route guards (`ProtectedRoute.jsx` and `AdminProtectedRoute.jsx`), preserving the user's intended destination via React Router `location.state.from`.

### 6.2 Workshop Discovery, Debounced Search & Personalized Filtering
- **What it does**: Displays a paginated grid (6 cards per page) of upcoming `PUBLISHED` workshops with real-time seat counters, debounced keyword search, and chronological sorting.
- **How it works**:
  - Queries workshops where `status = 'PUBLISHED'` and `dateTime >= new Date()`.
  - If the requester has a valid `sessionToken` cookie, `optionalAuthenticateUser` attaches `req.user`, and `workshop.service.js` appends `registrations: { none: { userId } }` so users only see workshops they haven't booked yet.
  - Typing in the search bar triggers a `350ms` debounce timer in `WorkshopsPage.jsx`, querying case-insensitive matches across both `title` and `description`.
  - Supports sorting by **Earliest first** (`sort=soonest` → `dateTime: 'asc'`) and **Furthest first** (`sort=latest` → `dateTime: 'desc'`).
- **Who uses it**: All visitors (guests and logged-in participants) on `/workshops`.
- **Technical implementation**:
  - Backend: `getPublishedWorkshops` in `server/src/controllers/workshop.controller.js` and `server/src/services/workshop.service.js`.
  - Frontend: `client/src/pages/user/WorkshopsPage.jsx` and `client/src/services/workshopService.js` (includes a 60-second in-memory `workshopCache` and `pendingRequests` map to deduplicate concurrent identical fetches, scoped by `user?.id || "guest"`).

### 6.3 Concurrency-Safe Workshop Registration
- **What it does**: Allows authenticated users to inspect a specific workshop's schedule and remaining seat count and submit their attendee details (`fullName`, `email`, `mobileNumber`) to reserve a spot.
- **How it works**:
  1. Navigating to `/workshops/register?workshopId=<uuid>` fetches live workshop metadata via `GET /api/v1/workshops/:workshopId` (requiring `status = 'PUBLISHED'` and `dateTime > now()`).
  2. Submitting the form sends `POST /api/v1/workshops/register`, validated by `registerForWorkshopSchema` (Zod).
  3. Inside `prisma.$transaction`, the backend executes `SELECT "id" FROM "Workshop" WHERE "id" = ${workshopId} FOR UPDATE` to serialize concurrent booking attempts.
  4. Verifies workshop existence, `PUBLISHED` status, future `dateTime`, absence of existing registration (`userId_workshopId` composite unique index), and `registrationCount < workshop.capacity`.
  5. Inserts the `Registration` record and invalidates client-side workshop and registration caches (`clearPublishedWorkshopsCache()` and `clearMyRegistrationsCache()`).
- **Who uses it**: Authenticated participants (`USER`).
- **Technical implementation**: `server/src/services/registration.service.js`, `server/src/validators/registration.validator.js`, `client/src/pages/user/WorkshopRegistrationPage.jsx`.

### 6.4 Transactional Email Confirmation & WhatsApp Community Handoff
- **What it does**: Sends an automated registration confirmation email and provides one-click access to the workshop's WhatsApp group.
- **How it works**:
  - Once the database transaction in `registerForWorkshop` commits, `sendWorkshopConfirmationEmail` formats the workshop date in Indian Standard Time (`en-IN`, `timeZone: "Asia/Kolkata"`) and dispatches a plain-text confirmation email via the **Resend** API containing the attendee's name, workshop title, formatted date/time, and unique Registration ID.
  - Email delivery is wrapped in an isolated `try/catch` block after transaction commit so transient third-party email failures never roll back a completed seat reservation.
  - The API response returns `whatsappLink`, rendering a direct **"Join the workshop WhatsApp group"** CTA on the confirmation screen.
- **Who uses it**: Triggered automatically for participants upon registration.
- **Technical implementation**: `server/src/services/email.service.js` and `server/src/services/registration.service.js`.

### 6.5 "My Workshops" Participant Dashboard
- **What it does**: Centralizes all workshop registrations belonging to the logged-in user with status categorization, registration metadata, and persistent WhatsApp group access.
- **How it works**:
  - Fetches paginated registrations (`GET /api/v1/workshops/my-registrations`) ordered by `registeredAt: 'desc'`, cached per user (`${userId}:${page}:${limit}`) for 60 seconds with a manual **Refresh** button that busts the cache.
  - Provides client-side filter tabs:
    - **All**: Every registration on the current page.
    - **Upcoming**: `new Date(workshop.dateTime) > new Date()` AND `workshop.status !== "CANCELLED"`.
    - **Past**: `new Date(workshop.dateTime) <= new Date()`.
    - **Cancelled**: `workshop.status === "CANCELLED"`.
  - Computes a contextual `StatusBadge` (**Confirmed** in green, **Completed** in stone, **Cancelled** in red) and renders the **Join Group** WhatsApp button exclusively when `upcoming && workshop.status !== "CANCELLED" && workshop.whatsappLink`.
- **Who uses it**: Authenticated participants on `/my-workshops`.
- **Technical implementation**: `client/src/pages/user/MyWorkshopsPage.jsx`, `client/src/services/registrationService.js`, `server/src/services/registration.service.js`.

### 6.6 User Profile & Journey Analytics
- **What it does**: Displays the member's profile header, auto-generated initials avatar, membership details (`User ID`, `Account Created`, `Account Role`, `Account Status`), lifetime workshop statistics, and an inline name editor.
- **How it works**:
  - Iteratively fetches all pages of the user's registrations on mount to calculate accurate lifetime totals across three KPI cards: **Total Registrations**, **Upcoming Workshops** (non-cancelled future sessions), and **Completed Workshops** (non-cancelled past sessions).
  - Clicking **Edit Profile** toggles an inline form that sends `PATCH /api/v1/auth/profile` (`updateProfileSchema`: 2–100 characters) and updates `AuthContext` state in place without requiring a page reload.
- **Who uses it**: Authenticated participants on `/profile`.
- **Technical implementation**: `client/src/pages/user/ProfilePage.jsx`, `server/src/controllers/auth.controller.js` (`updateProfile`), `server/src/services/auth.service.js` (`updateUserProfile`).

### 6.7 Admin Workshop Control Centre
- **What it does**: Full lifecycle management for workshops—creating new sessions, editing details, cancelling sessions, republishing cancelled sessions, and monitoring aggregate KPIs.
- **How it works**:
  - **KPI Summary Strip**: Computes live counts for *Total workshops*, *Published*, *Cancelled*, and *Total registrations* across all workshops.
  - **Create & Edit Drawer (`WorkshopForm`)**: Validates future date/time, positive integer capacity, and valid WhatsApp URL.
  - **Transactional Update Protection**: `updateWorkshop` locks the workshop row (`FOR UPDATE`) and rejects capacity reductions below the current number of registered participants (`workshopData.capacity < existingWorkshop._count.registrations` → `400 Bad Request`).
  - **Status Transitions**: `cancelWorkshop` (`PATCH /api/v1/admin/workshops/:id/cancel`) and `publishWorkshop` (`PATCH /api/v1/admin/workshops/:id/publish`) lock the row and enforce business rules (cannot cancel an already cancelled workshop; cannot republish a workshop whose `dateTime` has already passed).
  - **Server-Side Caching**: `GET /api/v1/admin/workshops` caches formatted workshop lists in memory (`server/src/utils/cache.js`) under key `"admin:workshops"` for 30 seconds; every create, update, cancel, or publish operation immediately calls `clearCache("admin:workshops")`.
  - **Instant Client Filtering & Sorting**: Filter by status (`ALL`, `PUBLISHED`, `CANCELLED`), search by title, and sort by *Date: earliest first*, *Date: latest first*, *Most registrations*, or *Title: A–Z*.
- **Who uses it**: Authenticated administrators on `/admin/workshops`.
- **Technical implementation**: `client/src/pages/admin/AdminWorkshopsPage.jsx`, `server/src/services/workshop.service.js`, `server/src/services/admin-registration.service.js`.

### 6.8 Admin Participant Directory & Registration Auditing
- **What it does**: Displays workshop-specific capacity metrics and a searchable, paginated table of registered participants with direct `mailto:` and `tel:` contact links.
- **How it works**:
  - `GET /api/v1/admin/workshops/:workshopId/registrations` validates the `workshopId` UUID parameter and query parameters (`page`, `limit`, `search`), returning both the parent workshop's seat summary (`registrationCount`, `availableSeats`, `capacity`) and the paginated participant list.
  - Searching filters participants case-insensitively across `fullName`, `email`, and `mobileNumber`.
  - Also exposes a global `GET /api/v1/admin/registrations` endpoint supporting cross-workshop filtering (`workshopId`), multi-field search (`fullName`, `email`, `mobileNumber`, `workshop.title`), and sorting (`registeredAt`, `fullName`, `email` in `asc`/`desc` order).
- **Who uses it**: Authenticated administrators on `/admin/workshops/:workshopId/registrations`.
- **Technical implementation**: `client/src/pages/admin/WorkshopRegistrationsPage.jsx`, `server/src/controllers/admin-registration.controller.js`, `server/src/services/admin-registration.service.js`, `server/src/validators/admin-registration.validator.js`.

---

## 7. User Roles and Permissions

The database schema defines two explicit roles in the `Role` enum (`USER` and `ADMIN`), plus unauthenticated guest access.

| Capability / Endpoint | Guest (Unauthenticated) | Participant (`Role.USER`) | Administrator (`Role.ADMIN`) |
| :--- | :---: | :---: | :---: |
| View Landing Page (`/`) | ✅ | ✅ | ✅ |
| Browse & Search Upcoming Workshops (`GET /api/v1/workshops`) | ✅ *(sees all published)* | ✅ *(auto-excludes already booked)* | ✅ |
| View Single Workshop Details (`GET /api/v1/workshops/:workshopId`) | ✅ | ✅ | ✅ |
| Register User Account (`POST /api/v1/auth/register`) | ✅ | ✅ | ✅ |
| Log into User Portal (`POST /api/v1/auth/login`) | ✅ | ✅ | ❌ *(401 rejected if role !== USER)* |
| Book a Workshop Seat (`POST /api/v1/workshops/register`) | ❌ *(Redirected to `/login`)* | ✅ | ❌ *(403 rejected by `authenticateUser`)* |
| View "My Workshops" (`GET /api/v1/workshops/my-registrations`) | ❌ *(Prompted to log in)* | ✅ | ❌ |
| View & Edit User Profile (`PATCH /api/v1/auth/profile`) | ❌ | ✅ | ❌ |
| Log into Admin Portal (`POST /api/v1/admin/login`) | ❌ | ❌ *(401 rejected if role !== ADMIN)* | ✅ |
| Create / Edit / Cancel / Publish Workshops (`/api/v1/admin/workshops/*`) | ❌ | ❌ | ✅ |
| View & Search Participant Directories (`/api/v1/admin/registrations`) | ❌ | ❌ | ✅ |

> [!IMPORTANT]
> **Strict Role Isolation**: A user with `Role.ADMIN` cannot log into the user portal (`auth.service.js` enforces `user.role === "USER"`), and a user with `Role.USER` cannot log into the admin portal (`admin.service.js` enforces `admin.role === "ADMIN"`). Because the two portals use separate cookie names (`sessionToken` vs `adminSessionToken`) and separate React contexts (`AuthProvider` vs `AdminAuthProvider`), an operator can test both portals simultaneously in the same browser window without session interference.

---

## 8. Complete Application Workflow

### 8.1 End-to-End Participant Journey (Onboarding → Discovery → Booking → Community Handoff)

1. **Landing & Discovery**: A visitor opens `/` (`HomePage.jsx`) and clicks **Explore Workshops** to reach `/workshops` (`WorkshopsPage.jsx`).
2. **Search & Selection**: The visitor searches or sorts upcoming workshops and clicks **Register Now** on an available session (`/workshops/register?workshopId=<uuid>`).
3. **Authentication Gate**: `ProtectedRoute.jsx` checks `useAuth()`. If unauthenticated, the visitor is redirected to `/login` with `location.state.from` preserving the exact `/workshops/register?workshopId=<uuid>` URL.
4. **Account Creation & Login**: New users click **Create one** (`/register`), submit their name, email, and password (`>= 8` chars), and are redirected back to `/login` with `location.state.from` intact. Upon signing in, `LoginPage.jsx` sets the `sessionToken` cookie and redirects the user straight back to their selected workshop registration form.
5. **Seat Reservation**: The user enters their `fullName`, `email`, and `mobileNumber` (`10–15` digits) and clicks **Confirm Registration**.
6. **Transactional Lock & Confirmation**: The backend locks the workshop row, verifies capacity, records the registration, sends a Resend confirmation email, and returns the workshop's `whatsappLink`.
7. **Community Handoff & Tracking**: The user clicks **Join the workshop WhatsApp group** on the confirmation screen, or accesses it anytime later under `/my-workshops`.

```mermaid
sequenceDiagram
    autonumber
    actor User as Participant
    participant SPA as React SPA (Client)
    participant API as Express API (Server)
    participant DB as Neon PostgreSQL
    participant Resend as Resend Email API

    User->>SPA: Click "Register Now" on Workshop Card
    SPA->>SPA: ProtectedRoute checks AuthContext
    alt Not Authenticated
        SPA-->>User: Redirect to /login (preserving state.from)
        User->>SPA: Submit email & password
        SPA->>API: POST /api/v1/auth/login
        API->>DB: Verify bcrypt hash & insert SHA-256 RefreshToken
        API-->>SPA: 200 OK + Set-Cookie: sessionToken (HttpOnly, Secure)
        SPA-->>User: Redirect back to /workshops/register?workshopId=...
    end
    SPA->>API: GET /api/v1/workshops/:workshopId
    API->>DB: Fetch published future workshop + _count.registrations
    API-->>SPA: 200 OK (title, dateTime, availableSeats)
    User->>SPA: Submit fullName, email, mobileNumber
    SPA->>API: POST /api/v1/workshops/register
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT "id" FROM "Workshop" WHERE "id" = $1 FOR UPDATE
    API->>DB: Check status=PUBLISHED, dateTime>now(), unique(userId,workshopId), count < capacity
    API->>DB: INSERT INTO "Registration" (...)
    API->>DB: COMMIT TRANSACTION
    API->>Resend: sendWorkshopConfirmationEmail (non-blocking)
    Resend-->>User: Deliver IST-formatted Confirmation Email
    API-->>SPA: 201 Created (registration, whatsappLink, availableSeats)
    SPA-->>User: Render Confirmation Screen + "Join WhatsApp Group" CTA
```

### 8.2 Administrator Lifecycle Workflow

```mermaid
flowchart TD
    A["Admin opens /admin/login"] --> B["POST /api/v1/admin/login"]
    B --> C{"Role === ADMIN & Password Valid?"}
    C -- No --> D["401 Unauthorized Error Alert"]
    C -- Yes --> E["Set-Cookie: adminSessionToken (HttpOnly)"]
    E --> F["Redirect to /admin/workshops"]
    F --> G["GET /api/v1/admin/workshops (30s Server Cache)"]
    G --> H{"Admin Action"}
    H -- "Create Workshop" --> I["POST /api/v1/admin/workshops"]
    H -- "Edit Workshop" --> J["PATCH /api/v1/admin/workshops/:id (FOR UPDATE lock + capacity >= registered check)"]
    H -- "Cancel Workshop" --> K["PATCH /api/v1/admin/workshops/:id/cancel (FOR UPDATE lock -> status=CANCELLED)"]
    H -- "Republish Workshop" --> L["PATCH /api/v1/admin/workshops/:id/publish (FOR UPDATE lock + future date check)"]
    H -- "View Participants" --> M["Navigate to /admin/workshops/:workshopId/registrations"]
    I & J & K & L --> N["clearCache('admin:workshops') & Refresh Dashboard"]
    M --> O["GET /api/v1/admin/workshops/:workshopId/registrations (Search & Paginate)"]
```

---

## 9. System Architecture

### Architectural Layers
1. **Presentation & State Layer (`client/`)**: A React 19 Single-Page Application bundled with Vite 8 and styled with Tailwind CSS 4. Routing is managed by React Router v7 (`BrowserRouter`). Global authentication state is split into `AuthContext` (mounted globally) and `AdminAuthContext` (mounted exclusively under `/admin/*`).
2. **Edge Proxy & Routing Layer (`client/vercel.json` / `client/vite.config.js`)**: All frontend network calls use a relative `/api` base URL (`client/src/services/api.js`). In production on Vercel, `vercel.json` rewrites `/api/:path*` to `https://workshop-server.vercel.app/api/v1/:path*`. In local development, Vite's dev server proxies `/api` to `http://localhost:5001/api/v1`. This eliminates cross-origin cookie blocking.
3. **API & Business Logic Layer (`server/src/`)**: A modular Express 5 application following a strict `Routes → Middleware (Auth / Zod Validation) → Controllers → Services → Prisma Data Access` pipeline.
4. **Database & Concurrency Layer (`server/prisma/` & Neon PostgreSQL)**: Prisma 7 Client connected via `@prisma/adapter-pg` to Neon's PgBouncer connection pooler (`DATABASE_URL`) at runtime, while schema migrations use Neon's direct compute endpoint (`DIRECT_URL`) configured in `prisma.config.ts`.
5. **External Integrations**: **Resend** (`resend` SDK) for transactional email delivery and **WhatsApp** group invite links for community onboarding.

```mermaid
flowchart TB
    subgraph Client["Frontend Layer (Vercel Edge / React 19 + Vite 8)"]
        UI["User & Admin Pages<br/>(Tailwind CSS v4)"]
        Ctx["AuthContext & AdminAuthContext"]
        Svc["Service Layer + 60s In-Memory Cache<br/>(workshopService / registrationService)"]
        ApiFetch["apiFetch('/api/...')<br/>credentials: 'include'"]
        UI --> Ctx & Svc
        Svc --> ApiFetch
    end

    subgraph Proxy["Same-Origin Rewrite Layer"]
        VProxy["Vercel Rewrite / Vite Proxy<br/>/api/:path* ➔ /api/v1/:path*"]
    end

    subgraph Server["Backend Layer (Express 5 Serverless / Node.js)"]
        MW["Middleware Pipeline<br/>trust proxy · CORS · cookieParser · Zod validateRequest"]
        AuthMW["Auth Guards<br/>authenticateUser · optionalAuthenticateUser · authenticateAdmin"]
        Ctrl["Controllers<br/>auth · admin · workshop · registration · admin-registration"]
        Biz["Services + 30s Admin Cache<br/>Pessimistic Locking (SELECT ... FOR UPDATE)"]
        Prisma["Prisma 7 Client<br/>(@prisma/adapter-pg)"]
        MW --> AuthMW --> Ctrl --> Biz --> Prisma
    end

    subgraph Data["Database & External Services"]
        NeonPool[("Neon PostgreSQL<br/>Pooled Connection (-pooler)")]
        NeonDirect[("Neon PostgreSQL<br/>Direct Connection (Migrations)")]
        ResendAPI["Resend API<br/>(Confirmation Emails)"]
    end

    ApiFetch --> VProxy --> MW
    Prisma -->|DATABASE_URL| NeonPool
    Biz -->|RESEND_API_KEY| ResendAPI
    NeonDirect -.->|DIRECT_URL via prisma.config.ts| Prisma
```

---

## 10. Technology Stack

| Layer | Technology | Version | Purpose & Why It Was Chosen |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | **React** (`react`, `react-dom`) | `^19.3.1` | Component architecture, hooks-based state management (`useState`, `useEffect`, `useMemo`, `useCallback`), and context providers. |
| **Build Tool** | **Vite** (`vite`, `@vitejs/plugin-react`) | `^8.3.6` | Sub-second HMR in development, optimized production asset bundling, and local `/api` reverse proxy configuration. |
| **Routing** | **React Router** (`react-router-dom`) | `^7.18.5` | Client-side SPA routing (`BrowserRouter`), nested layouts (`PublicLayout`, `AdminLayout`), and protected route redirection. |
| **Styling** | **Tailwind CSS** (`tailwindcss`, `@tailwindcss/vite`) | `^4.3.5` | Utility-first styling with CSS-first `@theme` design tokens (`navy`, `gold`, `cream`, `offwhite`, `DM Sans`, `Manrope`). |
| **Icons** | **Lucide React** (`lucide-react`) | `^1.72.0` | Consistent, tree-shakeable vector iconography across cards, forms, navigation, and dashboards. |
| **Backend Runtime** | **Node.js & Express** (`express`) | `^5.3.0` | Fast, lightweight HTTP server and serverless function handler with native promise error forwarding in Express 5. |
| **ORM & Database Driver** | **Prisma 7 & PG Adapter** (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`) | `^7.10.1` / `^8.23.1` | Type-safe queries, interactive transactions (`$transaction`), raw row-level locking (`$queryRaw`), and pooled PostgreSQL driver adaptation. |
| **Database** | **Neon Serverless PostgreSQL** | PostgreSQL 16 | Cloud-native relational storage with built-in PgBouncer connection pooling (`-pooler`) for serverless scale. |
| **Validation** | **Zod** (`zod`) | `^4.6.7` | Strict runtime schema validation and sanitization for `req.body`, `req.query`, and `req.params`. |
| **Authentication & Crypto** | **bcrypt, cookie-parser & Node `crypto`** | `^6.0.0` / `^1.4.7` | `bcrypt` (12 rounds) for password hashing; native `crypto` for 256-bit random session tokens and SHA-256 database token hashing. |
| **Email Service** | **Resend** (`resend`) | `^6.38.0` | Developer-friendly transactional email API used to send IST-formatted registration confirmations. |
| **CORS & Env** | **cors & dotenv** | `^2.8.6` / `^18.0.10` | Strict origin allowlisting with credentials support and local `.env` configuration loading. |
| **Deployment** | **Vercel** (Frontend & Serverless Backend) / **Render** | Production | Edge static hosting with SPA fallback, `/api` rewrite proxying, and serverless Node.js execution. |

> [!NOTE]
> **Auxiliary Dependencies in `server/package.json`**: `express-session`, `connect-pg-simple`, and `jsonwebtoken` are present in `server/package.json` (and `server/src/config/session.js`), while active runtime authentication across all routes is handled by the custom SHA-256 `RefreshToken` table + `cookie-parser` middleware in `auth.middleware.js` and `admin.middleware.js`.

---

## 11. Database Design

The PostgreSQL database is managed via Prisma (`server/prisma/schema.prisma`) and consists of **4 models** and **2 enums**.

### Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Workshop : "creates (createdById)"
    User ||--o{ Registration : "books (userId)"
    User ||--o{ RefreshToken : "owns (userId)"
    Workshop ||--o{ Registration : "has (workshopId)"

    User {
        String id PK "UUID v4 (@default(uuid()))"
        String name "2-100 chars"
        String email UK "@unique, lowercase"
        String passwordHash "bcrypt (12 rounds)"
        Role role "ADMIN | USER (@default(USER))"
        DateTime createdAt "@default(now())"
    }

    Workshop {
        String id PK "UUID v4 (@default(uuid()))"
        String createdById FK "References User.id (ON DELETE RESTRICT)"
        String title "3-150 chars"
        String description "Nullable, up to 2000 chars"
        DateTime dateTime "Scheduled session timestamp"
        Int capacity "Positive integer (> 0)"
        String whatsappLink "Valid URL to WhatsApp group"
        WorkshopStatus status "PUBLISHED | CANCELLED (@default(PUBLISHED))"
        DateTime createdAt "@default(now())"
        DateTime updatedAt "@updatedAt"
    }

    Registration {
        String id PK "UUID v4 (@default(uuid()))"
        String userId FK "References User.id (ON DELETE RESTRICT)"
        String workshopId FK "References Workshop.id (ON DELETE RESTRICT)"
        String fullName "Attendee submitted name"
        String email "Attendee submitted email"
        String mobileNumber "10-15 digits (+optional)"
        DateTime registeredAt "@default(now())"
    }

    RefreshToken {
        String id PK "UUID v4 (@default(uuid()))"
        String userId FK "References User.id (ON DELETE CASCADE)"
        String tokenHash UK "@unique, SHA-256 hex digest"
        DateTime expiresAt "7 days from login"
        DateTime createdAt "@default(now())"
    }
```

### Database Constraints & Business Rules
1. **Unique Email Constraint (`User_email_key`)**: Enforces one account per normalized (trimmed, lowercase) email address.
2. **Composite Unique Registration Constraint (`@@unique([userId, workshopId])`)**: Guarantees at the database level that a user can never book the same workshop twice, acting as a hard safety net behind the application-level check.
3. **Referential Integrity (`ON DELETE RESTRICT` vs `ON DELETE CASCADE`)**:
   - `Workshop.createdById`, `Registration.userId`, and `Registration.workshopId` use `ON DELETE RESTRICT` to prevent accidental deletion of users or workshops that have historical registration records.
   - `RefreshToken.userId` uses `ON DELETE CASCADE` so deleting a user automatically purges all of their active sessions.
4. **Pessimistic Concurrency Control**: Capacity-sensitive mutations (`registerForWorkshop`, `updateWorkshop`, `cancelWorkshop`, `publishWorkshop`) acquire a PostgreSQL row lock (`SELECT "id" FROM "Workshop" WHERE "id" = $1 FOR UPDATE`) before reading registration counts or mutating status.

---

## 12. API Documentation

In production on Vercel, the frontend calls `/api/<endpoint>`, which is rewritten to `/api/v1/<endpoint>` on the backend. Only `/health` is mounted at the root path `/health`.

### Summary of Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | Lightweight liveness probe (`{"status":"ok"}`) with zero DB queries. |
| `GET` | `/api/v1/health` | None | API v1 health status message. |
| `POST` | `/api/v1/auth/register` | None | Register a new `USER` account. |
| `POST` | `/api/v1/auth/login` | None | Authenticate a `USER` and set the `sessionToken` cookie. |
| `POST` | `/api/v1/auth/logout` | Optional | Delete the `RefreshToken` record and clear `sessionToken`. |
| `GET` | `/api/v1/auth/me` | `USER` (`sessionToken`) | Fetch the currently authenticated user's profile. |
| `PATCH` | `/api/v1/auth/profile` | `USER` (`sessionToken`) | Update the logged-in user's `name`. |
| `GET` | `/api/v1/workshops` | Optional (`sessionToken`) | Paginated list of upcoming `PUBLISHED` workshops (excludes already booked if logged in). |
| `GET` | `/api/v1/workshops/:workshopId` | None | Fetch details and seat availability for one upcoming published workshop. |
| `POST` | `/api/v1/workshops/register` | `USER` (`sessionToken`) | Book a seat in a workshop, trigger Resend email, and return `whatsappLink`. |
| `GET` | `/api/v1/workshops/my-registrations` | `USER` (`sessionToken`) | Paginated list of the current user's workshop registrations. |
| `POST` | `/api/v1/admin/login` | None | Authenticate an `ADMIN` and set the `adminSessionToken` cookie. |
| `POST` | `/api/v1/admin/logout` | Optional | Delete the admin `RefreshToken` record and clear `adminSessionToken`. |
| `GET` | `/api/v1/admin/me` | `ADMIN` (`adminSessionToken`) | Fetch the currently authenticated administrator. |
| `GET` | `/api/v1/admin/workshops` | `ADMIN` (`adminSessionToken`) | Fetch all workshops (`PUBLISHED` & `CANCELLED`) with seat counts (30s cache). |
| `POST` | `/api/v1/admin/workshops` | `ADMIN` (`adminSessionToken`) | Create and publish a new workshop. |
| `PATCH` | `/api/v1/admin/workshops/:id` | `ADMIN` (`adminSessionToken`) | Update workshop details/capacity (enforces `capacity >= registrations`). |
| `PATCH` | `/api/v1/admin/workshops/:id/cancel` | `ADMIN` (`adminSessionToken`) | Cancel a published workshop (`status = "CANCELLED"`). |
| `PATCH` | `/api/v1/admin/workshops/:id/publish` | `ADMIN` (`adminSessionToken`) | Republish a cancelled future workshop (`status = "PUBLISHED"`). |
| `GET` | `/api/v1/admin/registrations` | `ADMIN` (`adminSessionToken`) | Global paginated registrations list with search, filter by workshop, and sort. |
| `GET` | `/api/v1/admin/workshops/:workshopId/registrations` | `ADMIN` (`adminSessionToken`) | Workshop summary + paginated, searchable participant directory for one workshop. |

<details>
<summary><strong>Click to expand detailed Request & Response Payloads</strong></summary>

#### 1. `POST /api/v1/auth/register`
- **Request Body** (`registerUserSchema`):
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "id": "7fadc1aa-55a4-465f-ba84-e90e38166c7b",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "role": "USER",
      "createdAt": "2026-11-14T10:00:00.000Z"
    }
  }
  ```

#### 2. `GET /api/v1/workshops?page=1&limit=6&search=design&sort=soonest`
- **Query Parameters**:
  - `page` (optional, default `1`)
  - `limit` (optional, default `10` on backend, `6` from frontend, max `50`)
  - `search` (optional, string matched against `title` and `description`)
  - `sort` (`soonest` | `latest`)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Published workshops fetched successfully",
    "data": [
      {
        "id": "91272b54-5db2-4da3-a07b-e6ba65584315",
        "title": "UI/UX Design Masterclass",
        "description": "Learn user research, wireframing, prototyping and modern interface design.",
        "dateTime": "2026-12-01T14:00:00.000Z",
        "capacity": 50,
        "createdAt": "2026-11-12T08:30:00.000Z",
        "registrationCount": 12,
        "availableSeats": 38
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 6,
      "totalPages": 1
    }
  }
  ```

#### 3. `POST /api/v1/workshops/register`
- **Request Body** (`registerForWorkshopSchema`):
  ```json
  {
    "workshopId": "91272b54-5db2-4da3-a07b-e6ba65584315",
    "fullName": "Aarav Sharma",
    "email": "aarav@example.com",
    "mobileNumber": "+919876543210"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Workshop registration successful",
    "data": {
      "registration": {
        "id": "f43dfcd6-20a1-4f1a-b7b3-95ff61a2ccf2",
        "userId": "7fadc1aa-55a4-465f-ba84-e90e38166c7b",
        "workshopId": "91272b54-5db2-4da3-a07b-e6ba65584315",
        "fullName": "Aarav Sharma",
        "email": "aarav@example.com",
        "mobileNumber": "+919876543210",
        "registeredAt": "2026-11-14T11:20:00.000Z"
      },
      "whatsappLink": "https://chat.whatsapp.com/exampleInviteCode",
      "registrationCount": 13,
      "availableSeats": 37
    }
  }
  ```

#### 4. `POST /api/v1/admin/workshops`
- **Request Body** (`createWorkshopSchema`):
  ```json
  {
    "title": "Product Strategy & Roadmapping",
    "description": "Hands-on session on outcome-driven roadmaps.",
    "dateTime": "2026-12-15T13:30:00.000Z",
    "capacity": 40,
    "whatsappLink": "https://chat.whatsapp.com/exampleGroupInvite"
  }
  ```

</details>

---

## 13. Folder Structure

```text
workshop-management-platform/
├── .gitignore                        # Root gitignore (.env*, node_modules, .vercel)
├── .vercelignore                     # Prevents local .env files from uploading during CLI deploys
├── README.md                         # Project documentation
│
├── client/                           # React 19 + Vite 8 Frontend SPA
│   ├── .env.example                  # Frontend environment variable template
│   ├── .gitignore                    # Client gitignore
│   ├── .vercelignore                 # Excludes local .env during Vercel builds
│   ├── eslint.config.js              # ESLint 10 configuration
│   ├── index.html                    # Root HTML entry (title: WORKSHOP, favicon: /favicon.png)
│   ├── package.json                  # Frontend dependencies and scripts
│   ├── vercel.json                   # Vercel /api rewrite proxy + SPA fallback rules
│   ├── vite.config.js                # Vite plugins (React, Tailwind v4) + local /api proxy
│   ├── public/
│   │   ├── favicon.png               # Custom WORKSHOP brand icon
│   │   ├── favicon.svg               # Legacy vector icon
│   │   └── icons.svg                 # SVG sprite sheet
│   └── src/
│       ├── main.jsx                  # React DOM root mount
│       ├── App.jsx                   # BrowserRouter, PublicLayout, AdminLayout & route tree
│       ├── index.css                 # Tailwind v4 @theme tokens (navy, gold, cream, offwhite)
│       ├── App.css                   # Auxiliary component styles
│       ├── components/
│       │   ├── common/
│       │   │   ├── ProtectedRoute.jsx        # User route guard (redirects to /login)
│       │   │   └── AdminProtectedRoute.jsx   # Admin route guard (redirects to /admin/login)
│       │   └── layout/
│       │       └── Navbar.jsx                # Responsive sticky header + account dropdown
│       ├── context/
│       │   ├── AuthContext.jsx               # User session state & profile actions
│       │   └── AdminAuthContext.jsx          # Admin session state
│       ├── pages/
│       │   ├── user/
│       │   │   ├── HomePage.jsx              # Editorial hero & discovery CTA page
│       │   │   ├── WorkshopsPage.jsx         # Paginated, searchable workshop catalog
│       │   │   ├── WorkshopRegistrationPage.jsx # Seat booking form & confirmation view
│       │   │   ├── MyWorkshopsPage.jsx       # Tabbed user registrations & WhatsApp CTAs
│       │   │   ├── ProfilePage.jsx           # User stats, account metadata & name editor
│       │   │   ├── LoginPage.jsx             # User sign-in page
│       │   │   └── RegisterPage.jsx          # User sign-up page
│       │   └── admin/
│       │       ├── AdminLoginPage.jsx        # Administrator portal sign-in
│       │       ├── AdminWorkshopsPage.jsx    # Workshop CRUD, KPIs & status controls
│       │       └── WorkshopRegistrationsPage.jsx # Per-workshop participant directory
│       └── services/
│           ├── api.js                        # Shared fetch wrapper (credentials: "include")
│           ├── authService.js                # User auth API calls
│           ├── workshopService.js            # Workshop API calls + 60s in-memory cache
│           ├── registrationService.js        # Registration API calls + user-scoped cache
│           ├── adminAuthService.js           # Admin auth API calls
│           ├── adminWorkshopService.js       # Admin workshop CRUD API calls
│           └── adminRegistrationService.js   # Admin participant directory API calls
│
└── server/                           # Node.js + Express 5 + Prisma 7 Backend API
    ├── .env.example                  # Backend environment variable template
    ├── .vercelignore                 # Excludes local .env during Vercel builds
    ├── package.json                  # Backend dependencies, start & postinstall scripts
    ├── prisma.config.ts              # Prisma 7 CLI config (reads DIRECT_URL for migrations)
    ├── prisma/
    │   ├── schema.prisma             # PostgreSQL models: User, Workshop, Registration, RefreshToken
    │   ├── seed.js                   # Idempotent admin account seed script (upsert)
    │   └── migrations/
    │       └── 20261111092047_init/
    │           └── migration.sql     # Initial DDL schema migration
    └── src/
        ├── server.js                 # Entry point (listens on 0.0.0.0:PORT or exports for Vercel)
        ├── app.js                    # Express app, trust proxy, CORS, routes & error handling
        ├── db.js                     # PrismaClient instance with @prisma/adapter-pg (DATABASE_URL)
        ├── config/
        │   ├── session.js            # PostgreSQL express-session configuration
        │   └── database.js           # Reserved database config module
        ├── controllers/
        │   ├── auth.controller.js            # User register, login, logout, me, updateProfile
        │   ├── admin.controller.js           # Admin login, logout, getMe
        │   ├── workshop.controller.js        # Workshop listing, details, create, update, cancel, publish
        │   ├── registration.controller.js    # Workshop seat booking & my-registrations
        │   └── admin-registration.controller.js # Admin workshop & participant directory handlers
        ├── middleware/
        │   ├── auth.middleware.js            # authenticateUser & optionalAuthenticateUser
        │   ├── admin.middleware.js           # authenticateAdmin
        │   ├── role.middleware.js            # authorizeRole(...allowedRoles)
        │   ├── validation.middleware.js      # Generic Zod schema validation middleware
        │   └── error.middleware.js           # Centralized JSON error formatter
        ├── routes/
        │   ├── auth.routes.js                # /api/v1/auth/*
        │   ├── admin.routes.js               # /api/v1/admin/* (auth)
        │   ├── workshop.routes.js            # /api/v1/workshops/* (public)
        │   ├── registration.routes.js        # /api/v1/workshops/* (authenticated user)
        │   ├── admin-workshop.routes.js      # /api/v1/admin/workshops/*
        │   └── admin-registration.routes.js  # /api/v1/admin/registrations & workshops
        ├── services/
        │   ├── auth.service.js               # User bcrypt hashing & session token creation
        │   ├── admin.service.js              # Admin credential verification & token creation
        │   ├── workshop.service.js           # Workshop queries & FOR UPDATE transactional mutations
        │   ├── registration.service.js       # Concurrency-safe booking & email trigger
        │   ├── admin-registration.service.js # Admin analytics, caching & participant queries
        │   └── email.service.js              # Lazy-initialized Resend confirmation email sender
        ├── utils/
        │   ├── cache.js                      # In-memory TTL Map cache (getCache, setCache, clearCache)
        │   └── apiResponse.js                # Reserved response helper module
        └── validators/
            ├── auth.validator.js             # Zod schemas for register, login, updateProfile
            ├── workshop.validator.js         # Zod schemas for createWorkshop & updateWorkshop
            ├── registration.validator.js     # Zod schema for registerForWorkshop
            └── admin-registration.validator.js # Zod schemas for admin pagination & search queries
```

---

## 14. Installation and Local Setup

### Prerequisites
- **Node.js**: `v20.x` or `v22.x+` (verified on `v22` and `v24`)
- **npm**: `v10+`
- **PostgreSQL Database**: A local PostgreSQL instance or a free [Neon Serverless PostgreSQL](https://neon.tech/) project
- **Resend Account**: A free [Resend](https://resend.com/) API key for confirmation emails

### Step 1: Clone the Repository
```bash
git clone https://github.com/Manas-Sandhu/workshop-management-platform.git
cd workshop-management-platform
```

### Step 2: Install Backend Dependencies & Generate Prisma Client
```bash
cd server
npm install
```
> `npm install` automatically triggers the `"postinstall": "prisma generate"` script to build the Prisma 7 client.

### Step 3: Configure Backend Environment Variables
```bash
cp .env.example .env
```
Open `server/.env` and populate your PostgreSQL URLs, session secret, Resend credentials, and admin seed credentials (see [Section 15](#15-environment-variables) for full details).

### Step 4: Apply Database Migrations & Seed the Admin Account
```bash
# Apply the PostgreSQL schema migrations using DIRECT_URL
npx prisma migrate deploy

# Seed the initial ADMIN user (requires ADMIN_PASSWORD >= 12 characters)
npm run db:seed-admin
```

### Step 5: Start the Backend Development Server
```bash
npm run dev
```
The Express API will start on `http://localhost:5001` (or the `PORT` specified in `server/.env`). Verify it with:
```bash
curl http://localhost:5001/health
# Expected output: {"status":"ok"}
```

### Step 6: Install & Start the Frontend Development Server
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
The Vite dev server starts on `http://localhost:5173`. Because `client/vite.config.js` includes a built-in proxy (`/api` → `http://localhost:5001/api/v1`), you do **not** need to set `VITE_API_BASE_URL` for local development.

### Step 7: Production Build Verification
```bash
cd client
npm run build
npm run preview
```

---

## 15. Environment Variables

### Backend (`server/.env`)

```dotenv
PORT=5001
NODE_ENV=development

# Neon pooled connection — used by the app at runtime (Prisma PgAdapter)
DATABASE_URL=postgresql://USER:PASSWORD@ep-example-pooler.region.aws.neon.tech/neondb?sslmode=require

# Neon direct (non-pooled) connection — used by prisma migrate deploy
DIRECT_URL=postgresql://USER:PASSWORD@ep-example.region.aws.neon.tech/neondb?sslmode=require

# Cryptographic secret for session signing
SESSION_SECRET=replace_with_a_long_random_hex_string

# Full URL of the deployed frontend (required in production for CORS)
CLIENT_URL=http://localhost:5173

# Resend email service credentials
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=onboarding@resend.dev

# Admin seed credentials (used by `npm run db:seed-admin`)
ADMIN_NAME=Platform Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD= minimum_12_character_password
```

| Variable | Required | Scope | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Runtime | HTTP port for local/container server (defaults to `5001`). |
| `NODE_ENV` | Yes | Runtime | Set to `production` in cloud deployments to enable `Secure` cookies and strict `CLIENT_URL` validation. |
| `DATABASE_URL` | Yes | Runtime | Pooled PostgreSQL connection string (`-pooler` host on Neon) used by `@prisma/adapter-pg`. |
| `DIRECT_URL` | Yes | Build / Migrate | Direct PostgreSQL connection string (non-pooled) read by `server/prisma.config.ts` for `prisma migrate`. |
| `SESSION_SECRET` | Yes | Runtime | Secret key for `server/src/config/session.js`. |
| `CLIENT_URL` | Yes (Prod) | Runtime | Allowed CORS origin. In `production`, the server exits with code `1` at startup if `CLIENT_URL` is missing. |
| `RESEND_API_KEY` | Yes | Runtime | API key for the Resend email SDK (`server/src/services/email.service.js`). |
| `EMAIL_FROM` | Yes | Runtime | Verified sender address in Resend (or `onboarding@resend.dev` for testing). |
| `ADMIN_NAME` | Seed only | CLI (`seed.js`) | Display name for the seeded `ADMIN` user. |
| `ADMIN_EMAIL` | Seed only | CLI (`seed.js`) | Login email for the seeded `ADMIN` user. |
| `ADMIN_PASSWORD` | Seed only | CLI (`seed.js`) | Password for the seeded `ADMIN` user (**must be at least 12 characters**). |

### Frontend (`client/.env`)

```dotenv
# Leave unset or set to "/api" when using the Vite dev proxy or Vercel production rewrites.
VITE_API_BASE_URL=
```

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Optional | `"/api"` | Base path prepended to all `apiFetch` requests (`client/src/services/api.js`). Defaults to `"/api"` so requests go through the same-origin proxy. |

---

## 16. Deployment Guide

The platform is deployed in production across **Vercel** (Frontend SPA + Serverless Express Backend) and **Neon** (Serverless PostgreSQL), and is equally compatible with **Render** for long-running container hosting.

### 16.1 Database Setup (Neon PostgreSQL)
1. Create a Neon project and copy both connection strings:
   - **Pooled connection** (contains `-pooler` in hostname) → set as `DATABASE_URL`.
   - **Direct connection** (no `-pooler` in hostname) → set as `DIRECT_URL`.
2. Run migrations and seed your administrator account from your local terminal against the production database:
   ```bash
   cd server
   npx prisma migrate deploy
   npm run db:seed-admin
   ```

### 16.2 Backend Deployment
- **Root Directory**: `server`
- **Build / Install Command**: `npm install` (runs `postinstall` → `prisma generate` automatically)
- **Start Command (Render)**: `npm start` (`node ./src/server.js`)
- **Serverless Entry (Vercel)**: `server/src/server.js` detects `process.env.VERCEL`, skips `app.listen()`, and exports the Express `app` directly.
- **Health Check Path**: `/health`
- **Required Production Environment Variables**: `NODE_ENV=production`, `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `CLIENT_URL=https://workshop-client-delta.vercel.app`, `RESEND_API_KEY`, `EMAIL_FROM`.

### 16.3 Frontend Deployment (Vercel)
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_API_BASE_URL=/api` (or leave unset).
- **Rewrite & SPA Configuration (`client/vercel.json`)**:
  ```json
  {
    "rewrites": [
      {
        "source": "/api/:path*",
        "destination": "https://workshop-server.vercel.app/api/v1/:path*"
      },
      {
        "source": "/((?!api/).*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

### 16.4 Post-Deployment Verification
```bash
# 1. Verify backend health probe
curl -i https://workshop-server.vercel.app/health

# 2. Verify public workshops via the frontend's /api rewrite proxy
curl -i https://workshop-client-delta.vercel.app/api/workshops
```

---

## 17. Security and Reliability

### Implemented Protections
- **Hashed Session Tokens at Rest**: Raw session tokens (`sessionToken`, `adminSessionToken`) only exist in the browser's `HttpOnly` cookie. The database stores only `crypto.createHash("sha256").update(token).digest("hex")`, preventing session hijacking even if the `RefreshToken` table were leaked.
- **Hardened Cookie Flags**: In production (`NODE_ENV === "production"`), cookies are issued with `httpOnly: true`, `secure: true`, `sameSite: "lax"`, and `path: "/"`. Express is configured with `app.set("trust proxy", 1)` so reverse-proxy TLS termination is respected.
- **Fail-Fast Production Boot Checks**: `server/src/app.js` terminates startup immediately (`process.exit(1)`) if `NODE_ENV === "production"` and `CLIENT_URL` is missing, preventing accidental fallback to `localhost` CORS origins.
- **Bcrypt Cost Factor 12**: All user and admin passwords are hashed with 12 salt rounds and capped at 72 characters in Zod (`auth.validator.js`) to prevent bcrypt truncation attacks.
- **Schema Validation & Input Sanitization**: Every write endpoint and admin query endpoint passes through `validateRequest(schema)` using **Zod v4**, stripping unknown properties and returning structured field-level error arrays.
- **Pessimistic Database Locking**: Critical seat-counting and status-changing operations use `SELECT ... FOR UPDATE` inside `prisma.$transaction`, eliminating race conditions.
- **Fault-Isolated Email Dispatch**: Resend API errors during workshop registration are caught and logged after the database transaction commits, ensuring user registrations never fail due to external email provider outages.

### Recommended Future Security & Performance Enhancements
- **Rate Limiting**: Add `express-rate-limit` on `/api/v1/auth/login` and `/api/v1/admin/login` to throttle brute-force credential stuffing.
- **Database Composite Indexes**: Add `@@index([status, dateTime])` on `Workshop` and `@@index([workshopId])` on `Registration` in `schema.prisma` to accelerate filtered catalog queries as dataset volume grows.
- **Distributed Cache**: Replace the process-local `Map` cache (`server/src/utils/cache.js`) with Redis (e.g., Upstash) so cache invalidation propagates across all serverless instances immediately.
- **Expired Token Cleanup Job**: Add a scheduled cleanup query (`DELETE FROM "RefreshToken" WHERE "expiresAt" <= NOW()`) to prune expired sessions that were never explicitly logged out.

---

## 18. UI/UX and Design

**WORKSHOP.** is designed with a warm, editorial aesthetic inspired by modern learning collectives and design studios.

### Design Tokens (`client/src/index.css`)
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--color-navy` | `#142933` | Primary brand surface, hero backgrounds, primary buttons, and headings |
| `--color-gold` | `#CBA765` | Accent highlights, badges, active navigation states, and hover transitions |
| `--color-cream` | `#F4F0EA` | Secondary section backgrounds, stat icon containers, and subtle badges |
| `--color-offwhite` | `#FBFCFC` | Primary page canvas and form input backgrounds |
| `--font-display` | `Manrope` | High-contrast geometric display headings (`font-semibold` to `font-extrabold`) |
| `--font-sans` | `DM Sans` | Clean, legible body copy, tables, and form controls |

### Key UX Details
- **Intent-Preserving Authentication Redirects**: Clicking **Register Now** on a workshop while logged out takes the user through `/login` (and even `/register` → `/login`) and automatically returns them to that exact workshop's booking page upon sign-in.
- **Responsive Navigation**: Desktop view features a sticky glassmorphic header (`backdrop-blur-md`) with an interactive account dropdown menu; mobile view provides a collapsible drawer.
- **In-Flight Request Deduplication**: Both `workshopService.js` and `registrationService.js` maintain a `pendingRequests` map alongside a 60-second TTL cache, preventing duplicate network calls during rapid tab switching or React StrictMode double-mounts.

---

## 19. Future Scope

The following items are **proposed future enhancements** (not currently implemented in the codebase):

1. **Account Settings Page (`/settings`)**: `Navbar.jsx` includes a menu link to `/settings` (currently caught by the `PlaceholderPage` fallback route in `App.jsx`). Implementing this route will allow users to change their password and manage notification preferences.
2. **Automated Pre-Workshop Reminder Cron**: Add a scheduled job (via Vercel Cron or `node-cron`) to send 24-hour and 1-hour reminder emails via Resend before a workshop's `dateTime`.
3. **Participant Cancellation & Waitlist Queue**: Allow users to cancel their registration from `/my-workshops` to free up seats, and automatically notify waitlisted users when a full workshop reopens.
4. **CSV Export for Admin Participant Lists**: Allow administrators to export the filtered participant table on `/admin/workshops/:workshopId/registrations` as a CSV file for attendance sheets.
5. **Workshop Categories & Tags**: Extend the `Workshop` Prisma model with a `category` field and add category filter pills to `/workshops`.

---

## 20. Contributing Guidelines

1. **Fork & Clone** the repository.
2. **Create a Feature Branch** from `main` following the team's naming convention:
   ```bash
   git checkout -b feature/<your-name>-frontend
   # or
   git checkout -b feature/<your-name>-backend
   ```
3. **Make Changes & Lint**:
   ```bash
   cd client && npm run lint
   ```
4. **Verify Production Build**:
   ```bash
   cd client && npm run build
   ```
5. **Commit & Push** using clear, conventional commit messages (`feat(client): ...`, `fix(server): ...`, `chore(deploy): ...`) and open a Pull Request against `main`.

---

## 21. Troubleshooting

<details>
<summary><strong>1. Prisma 7 Error: <code>PrismaConfigEnvError: Cannot resolve environment variable: DIRECT_URL</code></strong></summary>

- **Cause**: Prisma 7 reads `server/prisma.config.ts` during CLI commands (`prisma generate`, `prisma migrate`).
- **Fix**: `prisma.config.ts` uses `process.env.DIRECT_URL ?? ""` so `npx prisma generate` succeeds without a database connection. For `npx prisma migrate deploy`, ensure `DIRECT_URL` is set in `server/.env` or your CI/CD environment.
</details>

<details>
<summary><strong>2. Prisma 7 Error: <code>P1012: The datasource property url is no longer supported in schema files</code></strong></summary>

- **Cause**: Prisma 7 moved migration URLs to `prisma.config.ts` and runtime connection strings to driver adapters (`@prisma/adapter-pg` in `server/src/db.js`).
- **Fix**: Do not add `url = env("DATABASE_URL")` inside `server/prisma/schema.prisma`. Keep `datasource db { provider = "postgresql" }` clean.
</details>

<details>
<summary><strong>3. Resend Email Error: <code>403 validation_error: You can only send testing emails to your own email address</code></strong></summary>

- **Cause**: When `EMAIL_FROM` is set to `onboarding@resend.dev` on a free Resend account without a verified custom domain, Resend restricts recipient emails to the account owner's email address.
- **Note**: Because email sending in `registration.service.js` is wrapped in a non-blocking `try/catch` after the database transaction commits, the workshop registration itself still succeeds (`201 Created`). To send emails to any participant, verify a custom domain in Resend and update `EMAIL_FROM`.
</details>

<details>
<summary><strong>4. Admin Seed Fails: <code>Admin password must be at least 12 characters</code></strong></summary>

- **Cause**: `server/prisma/seed.js` enforces `password.length >= 12` for administrator security.
- **Fix**: Set `ADMIN_PASSWORD` in `server/.env` to a string of at least 12 characters and re-run `npm run db:seed-admin`.
</details>

<details>
<summary><strong>5. Login Succeeds (`200 OK`) in Production, but Subsequent `/me` Calls Return `401 Unauthorized`</strong></summary>

- **Cause**: Either `NODE_ENV` is not set to `production`, `app.set("trust proxy", 1)` is missing behind a reverse proxy, or the frontend is calling the backend domain directly instead of using the `/api` same-origin rewrite proxy.
- **Fix**: Ensure `VITE_API_BASE_URL` is unset or set to `/api` on Vercel so all requests flow through `client/vercel.json` rewrites on the same domain.
</details>

---

## 22. License and Acknowledgements

- **License**: Distributed under the **ISC License** (see [`server/package.json`](./server/package.json)).
- **Acknowledgements**:
  - Built collaboratively by the WORKSHOP engineering team ([Manas-Sandhu/workshop-management-platform](https://github.com/Manas-Sandhu/workshop-management-platform)).
  - Powered by [Neon](https://neon.tech/), [Prisma](https://www.prisma.io/), [Resend](https://resend.com/), [Tailwind CSS](https://tailwindcss.com/), and [Vercel](https://vercel.com/).
