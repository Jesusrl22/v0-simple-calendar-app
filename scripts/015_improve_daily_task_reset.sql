-- Update the reset_daily_tasks function to reset tasks from the previous day
CREATE OR REPLACE FUNCTION reset_daily_tasks()
RETURNS void AS $$
BEGIN
  -- Reset tasks that were completed on a previous day (compare dates, not timestamps)
  UPDATE tasks
  SET 
    completed = false,
    completed_at = NULL,
    updated_at = NOW()
  WHERE 
    completed = true 
    AND completed_at IS NOT NULL
    -- Compare just the dates in UTC
    AND DATE(completed_at AT TIME ZONE 'UTC') < DATE(NOW() AT TIME ZONE 'UTC');
END;
$$ LANGUAGE plpgsql;

-- This will reset all tasks that were completed on any day before today
-- For example, if a task was completed yesterday at 23:59, it will be reset at 00:00 today
