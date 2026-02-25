-- Add last login tracking columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Create index on last_login_at for performance
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at DESC);

-- Create index on last_login_ip for device detection
CREATE INDEX IF NOT EXISTS idx_users_last_login_ip ON users(last_login_ip);

COMMENT ON COLUMN users.last_login_ip IS 'IP address of last login - used to detect new devices';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last login';
