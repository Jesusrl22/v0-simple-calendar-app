-- Drop the automatic user creation trigger that's causing issues
-- This trigger tries to create a profile in the users table when a user is created in auth.users
-- but it doesn't pass the 'name' field, causing a NOT NULL constraint violation

-- First, check if the trigger exists and drop it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Also drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Note: After running this script, profiles will need to be created manually via the API
