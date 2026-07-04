# CTH EdTech — Clean Tech Hub LMS

> An enterprise-grade Learning Management System for clean technology education — solar energy, sustainability, carbon accounting, and climate finance.
>
> **Live URL:** [https://cth-lms.vercel.app](https://cth-lms.vercel.app)  
> **Deployment:** Vercel

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Third-Party Services](#3-third-party-services)
4. [Application Portals](#4-application-portals)
5. [Database Schema](#5-database-schema)
6. [Local Development Setup](#6-local-development-setup)
7. [Environment Variables](#7-environment-variables)
8. [Running the App](#8-running-the-app)
9. [Project Structure](#9-project-structure)
10. [API Routes](#10-api-routes)
11. [Server Actions](#11-server-actions)
12. [Security Architecture](#12-security-architecture)
13. [Background Jobs (QStash)](#13-background-jobs-qstash)
14. [Email System](#14-email-system)
15. [Search (Algolia)](#15-search-algolia)
16. [Video Streaming (Mux)](#16-video-streaming-mux)
17. [Testing](#17-testing)
18. [Design System](#18-design-system)
19. [Admin Quick Setup](#19-admin-quick-setup)
20. [Known Gaps & Future Work](#20-known-gaps--future-work)

---

## 1. Project Overview

Clean Tech Hub LMS provides three distinct user-facing portals on a single Next.js App Router application:

| Portal | Role | Entry Point |
|---|---|---|
| **Public / Marketing** | Unauthenticated visitors | `/` |
| **Student Dashboard** | Enrolled learners | `/student/dashboard` |
| **Instructor Portal** | Course creators | `/instructor/dashboard` |
| **Admin Portal** | Platform administrators | `/admin/dashboard` |

### Core User Flow

```
Register (/register)
  └─> Supabase creates auth credentials
  └─> Prisma inserts STUDENT row in DB
  └─> Middleware reads role → redirects to /student/courses

Instructor creates course
  └─> Uploads video via Mux Direct Upload
  └─> Mux webhook fires → QStash processes → Lesson updated with playback ID
  └─> Admin publishes course → Algolia sync

Student enrolls in course
  └─> Paystack payment initialized → verified
  └─> Enrollment record created
  └─> Resend sends confirmation email
  └─> Student accesses Mux video player

Student completes course
  └─> Progress hits 100% → QStash job queued
  └─> Certificate record created with unique verification code
  └─> COURSE_COMPLETION notification created
  └─> Completion email sent via Resend
```

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | `^16.2.6` |
| Language | TypeScript | `^5` |
| UI Library | React | `19.2.3` |
| Styling | Tailwind CSS | `^4` |
| Animation | Framer Motion | `^12.23.26` |
| Icons | Lucide React | `^0.562.0` |
| Font | Google Fonts — Inter | via `next/font` |
| ORM | Prisma | `5.22.0` |
| Database | PostgreSQL | hosted on Supabase |
| Auth | Supabase SSR | `^0.8.0` |
| Storage | Supabase Storage | via `@supabase/supabase-js` |
| Video | Mux | `@mux/mux-node ^12.8.1` |
| Search | Algolia + InstantSearch | `4.27.0` / `^7.28.0` |
| Rate Limiting | Upstash Ratelimit + Redis | `^2.0.8` / `^1.37.0` |
| Caching | Upstash Redis | `^1.37.0` |
| Background Jobs | Upstash QStash | `^2.9.1` |
| Email | Resend | `^6.9.2` |
| Payments | Paystack | (raw API — no SDK) |
| Monitoring | Sentry | `^10.43.0` |
| Analytics | Vercel Analytics | `^2.0.1` |
| Logging | Pino | `^10.3.0` |
| Charts | Recharts | `^3.7.0` |
| Data Fetching | SWR | `^2.3.8` |
| JWT Signing | jose | `^6.2.3` |
| Validation | Zod | `^4.3.6` |
| Date Utilities | date-fns | `^4.1.0` |
| Class Utilities | clsx + tailwind-merge | `^2.1.1` / `^3.4.0` |

---

## 3. Third-Party Services

Each external service requires its own API keys. See [Section 7](#7-environment-variables) for required env vars.

| Service | Purpose in This Project |
|---|---|
| **Supabase** | Authentication (email/password, SSR cookies), PostgreSQL database host, file storage (thumbnails, avatars) |
| **Mux** | Video upload (direct upload URLs), adaptive bitrate transcoding, HLS streaming via `mux-player-react` |
| **Algolia** | Course full-text search index — synced via `/api/algolia`, queried via `react-instantsearch` on the frontend |
| **Upstash Redis** | Edge rate limiting in middleware (two-tier), API response caching for `/api/courses` |
| **Upstash QStash** | Background job queue — handles certificate generation and async Mux webhook processing |
| **Resend** | Transactional emails: welcome, enrollment confirmation, completion, payment receipt |
| **Paystack** | Payment initialization and verification for paid courses (Nigerian Naira / NGN) |
| **Sentry** | Error tracking across client, server, and edge runtimes; source maps uploaded on CI |
| **Vercel** | Deployment, Edge network, CDN, Cron job monitoring |
| **Vercel Analytics** | Anonymous page-view tracking and Core Web Vitals |

---

## 4. Application Portals

### 4.1 Public / Marketing (`/`)

| Route | Description |
|---|---|
| `/` | Homepage (hero, features, course preview, testimonials) |
| `/courses` | Full course catalog with Algolia live search + filters |
| `/about` | About page with live impact metrics from DB |
| `/blog` | Blog article listing |
| `/contact` | Contact form (submissions stored in DB) |
| `/business` | Enterprise / business page |
| `/learning-paths` | Curated learning path listing |
| `/login` | Login form |
| `/register` | Registration form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/cookies` | Cookie policy |

### 4.2 Student Portal (`/student/*`)

Accessible to `STUDENT` and above roles only (enforced by middleware).

| Route | Description |
|---|---|
| `/student/dashboard` | Stats, weekly goal tracker, progress bars, last accessed course |
| `/student/courses` | All enrolled courses with progress and filters |
| `/student/progress` | Learning pathway progress view |
| `/student/calendar` | Upcoming live session calendar |
| `/student/certificates` | Issued certificates listing |
| `/student/settings` | Profile, notification preferences, password update |

### 4.3 Instructor Portal (`/instructor/*`)

Accessible to `INSTRUCTOR` and `ADMIN` roles.

| Route | Description |
|---|---|
| `/instructor/dashboard` | Revenue, student count, course performance |
| `/instructor/courses` | All courses by this instructor |
| `/instructor/courses/new` | Create a new course |
| `/instructor/courses/[courseId]/edit` | Edit course — details, modules, lessons, quiz builder, video upload |
| `/instructor/courses/[courseId]/assignments` | Assignment management |
| `/instructor/courses/[courseId]/sessions` | Live session scheduling |
| `/instructor/analytics` | Per-course view, completion, revenue analytics |
| `/instructor/earnings` | Payout breakdown |
| `/instructor/students` | Student roster per course |
| `/instructor/resources` | Resource management |
| `/instructor/settings` | Profile info + payout bank details |

### 4.4 Admin Portal (`/admin/*`)

Accessible to `ADMIN` role only.

| Route | Description |
|---|---|
| `/admin/dashboard` | Platform-wide stats (users, enrollments, revenue) |
| `/admin/users` | View, ban/unban, and change user roles |
| `/admin/courses` | All platform courses — publish, feature, delete |
| `/admin/learning-paths` | Create and manage structured learning paths |
| `/admin/payments` | Full payment transaction ledger |
| `/admin/analytics` | Platform analytics via Recharts |
| `/admin/homepage` | CMS: Edit hero section, focus areas, programs |
| `/admin/faq` | CMS: Manage FAQs |
| `/admin/testimonials` | CMS: Manage student testimonials |
| `/admin/about` | CMS: Edit impact metrics (About page) |
| `/admin/contact` | Inbox of contact form submissions |
| `/admin/blog` | Full blog CRUD — draft, schedule, publish |
| `/admin/site` | Global site settings key-value store |
| `/admin/settings` | Admin account settings |

### 4.5 Course Player (`/(learn)/[courseId]`)

The lesson player UI is in a separate route group to support a distraction-free full-screen layout.

| Route | Description |
|---|---|
| `/[courseId]` | Main lesson player — video, quiz, discussion, and assignment tabs |
| `/[courseId]/quiz` | Dedicated full-screen quiz view |

---

## 5. Database Schema

The Prisma schema is located at `prisma/schema.prisma`. Below is a summary of all models:

### Users & Auth
- **`User`** — Core user record. Fields: `id`, `email`, `name`, `role` (`STUDENT` / `INSTRUCTOR` / `ADMIN`), `avatar`, `bio`, `isBanned`, `payoutMethod`, `payoutAccountNumber`, `payoutBankName`, `notificationPrefs` (JSON).

### Course Structure
- **`Course`** — Full metadata: `slug`, `title`, `category`, `level`, `price` (in kobo/cents), `published`, `featured`, `bestseller`, `trending`, `learningOutcomes[]`, `deletedAt` (soft delete).
- **`Module`** — Ordered sections within a course.
- **`Lesson`** — Rich text content + Mux video fields (`muxAssetId`, `muxPlaybackId`, `muxUploadId`).

### Enrollment & Progress
- **`Enrollment`** — Unique per `userId + courseId`. Tracks `progressPercent`, `completedAt`, `lastAccessedAt`.
- **`LessonProgress`** — Tracks per-lesson `completed`, `timeSpent`, `lastPosition` (video resume).

### Quiz System
- **`Quiz`** — `passingScore`, `timeLimit`, `totalPoints` per lesson.
- **`QuizQuestion`** — Types: `MULTIPLE_CHOICE`, `TRUE_FALSE`, `MULTI_SELECT`. Options and answers stored as JSON.
- **`QuizAttempt`** — Full attempt record: `answers` (JSON), `markedForReview` (JSON), `score`, `passed`.

### Payments
- **`Payment`** — `amount`, `currency` (NGN), `gateway` ("paystack"), `gatewayReference`, `status` (`PENDING` / `COMPLETED` / `FAILED` / `REFUNDED`).
- **`WebhookLog`** — Idempotent log for all incoming payment webhooks.

### Certificates
- **`Certificate`** — Issued on course completion. `verificationCode` is a unique UUID for public verification.

### Community & Engagement
- **`Review`** — One review per user per course (rating 1–5).
- **`Comment`** — Nested lesson comments (replies via `parentId`).
- **`ForumTopic`** — Per-course discussion forum topics (can be pinned/closed).
- **`ForumReply`** — Replies with `isAccepted` status (NONE / ACCEPTED).

### Assignments & Submissions
- **`Assignment`** — One per lesson. Has `dueDate` and `maxScore`.
- **`Submission`** — Student file URL + notes + instructor `grade` + `feedback`.

### CMS Content
- `HomepageHero`, `FocusArea`, `Program`, `FAQ`, `SiteSettings`, `Testimonial`, `ContactSubmission`, `ImpactMetric`, `Blog`

### Other
- **`LiveSession`** — Scheduled live classes linked to courses.
- **`StudentGoal`** — Weekly learning hour target per student.
- **`Notification`** — In-app notifications (6 types: enrollment, completion, new lesson, system alert, payment success, forum reply).
- **`LearningPath`** + **`LearningPathCourse`** — Curated course sequences.

---

## 6. Local Development Setup

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A **PostgreSQL** database (Supabase free tier works)
- API keys for: Supabase, Mux, Algolia, Upstash Redis, Upstash QStash, Resend, Paystack

### Step 1 — Clone and Install

```bash
git clone <repo-url>
cd clean-tech-hub
npm install
```

> `npm install` automatically runs `prisma generate` via the `postinstall` script.

### Step 2 — Environment Variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

See [Section 7](#7-environment-variables) for a full description of every variable.

### Step 3 — Database Setup

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
```

To open Prisma Studio (visual DB browser):

```bash
npx prisma studio
```

### Step 4 — Create an Admin User

1. Register a new account on the app at `/register`
2. In Prisma Studio (or your DB client), find the user in the `users` table
3. Change their `role` column from `STUDENT` to `ADMIN`

See `scripts/quick_admin_setup.md` for a full walkthrough.

### Step 5 — Seed Algolia (Optional)

After creating and publishing some courses, sync them to the Algolia index:

```bash
npx tsx scripts/sync-now.ts
```

Or trigger it via the admin dashboard.

---

## 7. Environment Variables

Create a `.env` file in the project root (`clean-tech-hub/.env`). All variables are required for full functionality.

```env
# ──────────────────────────────────────────────
# DATABASE (Supabase PostgreSQL)
# ──────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public"
# DIRECT_URL is used for Prisma Migrate (non-pooled connection)
# Uncomment in prisma/schema.prisma if needed
DIRECT_URL="postgresql://user:password@host:5432/db"

# ──────────────────────────────────────────────
# SUPABASE (Auth + Storage)
# ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# ──────────────────────────────────────────────
# MUX (Video Upload & Streaming)
# ──────────────────────────────────────────────
NEXT_PUBLIC_MUX_ENV_KEY="your-mux-env-key"
MUX_TOKEN_ID="your-mux-token-id"
MUX_TOKEN_SECRET="your-mux-token-secret"
MUX_WEBHOOK_SECRET="your-mux-webhook-secret"

# ──────────────────────────────────────────────
# UPSTASH REDIS (Caching & Rate Limiting)
# ──────────────────────────────────────────────
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# ──────────────────────────────────────────────
# UPSTASH QSTASH (Background Jobs)
# ──────────────────────────────────────────────
QSTASH_URL="https://qstash.upstash.io/v2/publish/"
QSTASH_TOKEN="..."
QSTASH_CURRENT_SIGNING_KEY="sig_..."
QSTASH_NEXT_SIGNING_KEY="sig_..."

# ──────────────────────────────────────────────
# ALGOLIA (Full-Text Search)
# ──────────────────────────────────────────────
NEXT_PUBLIC_ALGOLIA_APP_ID="your-app-id"
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY="your-search-only-key"
ALGOLIA_ADMIN_KEY="your-admin-api-key"

# ──────────────────────────────────────────────
# RESEND (Transactional Email)
# ──────────────────────────────────────────────
RESEND_API_KEY="re_..."

# ──────────────────────────────────────────────
# PAYSTACK (Payments — NGN)
# ──────────────────────────────────────────────
PAYSTACK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."

# ──────────────────────────────────────────────
# APP URL
# ──────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Note on Redis / QStash:** If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are not set, the app fails **open** — rate limiting and caching are silently skipped. All other features work normally.

---

## 8. Running the App

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server (after build)
npm start

# Lint
npm run lint
```

The app runs on **`http://localhost:3000`**.

---

## 9. Project Structure

```
clean-tech-hub/
│
├── prisma/
│   ├── schema.prisma          # Full database schema (33 models)
│   └── migrations/            # Migration history
│
├── public/                    # Static assets (Logo.webp, images)
│
├── scripts/                   # Developer utility scripts
│   ├── quick_admin_setup.md   # How to create an admin account
│   ├── sync-now.ts            # Trigger Algolia sync manually
│   ├── verify-production.ts   # Verify DB models in production
│   ├── db-push.js             # Raw Prisma push helper
│   └── execute-sql.js         # Run raw SQL
│
├── e2e/                       # Playwright end-to-end tests
├── load-tests/                # k6 load testing scripts
│
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Public-facing pages (12 routes)
│   │   ├── (learn)/           # Course player (lesson + quiz)
│   │   ├── student/           # Student portal (6 pages + layout)
│   │   ├── instructor/        # Instructor portal (9 pages + layout)
│   │   ├── admin/             # Admin portal (14 pages + layout)
│   │   ├── api/               # 20 API route directories
│   │   ├── auth/              # Supabase auth callback
│   │   ├── payment/           # Paystack callback handler
│   │   ├── 403/               # Forbidden error page
│   │   ├── layout.tsx         # Root layout (fonts, AuthProvider, Toaster, Analytics)
│   │   ├── globals.css        # Design tokens + Tailwind config
│   │   ├── error.tsx          # Global error boundary
│   │   └── not-found.tsx      # 404 page
│   │
│   ├── actions/
│   │   ├── admin/             # 12 server action files
│   │   ├── instructor/        # 8 server action files
│   │   ├── student/           # 7 server action files
│   │   └── quiz.ts            # Shared quiz submission logic
│   │
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   ├── auth/              # Auth form components
│   │   ├── instructor/        # InstructorSidebar, QuizBuilder, VideoUpload
│   │   ├── marketing/         # Header, Footer, AlgoliaSearchPanel, CourseCard
│   │   ├── notifications/     # NotificationBell
│   │   ├── providers/         # AuthProvider (Supabase session context)
│   │   ├── shared/            # GlobalSearchModal
│   │   ├── student/           # 13 student-facing components
│   │   └── ui/                # Primitive components (Button, Input, Card, Badge…)
│   │
│   ├── hooks/
│   │   └── useDebounce.ts     # Debounce hook for search inputs
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma singleton client
│   │   ├── auth.ts            # Supabase server auth helper
│   │   ├── auth-api.ts        # Auth API utilities
│   │   ├── auth-token.ts      # Role JWT cookie utilities
│   │   ├── supabase.ts        # Supabase browser client
│   │   ├── supabase-server.ts # Supabase server client
│   │   ├── mux.ts             # Mux SDK instance
│   │   ├── algolia-sync.ts    # Algolia course index sync logic
│   │   ├── config-algolia.ts  # Algolia client configuration
│   │   ├── email.ts           # Resend email sender
│   │   ├── email-templates.ts # HTML email templates (4 types)
│   │   ├── upload.ts          # Mux + Supabase upload helpers
│   │   ├── validations.ts     # Zod schemas for all inputs
│   │   ├── logger.ts          # Pino structured logger
│   │   ├── role-redirect.ts   # Role-based redirect helper
│   │   └── utils.ts           # General utility functions
│   │
│   ├── middleware.ts           # Edge middleware: rate limiting + RBAC
│   │
│   └── types/
│       ├── models.ts           # TypeScript interfaces matching Prisma models
│       ├── common.ts           # Shared utility types
│       ├── api.ts              # API response types
│       └── index.ts            # Re-exports
│
├── .env                        # Local environment variables (git-ignored)
├── .env.example                # Template for required env vars
├── next.config.ts              # Next.js config (Sentry, security headers, image CDN)
├── prisma/schema.prisma        # Prisma schema
├── tailwind.config (via CSS)   # Tailwind configured via globals.css
├── tsconfig.json               # TypeScript config
├── jest.config.ts              # Jest unit test config
├── playwright.config.ts        # Playwright E2E config
└── package.json
```

---

## 10. API Routes

All routes live under `src/app/api/`. Route handlers use the Next.js App Router `route.ts` convention.

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/courses` | `GET` | No | Paginated, filtered, Redis-cached course listing |
| `/api/courses/[courseId]/progress` | `POST` | Student | Mark lesson as complete, update enrollment percent |
| `/api/enrollments` | `POST` | Student | Enroll in a free course |
| `/api/payments/initialize` | `POST` | Student | Initialize Paystack payment session |
| `/api/payments/verify` | `POST` | Student | Verify Paystack reference → enroll + send email |
| `/api/mux/upload` | `POST` | Instructor | Get a Mux direct upload URL |
| `/api/mux/sign` | `GET` | Student | Sign a Mux playback URL for secure streaming |
| `/api/mux/webhook` | `POST` | Mux (signed) | Receive Mux events → forward to QStash |
| `/api/qstash` | `POST` | QStash (signed) | Execute background jobs (certificates, Mux processing) |
| `/api/algolia` | `POST` | Admin | Sync all published courses to Algolia |
| `/api/quiz` | `POST` | Student | Submit a quiz attempt |
| `/api/comments` | `GET` / `POST` | Student | Lesson comments CRUD |
| `/api/reviews` | `POST` | Student | Submit a course review |
| `/api/submissions` | `POST` | Student | Submit an assignment |
| `/api/assignments` | — | Instructor | Assignment management |
| `/api/certificates` | `GET` | Student | Fetch certificates |
| `/api/notifications` | `GET` / `PATCH` | Authenticated | List and mark notifications as read |
| `/api/lessons` | — | Instructor | Lesson data management |
| `/api/instructor` | — | Instructor | Instructor-specific data |
| `/api/user` | `PATCH` | Authenticated | Update user profile |
| `/api/contact` | `POST` | No | Submit contact form |
| `/api/health` | `GET` | No | Health check (for uptime monitoring) |

---

## 11. Server Actions

Server Actions provide secure, server-side data mutations without additional API routes. All are located in `src/actions/`.

### Admin (`src/actions/admin/`)
`users.ts` · `courses.ts` · `dashboard.ts` · `payments.ts` · `learning-paths.ts` · `homepage.ts` · `faq.ts` · `testimonials.ts` · `impact.ts` · `contact.ts` · `blog.ts` · `settings.ts`

### Instructor (`src/actions/instructor/`)
`courses.ts` · `dashboard.ts` · `analytics.ts` · `earnings.ts` · `profile.ts` · `sessions.ts` · `settings.ts` · `students.ts`

### Student (`src/actions/student/`)
`dashboard.ts` · `progress.ts` · `certificates.ts` · `calendar.ts` · `quizzes.ts` · `settings.ts` · `profile.ts`

---

## 12. Security Architecture

| Layer | Implementation |
|---|---|
| **Session Auth** | Supabase SSR cookies (`createServerClient`) — session is validated server-side on every request |
| **RBAC** | Middleware reads a signed JWT role cookie (`cth_user_role`) via `jose`. Falls back to a Supabase DB query if cookie is absent or invalid |
| **Route Guards** | Unauthenticated users → redirect to `/login`. Wrong role → rewrite to `/403` |
| **Rate Limiting** | Two-tier Upstash Redis sliding window at the Edge: Auth routes (15 req/60s) · Global (500 req/10s). Fails **open** if Redis is unreachable |
| **Input Validation** | Zod schemas validate all API route inputs and server action arguments. Basic `stripHtml()` applied to all text fields to prevent XSS |
| **Webhook Verification** | Mux webhooks: HMAC signature verified via `mux-node`. QStash: `Receiver.verify()` with current + next signing keys |
| **HTTP Security Headers** | Set globally in `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (2 years), `Referrer-Policy`, `Permissions-Policy` |
| **Error Monitoring** | Sentry configured on client, server, and edge runtimes. Source maps uploaded on CI via `@sentry/webpack-plugin` |

---

## 13. Background Jobs (QStash)

The single QStash consumer endpoint is at `/api/qstash`. All jobs are verified with QStash signing keys before execution.

| Job `eventType` | Trigger | What It Does |
|---|---|---|
| `generate-certificate` | Course completion (100% progress) | Creates `Certificate` DB record with UUID verification code; creates `COURSE_COMPLETION` notification |
| `process-mux-webhook` | Mux webhook (`video.asset.ready` or `video.asset.deleted`) | Updates `Lesson` with `muxAssetId` / `muxPlaybackId`; marks `WebhookLog` as processed |

QStash automatically retries failed jobs (5xx responses). The `/api/qstash` handler returns `500` on processing errors to trigger this retry behavior.

---

## 14. Email System

**Provider:** [Resend](https://resend.com)  
**Templates:** Plain HTML string literals in `src/lib/email-templates.ts`  
**Sender:** Configured via `RESEND_API_KEY`

| Template | Trigger | Key Content |
|---|---|---|
| `welcomeTemplate` | User registers | Welcome message + "Explore Courses" CTA |
| `enrollmentTemplate` | Student enrolls in a course | Course name + "Go to Dashboard" CTA |
| `completionTemplate` | Student completes a course | Congratulations + "View Certificate" CTA |
| `paymentReceiptTemplate` | Payment verified successfully | Itemized receipt (course, amount, reference, date) |

> **Note:** Email templates use raw HTML strings, not a React Email component library. Upgrade path would be to adopt `@react-email/components` for better maintainability.

---

## 15. Search (Algolia)

The app uses **Algolia** for sub-millisecond course search.

### Index Sync
- **Admin triggers sync** via the admin dashboard → calls `/api/algolia`
- **Manual sync** via `npx tsx scripts/sync-now.ts`
- Only **published** courses are indexed
- `lib/algolia-sync.ts` handles batch push to the Algolia index

### Frontend Usage
- **Marketing homepage / `/courses`** — Uses `AlgoliaSearchPanel.client.tsx` with full `react-instantsearch` (filters by category, level, price)
- **Header** — `Header.tsx` contains a search trigger that opens the `GlobalSearchModal.client.tsx`

### Configuration
- Search-only key (`NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`) is safe to expose to the browser
- Admin key (`ALGOLIA_ADMIN_KEY`) is server-only — never expose client-side

---

## 16. Video Streaming (Mux)

All course lesson videos are managed through **Mux**.

### Upload Flow
1. Instructor clicks "Upload Video" in the lesson editor
2. `VideoUpload.tsx` calls `/api/mux/upload` → gets a Mux Direct Upload URL
3. Client uploads the video file directly to Mux (no server proxy)
4. Mux transcodes the video asynchronously
5. Mux fires a `video.asset.ready` webhook to `/api/mux/webhook`
6. Webhook forwards the event to QStash → `/api/qstash` processes it
7. Lesson record is updated with `muxAssetId` and `muxPlaybackId`

### Playback
- Student player uses `@mux/mux-player-react` (`VideoPlayer.tsx`)
- Playback URL is signed via `/api/mux/sign` for secure (non-public) video access
- Player resumes from the last `lastPosition` stored in `LessonProgress`

### Mux Webhook Setup
In your Mux dashboard, configure the webhook URL as:
```
https://your-domain.com/api/mux/webhook
```
Set the signing secret and add it to `MUX_WEBHOOK_SECRET`.

---

## 17. Testing

### Unit Tests (Jest)

```bash
npm test               # Run all unit tests
npm run test:watch     # Watch mode
```

Config: `jest.config.ts` · Setup: `jest.setup.ts`  
Test files: `src/components/ui/__tests__/`

### End-to-End Tests (Playwright)

```bash
npm run test:e2e       # Headless browser tests
npm run test:e2e:ui    # Playwright UI mode
```

Config: `playwright.config.ts`  
Test files: `e2e/auth.spec.ts` · `e2e/student-enrollment.spec.ts`

### Load Tests (k6)

Requires [k6](https://k6.io) to be installed globally.

```bash
npm run test:load:smoke    # Light smoke test
npm run test:load:stress   # Full stress test
```

Test files: `load-tests/smoke-test.js` · `load-tests/stress-test.js`

---

## 18. Design System

The design system is defined in `src/app/globals.css` using CSS custom properties (variables) that map to Tailwind utility classes.

| CSS Variable | Tailwind Class | Usage |
|---|---|---|
| `--cth-deep-blue` (`#00153e`) | `bg-cth-blue` / `text-cth-blue` | Primary dark backgrounds, sidebar headers |
| `--cth-teal` (`#006a6a`) | `bg-primary` / `text-primary` | CTAs, buttons, active nav states (Admin) |
| `--cth-cyan` (`#90efef`) | `bg-cth-cyan` | Accent highlights, student sidebar badge |
| `--sea-mist` | `bg-sea-mist` | Light accent backgrounds |
| `--forest-green` | `text-success` | Success states, positive indicators |
| `--cool-grey` | `bg-cool-grey` | Neutral layout backgrounds |

**Font:** Inter (Google Fonts) loaded via `next/font/google` and applied globally via the CSS variable `--font-sans`.

**Animations:** Framer Motion is used for fade-in transitions and component-level animations. The `FadeIn.tsx` component wraps content in a reusable motion wrapper.

---

## 19. Admin Quick Setup

For a fresh deployment, follow these steps to configure the first admin account:

1. Deploy the app and run `npx prisma db push`
2. Register a user account at `/register`
3. Connect to your database (Supabase Table Editor or Prisma Studio):
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```
4. Log out and log back in — you will be redirected to `/admin/dashboard`
5. From the admin panel, go to **Site Settings** to configure basic platform info
6. Go to **Homepage** to populate the CMS content
7. Go to **Courses → Sync to Algolia** to enable search

See `scripts/quick_admin_setup.md` for more detailed instructions.

---

## 20. Known Gaps & Future Work

The following features are **not yet implemented** or are **incomplete**. They are the primary areas for incoming developer work:

### 🔴 High Priority

| Feature | Status | Notes |
|---|---|---|
| **AI Chatbot** | ❌ Not started | No AI SDK, no chat UI, no API route. Recommend: Vercel AI SDK + Google Gemini or OpenAI |
| **Certificate PDF Generation** | ⚠️ Mocked | `certificateUrl` is a fake path like `/certificates/{uuid}.pdf`. No PDF generation library installed. Recommend: `@react-pdf/renderer` or Puppeteer |
| **Payment Flow (End-to-End)** | ⚠️ Verify | Route folders exist but full payment flow should be tested. The "Upgrade Plan" buttons in sidebars trigger `alert("coming soon!")` |

### 🟠 Medium Priority

| Feature | Status | Notes |
|---|---|---|
| **Blog Public Frontend** | ⚠️ Incomplete | Admin CMS works. The public `/blog/[slug]` individual post page likely needs to be built |
| **Assignment File Upload** | ⚠️ Incomplete | `AssignmentTab.tsx` exists but student file upload UI (to Supabase Storage) needs implementation |
| **Real-Time Notifications** | ❌ Not started | Notifications are polled on demand. Consider Supabase Realtime for push delivery |
| **Learning Path Student UI** | ⚠️ Verify | Admin can manage paths; student-facing path detail needs verification |

### 🟡 Low Priority

| Feature | Status | Notes |
|---|---|---|
| **Stripe Integration** | ❌ Not started | Payment model supports "stripe" gateway string but only Paystack is wired up |
| **Subscription / Pro Tier** | ❌ Not started | UI placeholders exist ("Upgrade Plan"), but no billing logic |
| **Resource Downloads** | ❌ Not started | `Course.resourcesCount` field exists but no upload/download system |
| **OG Image** | ⚠️ Missing asset | `layout.tsx` references `/og-image.jpg` — this file may not exist in `/public` |
| **Password Reset Page** | ⚠️ Verify | Supabase handles this natively but a custom UI page may be missing |
| **Email Templates** | ⚠️ Improve | Templates are raw HTML strings — consider migrating to `@react-email/components` |

---

## License

Proprietary — All rights reserved by **Clean Tech Hub**.  
Unauthorized copying, distribution, or modification of this codebase is strictly prohibited.
