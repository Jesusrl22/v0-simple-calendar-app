-- Fix team_messages RLS policies to be simpler and work correctly

-- First, drop old policies
DROP POLICY IF EXISTS "Users can view messages from their teams" ON team_messages;
DROP POLICY IF EXISTS "Users can create messages in their teams" ON team_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON team_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON team_messages;

-- Create simpler RLS policies that check team ownership/membership
-- For SELECT: Users can view messages if they're part of the team (owner or member)
CREATE POLICY "Users can view messages from their teams"
  ON team_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_messages.team_id 
        AND (teams.user_id = auth.uid() OR teams.id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        ))
    )
  );

-- For INSERT: Users can create messages if they're part of the team and creating as themselves
CREATE POLICY "Users can create messages in their teams"
  ON team_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_messages.team_id 
        AND (teams.user_id = auth.uid() OR teams.id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        ))
    )
  );

-- For UPDATE: Users can only update their own messages
CREATE POLICY "Users can update their own messages"
  ON team_messages FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- For DELETE: Users can only delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON team_messages FOR DELETE
  USING (user_id = auth.uid());
