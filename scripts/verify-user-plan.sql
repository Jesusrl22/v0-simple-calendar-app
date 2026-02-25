-- Script to verify user plan and credits in the database
-- Replace 'your-email@example.com' with the actual user email you want to check

SELECT 
  id,
  email,
  name,
  subscription_plan,
  subscription_tier,
  plan,
  ai_credits_monthly,
  ai_credits_purchased,
  subscription_expires_at,
  last_credit_reset,
  created_at,
  updated_at
FROM users
WHERE email = 'your-email@example.com';

-- To check ALL columns available in users table:
-- SELECT * FROM users WHERE email = 'your-email@example.com';
