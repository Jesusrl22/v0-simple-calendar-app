-- Add notification_type column to sent_notifications for proper deduplication
-- This allows tracking both "reminder" (10 min before) and "now" (at event time) separately

ALTER TABLE sent_notifications
  ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'reminder';

-- Index for faster dedup lookups
CREATE INDEX IF NOT EXISTS sent_notifications_type_idx
  ON sent_notifications(event_id, notification_type);
