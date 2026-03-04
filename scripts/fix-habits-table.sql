-- Fix habits table: rename title to name to match API
ALTER TABLE public.habits RENAME COLUMN title TO name;
