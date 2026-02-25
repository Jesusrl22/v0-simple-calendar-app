-- Create user_reviews table for landing page testimonials
CREATE TABLE IF NOT EXISTS public.user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view approved reviews"
  ON public.user_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON public.user_reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own reviews"
  ON public.user_reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON public.user_reviews FOR DELETE
  USING (user_id = auth.uid());

-- Create index for sorting by rating
CREATE INDEX idx_reviews_rating ON public.user_reviews(rating DESC);
CREATE INDEX idx_reviews_helpful ON public.user_reviews(helpful_count DESC);
CREATE INDEX idx_reviews_created_at ON public.user_reviews(created_at DESC);
