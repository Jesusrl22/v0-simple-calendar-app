-- Add new columns to users table for separating monthly and purchased credits
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_credits_monthly INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_credits_purchased INTEGER DEFAULT 0;

-- Migrate existing ai_credits to ai_credits_monthly for existing users
UPDATE users 
SET ai_credits_monthly = ai_credits, 
    ai_credits_purchased = 0 
WHERE ai_credits_monthly IS NULL;

-- The ai_credits column will now be calculated as (ai_credits_monthly + ai_credits_purchased)
-- But we keep it for backwards compatibility

-- Create a table to track credit pack purchases
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits_amount INTEGER NOT NULL,
  price_paid NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for credit_purchases
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit purchases" ON credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit purchases" ON credit_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
