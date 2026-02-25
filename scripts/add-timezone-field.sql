-- Add timezone field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';

-- Update existing users to use UTC by default
UPDATE users SET timezone = 'UTC' WHERE timezone IS NULL;
