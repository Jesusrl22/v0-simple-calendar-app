-- Add streaks and gamification system
-- This adds daily streak tracking and productivity stats

-- Add streak columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS total_tasks_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_study_hours DECIMAL(10,2) DEFAULT 0;

-- Create daily activity log table
CREATE TABLE IF NOT EXISTS daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  pomodoros_completed INTEGER DEFAULT 0,
  study_minutes INTEGER DEFAULT 0,
  ai_queries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_activities
CREATE POLICY "Users can view own daily activities"
ON daily_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily activities"
ON daily_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily activities"
ON daily_activities FOR UPDATE
USING (auth.uid() = user_id);

COMMIT;
