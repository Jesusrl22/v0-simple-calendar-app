-- Improved reset_daily_tasks function that handles timezone properly
CREATE OR REPLACE FUNCTION reset_daily_tasks()
RETURNS TABLE(reset_count int) AS $$
DECLARE
  v_reset_count int;
BEGIN
  -- Reset tasks that were completed on ANY previous day (not today)
  -- This checks if the date of completed_at (in any timezone) is BEFORE today's date (in UTC)
  UPDATE tasks
  SET 
    completed = false,
    completed_at = NULL,
    updated_at = NOW()
  WHERE 
    completed = true 
    AND completed_at IS NOT NULL
    -- Only reset tasks from PREVIOUS days, not from today
    AND DATE(completed_at) < CURRENT_DATE;

  -- Get count of reset tasks
  GET DIAGNOSTICS v_reset_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_reset_count;
END;
$$ LANGUAGE plpgsql;

-- Also add an index to make this faster
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at DESC) WHERE completed = true;
