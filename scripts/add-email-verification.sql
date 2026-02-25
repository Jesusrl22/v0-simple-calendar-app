-- Add email_verified column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Update existing users to verified (since they were auto-confirmed before)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
