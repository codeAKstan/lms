# Quick Admin Setup Guide

## Problem
- Users register but emails are not being sent for confirmation
- Can't login because Supabase requires email verification by default
- Need immediate access to admin/instructor dashboards

## Quick Solution (Do this first - 2 minutes)

### Step 1: Disable Email Confirmation in Supabase
1. Go to https://supabase.com/dashboard
2. Select your project: `apcvtljzwgtqjwjkcjlt`
3. Navigate to: **Authentication** → **Providers** → **Email**
4. **Disable** the "Confirm email" toggle
5. Click **Save**

This will allow users to login immediately without email confirmation.

### Step 2: Get Your Service Role Key (For the script)
1. In Supabase Dashboard, go to: **Settings** → **API**
2. Copy the `service_role` key (under "Project API keys")
3. Add it to your `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### Step 3: Run the Super Admin Creation Script
```bash
npx tsx scripts/create_super_admin.ts
```

This will create:
- **Email:** admin@cleantech.com
- **Password:** Admin@123456
- **Role:** ADMIN (can access all dashboards)

## Alternative: Manually Confirm Existing Users

If you already registered an account, you can manually confirm it:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user
3. Click the user → Change "Email Confirmed" to **true**
4. Then update the role in the database using the existing script:
   ```bash
   # Update the email in scripts/promote_user.ts to your email
   npx tsx scripts/promote_user.ts
   ```

## After Setup
Once logged in, **IMMEDIATELY CHANGE YOUR PASSWORD** via the settings page!

## Access Dashboards
- Admin: http://localhost:3000/admin/dashboard
- Instructor: http://localhost:3000/instructor/dashboard
- Student: http://localhost:3000/student/courses
