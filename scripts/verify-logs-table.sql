-- Verify and fix habit_logs RLS
ALTER TABLE habit_logs DISABLE ROW LEVEL SECURITY;

-- Verify table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'habit_logs' ORDER BY ordinal_position;
