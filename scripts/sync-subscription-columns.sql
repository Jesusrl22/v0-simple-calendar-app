-- Script to synchronize all subscription-related columns
-- This ensures consistency across subscription_plan, subscription_tier, and plan columns

-- Update all three plan columns to be consistent
UPDATE users 
SET 
  subscription_tier = COALESCE(LOWER(subscription_plan), LOWER(subscription_tier), LOWER(plan), 'free'),
  subscription_plan = COALESCE(LOWER(subscription_plan), LOWER(subscription_tier), LOWER(plan), 'free'),
  plan = COALESCE(LOWER(subscription_plan), LOWER(subscription_tier), LOWER(plan), 'free');

-- Set correct monthly credits based on plan
UPDATE users 
SET ai_credits_monthly = CASE 
  WHEN subscription_tier = 'pro' THEN 500
  WHEN subscription_tier = 'premium' THEN 100
  ELSE 0
END;

-- Ensure ai_credits_purchased is not null
UPDATE users 
SET ai_credits_purchased = 0 
WHERE ai_credits_purchased IS NULL;

-- Remove the old ai_credits column data (keep structure but zero it out)
UPDATE users 
SET ai_credits = 0;
