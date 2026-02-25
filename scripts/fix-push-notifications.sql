-- Fix push_subscriptions table to match expected column names and add missing data
ALTER TABLE push_subscriptions
ADD COLUMN IF NOT EXISTS p256dh_key TEXT;

ALTER TABLE push_subscriptions
ADD COLUMN IF NOT EXISTS auth_key TEXT;

-- Copy data from old columns to new ones if they don't exist
UPDATE push_subscriptions 
SET p256dh_key = p256dh 
WHERE p256dh_key IS NULL AND p256dh IS NOT NULL;

UPDATE push_subscriptions 
SET auth_key = auth 
WHERE auth_key IS NULL AND auth IS NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Ensure RLS is enabled
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

COMMIT;
