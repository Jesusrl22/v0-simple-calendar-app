-- Add new columns for PayPal credit system
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ai_credits_monthly INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_credits_purchased INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS last_credit_reset TIMESTAMP;

-- Update existing users to have separate monthly and purchased credits
-- Move current ai_credits to ai_credits_monthly for premium/pro users
UPDATE users 
SET ai_credits_monthly = CASE 
  WHEN subscription_plan = 'premium' THEN 100
  WHEN subscription_plan = 'pro' THEN 500
  ELSE 0
END,
ai_credits_purchased = 0
WHERE ai_credits_monthly IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_paypal_subscription ON users(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_last_credit_reset ON users(last_credit_reset);

-- Add comment to explain the credit system
COMMENT ON COLUMN users.ai_credits_monthly IS 'Monthly credits that reset each month based on subscription plan';
COMMENT ON COLUMN users.ai_credits_purchased IS 'Purchased credits that never expire';
COMMENT ON COLUMN users.paypal_subscription_id IS 'PayPal subscription ID for recurring payments';
COMMENT ON COLUMN users.last_credit_reset IS 'Last time monthly credits were reset';
