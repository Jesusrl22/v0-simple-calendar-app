-- Create table to track sent notifications to avoid duplicates
CREATE TABLE IF NOT EXISTS sent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS sent_notifications_event_id_idx ON sent_notifications(event_id);
CREATE INDEX IF NOT EXISTS sent_notifications_user_id_idx ON sent_notifications(user_id);
CREATE INDEX IF NOT EXISTS sent_notifications_sent_at_idx ON sent_notifications(sent_at);

-- Enable RLS
ALTER TABLE sent_notifications ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own sent notifications
CREATE POLICY "Users can view their own sent notifications"
  ON sent_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow service role to insert
CREATE POLICY "Service role can insert sent notifications"
  ON sent_notifications
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE sent_notifications IS 'Tracks which notifications have been sent to avoid duplicates';
