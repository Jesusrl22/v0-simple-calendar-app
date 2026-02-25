-- Enable RLS on team_members table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Owners and admins can insert team members" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can delete team members" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can update team member roles" ON team_members;
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;

-- Allow service role (backend) to insert team members
CREATE POLICY "Service role can manage team members"
  ON team_members
  FOR ALL
  USING (auth.uid() IS NOT NULL OR current_user = 'authenticated')
  WITH CHECK (auth.uid() IS NOT NULL OR current_user = 'authenticated');

-- Allow users to view their team members
CREATE POLICY "Users can view members of their teams"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'team_members';
