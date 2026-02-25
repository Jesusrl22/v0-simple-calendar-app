-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'team_members';

-- Disable RLS on team_members if enabled
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on team_members
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can insert team members" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can update team member roles" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can delete team members" ON team_members;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'team_members'
ORDER BY ordinal_position;

-- Check if there are any existing team_members records
SELECT COUNT(*) as member_count FROM team_members;

-- Verify teams table has data
SELECT COUNT(*) as team_count FROM teams;
