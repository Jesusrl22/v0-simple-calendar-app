-- : Change theme_preference column to JSONB to store custom colors
ALTER TABLE users 
ALTER COLUMN theme_preference TYPE jsonb USING theme_preference::jsonb;

-- Add comment
COMMENT ON COLUMN users.theme_preference IS 'Stores custom theme configuration including custom colors for Pro users';
