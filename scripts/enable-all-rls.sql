-- Added team_notes table to enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notes ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('teams', 'team_members', 'team_invitations', 'team_tasks', 'task_comments', 'team_events', 'team_notes') ORDER BY tablename;
