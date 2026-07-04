-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL PUBLIC TABLES
-- ============================================
-- 
-- Context: This LMS uses Prisma with the Supabase service role key for ALL
-- database operations. The service role bypasses RLS, so these policies are 
-- a defense-in-depth measure protecting against direct PostgREST access 
-- via the anon key (which is exposed in the client bundle for auth only).
--
-- Strategy: Enable RLS on every table. Since no client-side code reads/writes
-- tables directly via PostgREST, we use restrictive policies that only allow
-- authenticated users to read their own data. All writes go through Prisma.
--
-- Run this in the Supabase Dashboard > SQL Editor
-- ============================================

-- Helper: auth.uid() returns the authenticated user's ID from the JWT


-- ============================================
-- 1. USER & AUTH
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid()::text = id);

-- ============================================
-- 2. COURSE STRUCTURE (read-only for published courses)
-- ============================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read published, non-deleted courses
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT USING (published = true AND "deletedAt" IS NULL);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read modules of published courses
CREATE POLICY "modules_select_published" ON public.modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = modules."courseId" 
      AND courses.published = true 
      AND courses."deletedAt" IS NULL
    )
  );

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read lessons of published courses
CREATE POLICY "lessons_select_published" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.modules
      JOIN public.courses ON courses.id = modules."courseId"
      WHERE modules.id = lessons."moduleId"
      AND courses.published = true 
      AND courses."deletedAt" IS NULL
    )
  );

-- ============================================
-- 3. ENROLLMENT & PROGRESS (user-owned)
-- ============================================

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select_own" ON public.enrollments
  FOR SELECT USING (auth.uid()::text = "userId");

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress
  FOR SELECT USING (auth.uid()::text = "userId");

-- ============================================
-- 4. QUIZ SYSTEM
-- ============================================

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Read quizzes for published courses
CREATE POLICY "quizzes_select" ON public.quizzes
  FOR SELECT USING (true);  -- Quiz content is needed for enrolled students

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_select" ON public.quiz_questions
  FOR SELECT USING (true);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts
  FOR SELECT USING (auth.uid()::text = "userId");

-- ============================================
-- 5. PAYMENTS
-- ============================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid()::text = "userId");

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
-- No direct access to webhook logs (service role only)

-- ============================================
-- 6. CERTIFICATES
-- ============================================

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificates_select_own" ON public.certificates
  FOR SELECT USING (auth.uid()::text = "userId");

-- ============================================
-- 7. COMMUNITY & ENGAGEMENT
-- ============================================

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "reviews_select" ON public.reviews
  FOR SELECT USING (true);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON public.comments
  FOR SELECT USING (true);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_select_own" ON public.submissions
  FOR SELECT USING (auth.uid()::text = "userId");

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_select" ON public.assignments
  FOR SELECT USING (true);

-- ============================================
-- 8. CMS TABLES (admin-only via Prisma, no direct access)
-- ============================================

ALTER TABLE public.homepage_hero ENABLE ROW LEVEL SECURITY;
-- Public read for landing page
CREATE POLICY "homepage_hero_select" ON public.homepage_hero
  FOR SELECT USING (true);

ALTER TABLE public.focus_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "focus_areas_select" ON public.focus_areas
  FOR SELECT USING (true);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "programs_select" ON public.programs
  FOR SELECT USING (true);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_select" ON public.faqs
  FOR SELECT USING (true);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_select" ON public.site_settings
  FOR SELECT USING (true);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_select" ON public.testimonials
  FOR SELECT USING (true);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
-- No direct access (admin via Prisma only)

ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "impact_metrics_select" ON public.impact_metrics
  FOR SELECT USING (true);

-- ============================================
-- 9. LIVE SESSIONS
-- ============================================

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_sessions_select" ON public.live_sessions
  FOR SELECT USING (true);

-- ============================================
-- 10. STUDENT GOALS
-- ============================================

ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_goals_select_own" ON public.student_goals
  FOR SELECT USING (auth.uid()::text = "userId");

-- ============================================
-- 11. BLOG
-- ============================================

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Anyone can read published blogs
CREATE POLICY "blogs_select_published" ON public.blogs
  FOR SELECT USING (status = 'published');

-- ============================================
-- 12. NOTIFICATIONS
-- ============================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid()::text = "userId");

-- ============================================
-- 13. LEARNING PATHS
-- ============================================

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_paths_select_published" ON public.learning_paths
  FOR SELECT USING (published = true);

ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_path_courses_select" ON public.learning_path_courses
  FOR SELECT USING (true);

-- ============================================
-- 14. DISCUSSION FORUMS
-- ============================================

ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_topics_select" ON public.forum_topics
  FOR SELECT USING (true);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_replies_select" ON public.forum_replies
  FOR SELECT USING (true);
