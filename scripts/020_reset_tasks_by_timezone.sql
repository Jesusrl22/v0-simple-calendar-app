-- Create improved reset function that respects user timezone
-- This function will reset tasks completed before today (in the user's local timezone)
DROP FUNCTION IF EXISTS public.reset_daily_tasks() CASCADE;
DROP FUNCTION IF EXISTS public.reset_daily_tasks_by_timezone() CASCADE;

CREATE OR REPLACE FUNCTION public.reset_daily_tasks()
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_timezone text;
  v_user_date date;
  v_reset_count int := 0;
BEGIN
  -- Get all active users
  FOR v_user_id, v_timezone IN 
    SELECT id, COALESCE(timezone, 'UTC') FROM users WHERE id IS NOT NULL
  LOOP
    BEGIN
      -- Get today's date in the user's timezone
      v_user_date := CURRENT_DATE AT TIME ZONE v_timezone;
      
      -- Reset completed tasks that were completed BEFORE today (in user's timezone)
      UPDATE tasks
      SET completed = false, completed_at = NULL
      WHERE user_id = v_user_id
        AND completed = true
        AND (completed_at AT TIME ZONE v_timezone)::date < v_user_date;
      
      v_reset_count := v_reset_count + FOUND::int;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with other users
      RAISE NOTICE 'Error resetting tasks for user %: %', v_user_id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Daily task reset completed. Total tasks reset: %', v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create main function that will be called by CRON endpoint
CREATE OR REPLACE FUNCTION public.reset_daily_tasks_by_timezone()
RETURNS TABLE(users_processed int, tasks_reset int) AS $$
DECLARE
  v_user_id uuid;
  v_timezone text;
  v_user_date date;
  v_reset_count int := 0;
  v_user_count int := 0;
BEGIN
  -- Get all active users with their timezones
  FOR v_user_id, v_timezone IN 
    SELECT id, COALESCE(timezone, 'UTC') FROM users WHERE id IS NOT NULL
  LOOP
    BEGIN
      v_user_count := v_user_count + 1;
      
      -- Get today's date in the user's timezone
      v_user_date := CURRENT_DATE AT TIME ZONE v_timezone;
      
      -- Reset completed tasks that were completed BEFORE today (in user's timezone)
      UPDATE tasks
      SET completed = false, completed_at = NULL
      WHERE user_id = v_user_id
        AND completed = true
        AND (completed_at AT TIME ZONE v_timezone)::date < v_user_date;
      
      v_reset_count := v_reset_count + FOUND::int;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with other users
      RAISE NOTICE 'Error resetting tasks for user %: %', v_user_id, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_user_count, v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_state ON tasks(user_id, completed) WHERE completed = true;
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

-- Ensure functions are executable by authenticated users and service role
GRANT EXECUTE ON FUNCTION public.reset_daily_tasks() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reset_daily_tasks_by_timezone() TO authenticated, service_role;

-- Optional: Create a helper function to check if it's midnight for a specific user
CREATE OR REPLACE FUNCTION public.should_reset_tasks_for_user(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_timezone text;
  v_user_hour int;
BEGIN
  SELECT COALESCE(timezone, 'UTC') INTO v_timezone FROM users WHERE id = p_user_id;
  
  -- Get the current hour in the user's timezone
  v_user_hour := EXTRACT(HOUR FROM NOW() AT TIME ZONE v_timezone);
  
  -- Reset between 11:55 PM and 12:05 AM to catch the reset
  RETURN v_user_hour = 0 OR (EXTRACT(MINUTE FROM NOW() AT TIME ZONE v_timezone) >= 55 AND v_user_hour = 23);
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.should_reset_tasks_for_user(uuid) TO authenticated, service_role;
