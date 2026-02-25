-- Add subscription_expires_at column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at ON users(subscription_expires_at);

-- Update existing users with NULL expiration (unlimited)
UPDATE users SET subscription_expires_at = NULL WHERE subscription_expires_at IS NULL;
