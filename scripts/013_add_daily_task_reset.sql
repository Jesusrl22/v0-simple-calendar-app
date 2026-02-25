-- Add a column to track when tasks were completed
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update existing completed tasks with current timestamp
UPDATE tasks SET completed_at = updated_at WHERE completed = true AND completed_at IS NULL;

-- Create a function to reset daily tasks (tasks completed more than 24 hours ago)
CREATE OR REPLACE FUNCTION reset_daily_tasks()
RETURNS void AS $$
BEGIN
  -- Reset tasks that were completed more than 24 hours ago
  UPDATE tasks
  SET 
    completed = false,
    completed_at = NULL,
    updated_at = NOW()
  WHERE 
    completed = true 
    AND completed_at IS NOT NULL
    AND completed_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function that updates completed_at when a task is marked as completed
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = false THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS task_completed_trigger ON tasks;
CREATE TRIGGER task_completed_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_at();

-- Note: To run the reset function daily, you can:
-- 1. Use a cron job on your server
-- 2. Use Supabase's pg_cron extension (if available)
-- 3. Call it from your application at midnight

-- Example: To enable pg_cron (if you have permissions):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('reset-daily-tasks', '0 0 * * *', 'SELECT reset_daily_tasks()');
