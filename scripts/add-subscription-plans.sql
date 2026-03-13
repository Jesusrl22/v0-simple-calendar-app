-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC,
  currency VARCHAR(3) DEFAULT 'USD',
  max_habits INTEGER,
  max_tasks INTEGER,
  max_notes INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default plans
INSERT INTO subscription_plans (name, slug, description, price, max_habits, max_tasks, max_notes, features, is_active)
VALUES 
  ('Free', 'free', 'Get started with Future Task', 0, 5, 50, 20, '["basic_habits", "basic_tasks", "basic_notes"]'::jsonb, true),
  ('Pro', 'pro', 'Unlimited habits and advanced features', 9.99, -1, -1, -1, '["unlimited_habits", "unlimited_tasks", "unlimited_notes", "ai_assistant", "team_collaboration"]'::jsonb, true),
  ('Premium', 'premium', 'All features plus priority support', 19.99, -1, -1, -1, '["unlimited_habits", "unlimited_tasks", "unlimited_notes", "ai_assistant", "team_collaboration", "priority_support", "custom_integrations"]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

-- Update user plan column to reference subscription_plans if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'free';

-- Create RLS policies for subscription_plans table
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = true);
