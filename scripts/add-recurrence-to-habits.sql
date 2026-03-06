-- Add recurrence fields to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS recurrence_type TEXT DEFAULT 'daily';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS recurrence_days TEXT DEFAULT NULL;

-- recurrence_type: 'daily' (all days) or 'custom' (specific days)
-- recurrence_days: JSON array like '[1,3,5]' for Mon, Wed, Fri (0=Sunday, 1=Monday, etc.)
