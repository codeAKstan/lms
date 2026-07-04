# Clean Tech Hub LMS - Project Documentation

## 1. Project Overview
**Clean Tech Hub LMS** is a full-stack, enterprise-grade Learning Management System tailored for clean technology education. It facilitates the creation, management, and consumption of educational content through three distinct portals:
- **Student Dashboard:** For exploring courses, tracking progress, computing hours learned, and achieving goals.
- **Instructor Dashboard:** For creating courses, organizing modules/lessons, and uploading video content.
- **Admin Dashboard:** For managing users, modifying roles, overseeing course publications, and analyzing platform-wide statistics.

## 2. Core Technology Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Database & ORM:** PostgreSQL managed via Prisma ORM
- **Authentication:** Supabase SSR Auth (Email/Password)
- **Video Processing & Streaming:** Mux API (with `@mux/mux-player-react`)
- **Search Engine:** Algolia (with `react-instantsearch`)
- **Rate Limiting & Caching:** Upstash Redis (`@upstash/ratelimit`)
- **Emails:** Resend
- **Background Jobs:** Upstash QStash
- **Deployment:** Vercel

---

## 3. Step-by-Step Build Process

### Phase 1: Foundation & Setup
1. **Next.js Initialization:** Initialized the project with Next.js App Router, enabling TypeScript and Tailwind CSS.
2. **Database Architecture:** Built out the Prisma `schema.prisma` defining complex relations: `User`, `Course`, `Module`, `Lesson`, `Enrollment`, `LessonProgress`, `StudentGoal`, and `Notification`.
3. **Authentication Integration:** Integrated Supabase for Server-Side Rendering (SSR) auth. Established the middleware (`src/middleware.ts`) to secure routes and enforce Role-Based Access Control (RBAC: `STUDENT`, `INSTRUCTOR`, `ADMIN`).

### Phase 2: Building the Dashboards
1. **Admin Portal:** Created tables for massive user management, allowing admins to mutate roles seamlessly and delete/unpublish non-compliant courses.
2. **Instructor Workflow:** Built forms to draft courses. Allowed instructors to sequence course modules and nest lessons within them.
3. **Student Experience:** Engineered a dynamic learning environment displaying interactive progress bars, last accessed lessons, and hours learned.

### Phase 3: Video Streaming Integration
1. **Mux Infrastructure:** Hooked into the Mux Video API to upload raw video files asynchronously.
2. **Webhook Listeners:** Designed serverless endpoints (`/api/mux/webhook`) to listen for Mux encoding completion, securing the endpoints with Webhook Signature validation.
3. **Playback Components:** Embedded `@mux/mux-player-react` into the student lesson view, ensuring optimized, adaptive bitrate streaming.

### Phase 4: Dynamic Marketing & Search
1. **Algolia Synchronization:** Created an admin-secured `/api/algolia/sync` route to batch push all published courses into an Algolia Index.
2. **Live Search Bar:** Implemented `react-instantsearch` on the marketing homepage (`/courses`) and header to provide sub-millisecond, typo-tolerant course discovery.
3. **Dynamic Statistics:** Updated the marketing frontend to execute fast Prisma aggregations (`count`), displaying live figures of Expert Instructors and Active Students.

### Phase 5: Security & Optimization
1. **Rate Limiting:** Integrated Upstash Redis into `middleware.ts`. Created dual-tiered limiters:
   - **Auth Gate:** 5 requests per minute to block brute-force scripts.
   - **Global Gate:** 200 requests per 10 seconds to protect against DDoS while comfortably handling Next.js background prefetching.
2. **Server Actions:** Migrated heavy data mutations (Course updates, Goal setting, Progress saving) from API routes to Next.js Server Actions for enhanced security and tighter React integration.
3. **Caching Strategies:** Tuned dynamic rendering (`export const dynamic = 'force-dynamic'`) on critical dashboards to ensure data freshness without sacrificing Vercel's edge performance.

## 4. Architecture Flow

1. **User Registers:** User signs up (`/register`) -> Supabase creates auth credentials -> Server inserts `STUDENT` row into Prisma database -> Middleware redirects to `/student/courses`.
2. **Course Creation:** Instructor drafts course -> Uploads video to Mux -> Receives `asset_id` -> Publishes Course.
3. **Enrollment:** Student clicks Enroll -> API verifies price & authentication -> Creates `Enrollment` record -> Resend emails confirmation -> Student accesses Mux player.
4. **Learn & Progress:** Student finishes video -> Client sends payload to `[lessonId]/progress` API -> Updates Redis/Prisma -> Dashboard progress bar dynamically expands.
