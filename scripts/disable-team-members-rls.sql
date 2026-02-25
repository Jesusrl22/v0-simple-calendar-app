-- Disable RLS on team_members table to allow service role to insert members
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'team_members';
