-- Add custom_themes column to users table for syncing custom themes across devices
-- Only PRO users can create custom themes

-- Add the custom_themes column (stores array of custom theme objects)
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_themes JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_custom_themes ON users USING GIN (custom_themes);

-- Add comment
COMMENT ON COLUMN users.custom_themes IS 'Array of custom themes created by PRO users, synced across devices';
