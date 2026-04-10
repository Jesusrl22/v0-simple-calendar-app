-- Fix push_subscriptions constraint
-- Remove old constraint and add new one with UNIQUE(endpoint) only

-- First, drop the old unique constraint if it exists
ALTER TABLE push_subscriptions 
DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_endpoint_key;

-- Add new unique constraint on endpoint only
ALTER TABLE push_subscriptions 
ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE(endpoint);
