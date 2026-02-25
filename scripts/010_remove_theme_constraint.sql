-- Remove the theme check constraint to allow custom themes
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_theme_check;

-- Add comment
COMMENT ON COLUMN users.theme IS 'Theme identifier - can be any theme name from the theme system';
