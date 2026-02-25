-- Completely disable RLS on team_members table to allow inserts
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'team_members' 
AND schemaname = 'public';
