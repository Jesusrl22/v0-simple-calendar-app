-- Drop existing function first
DROP FUNCTION IF EXISTS public.reset_daily_tasks() CASCADE;

-- Create improved reset function that properly handles daily resets
CREATE OR REPLACE FUNCTION public.reset_daily_tasks()
RETURNS void AS $$
BEGIN
  -- Reset tasks completed before today (using date comparison, not time)
  UPDATE tasks
  SET completed = false, completed_at = NULL
  WHERE completed = true
  AND DATE(completed_at AT TIME ZONE 'UTC') < CURRENT_DATE
  AND user_id IS NOT NULL;
  
  RAISE NOTICE 'Tasks reset: % rows affected', FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance on completed_at queries
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at_date ON tasks(user_id, completed) 
  WHERE completed = true;

-- Ensure function is executable by authenticated users
GRANT EXECUTE ON FUNCTION public.reset_daily_tasks() TO authenticated;
