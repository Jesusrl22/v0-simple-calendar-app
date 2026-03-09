-- Fix recurrence_days column: change from TEXT to JSONB
ALTER TABLE habits ALTER COLUMN recurrence_days TYPE JSONB USING
  CASE
    WHEN recurrence_days IS NULL THEN '[0,1,2,3,4,5,6]'::jsonb
    WHEN recurrence_days::text LIKE '[%' THEN recurrence_days::jsonb
    ELSE '[0,1,2,3,4,5,6]'::jsonb
  END;

-- Set default to all days for existing habits without recurrence_days
UPDATE habits SET recurrence_days = '[0,1,2,3,4,5,6]'::jsonb WHERE recurrence_days IS NULL;

-- Set default for new habits
ALTER TABLE habits ALTER COLUMN recurrence_days SET DEFAULT '[0,1,2,3,4,5,6]'::jsonb;
