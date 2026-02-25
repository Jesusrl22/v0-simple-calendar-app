-- Disable RLS completely on team_members to allow team invite functionality
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'team_members';
