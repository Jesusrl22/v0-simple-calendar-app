-- Disable RLS completely on team_members to allow inserts
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'team_members' 
AND schemaname = 'public';
