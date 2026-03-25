-- Clean up unverified users and verify real users
-- This script verifies 3 real users and removes bot/spam registrations

-- Mark the 3 real users as verified
UPDATE public.users 
SET email_verified = true, updated_at = NOW()
WHERE email IN ('alvaro19dvg@gmail.com', 'cristina232345@hotmail.com', 'jesusrayaleon1@gmail.com');

-- Delete all other users (keep only the 3 verified ones)
DELETE FROM public.users
WHERE email NOT IN ('alvaro19dvg@gmail.com', 'cristina232345@hotmail.com', 'jesusrayaleon1@gmail.com');

-- Also clean up user_credentials for deleted users
DELETE FROM public.user_credentials
WHERE email NOT IN ('alvaro19dvg@gmail.com', 'cristina232345@hotmail.com', 'jesusrayaleon1@gmail.com');

-- Verify the result
SELECT id, email, email_verified, created_at FROM public.users ORDER BY created_at DESC;
