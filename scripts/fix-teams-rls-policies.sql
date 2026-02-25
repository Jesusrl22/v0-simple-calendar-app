-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Owners and admins can update teams" ON teams;
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can insert team members" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can delete team members" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can update team member roles" ON team_members;
DROP POLICY IF EXISTS "Users can view invitations for their teams" ON team_invitations;
DROP POLICY IF EXISTS "Owners and admins can insert invitations" ON team_invitations;
DROP POLICY IF EXISTS "Owners and admins can update invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team members can view team tasks" ON team_tasks;
DROP POLICY IF EXISTS "Team members can insert tasks" ON team_tasks;
DROP POLICY IF EXISTS "Team members can update tasks" ON team_tasks;
DROP POLICY IF EXISTS "Team members can delete tasks" ON team_tasks;
DROP POLICY IF EXISTS "Team members can view team events" ON team_events;
DROP POLICY IF EXISTS "Team members can insert events" ON team_events;
DROP POLICY IF EXISTS "Team members can update events" ON team_events;
DROP POLICY IF EXISTS "Team members can delete events" ON team_events;
DROP POLICY IF EXISTS "Team members can view team notes" ON team_notes;
DROP POLICY IF EXISTS "Team members can insert notes" ON team_notes;
DROP POLICY IF EXISTS "Team members can update notes" ON team_notes;
DROP POLICY IF EXISTS "Team members can delete notes" ON team_notes;
DROP POLICY IF EXISTS "Team members can view task comments" ON task_comments;
DROP POLICY IF EXISTS "Team members can insert comments" ON task_comments;

-- RLS Policies for teams (fixed - avoid recursion)
CREATE POLICY "Users can view teams they own" ON teams
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view teams where they are members" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own teams" ON teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their teams" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Admins can update teams" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid() 
      AND team_members.role = 'admin'
    )
  );

CREATE POLICY "Owners can delete teams" ON teams
  FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for team_members (fixed - avoid recursion)
CREATE POLICY "Users can view their own membership" ON team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team owners can view all members" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can view all members" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "Team owners can insert members" ON team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can insert members" ON team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "Team owners can delete members" ON team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can delete members" ON team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "Team owners can update member roles" ON team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update member roles" ON team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
  );

-- RLS Policies for team_invitations (fixed)
CREATE POLICY "Users can view invitations to their email" ON team_invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Team owners can view team invitations" ON team_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can view team invitations" ON team_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_invitations.team_id 
      AND team_members.user_id = auth.uid() 
      AND team_members.role = 'admin'
    )
  );

CREATE POLICY "Team owners can create invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can create invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_invitations.team_id 
      AND team_members.user_id = auth.uid() 
      AND team_members.role = 'admin'
    )
  );

CREATE POLICY "Team owners can update invitations" ON team_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update invitations" ON team_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_invitations.team_id 
      AND team_members.user_id = auth.uid() 
      AND team_members.role = 'admin'
    )
  );

-- RLS Policies for team_tasks (fixed)
CREATE POLICY "Team members can view team tasks" ON team_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_tasks.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert tasks" ON team_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_tasks.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update tasks" ON team_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_tasks.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete tasks" ON team_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_tasks.team_id 
      AND team_members.user_id = auth.uid() 
      AND team_members.role IN ('owner', 'admin', 'member')
    )
  );

-- RLS Policies for team_events (fixed)
CREATE POLICY "Team members can view team events" ON team_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_events.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert events" ON team_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_events.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update events" ON team_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_events.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete events" ON team_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_events.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

-- RLS Policies for team_notes (fixed)
CREATE POLICY "Team members can view team notes" ON team_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_notes.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert notes" ON team_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_notes.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update notes" ON team_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_notes.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete notes" ON team_notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_notes.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

-- RLS Policies for task_comments (fixed)
CREATE POLICY "Team members can view task comments" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_tasks 
      JOIN team_members ON team_tasks.team_id = team_members.team_id
      WHERE team_tasks.id = task_comments.task_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert comments" ON task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_tasks 
      JOIN team_members ON team_tasks.team_id = team_members.team_id
      WHERE team_tasks.id = task_comments.task_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comments" ON task_comments
  FOR DELETE USING (user_id = auth.uid());
