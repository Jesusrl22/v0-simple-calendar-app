-- Add invite_token column to teams table if it doesn't exist
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

-- Generate invite tokens for existing teams that don't have one
UPDATE teams
SET invite_token = encode(gen_random_bytes(24), 'hex')
WHERE invite_token IS NULL;

-- Make invite_token not nullable and ensure uniqueness
ALTER TABLE teams
ALTER COLUMN invite_token SET NOT NULL;

-- Create index on invite_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_invite_token ON teams(invite_token);
