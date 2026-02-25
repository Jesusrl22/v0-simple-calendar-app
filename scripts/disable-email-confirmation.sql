-- Script to disable email confirmation in Supabase Auth
-- This allows users to sign up and log in immediately without needing to confirm their email

-- IMPORTANT: This should be run in your Supabase SQL Editor
-- Go to: https://app.supabase.com/project/YOUR_PROJECT/sql/new

-- Note: You can also do this from the Supabase Dashboard:
-- 1. Go to Authentication > Settings
-- 2. Under "Email Auth" section
-- 3. Toggle OFF "Enable email confirmations"

-- If you prefer SQL, this is handled by Supabase's auth configuration
-- which is not directly modifiable via SQL

-- Instead, you need to:
-- 1. Go to https://supabase.com/dashboard/project/tdlrurbsfbdwpwwwzvqh/settings/auth
-- 2. Scroll to "Email Auth"
-- 3. Disable "Enable email confirmations"
-- 4. Save changes

-- For development, you can also set up email redirect URLs:
-- Site URL: http://localhost:3000
-- Redirect URLs: http://localhost:3000/**
