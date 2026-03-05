-- Disable RLS on habits tables since the app uses its own JWT auth
-- and filters by user_id in the query directly

ALTER TABLE habits DISABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own habits" ON habits;
DROP POLICY IF EXISTS "Users can manage their own habit logs" ON habit_logs;
