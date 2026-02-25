-- Add invite_token column to teams table if it doesn't exist
ALTER TABLE teams ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text;

-- Update existing teams that don't have a token
UPDATE teams SET invite_token = gen_random_uuid()::text WHERE invite_token IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_invite_token ON teams(invite_token);
