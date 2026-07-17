-- Migration: add ville (city) column to profiles
-- Date: 2026-07-17
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ville text;

-- Optional: backfill ville from existing fokontany relation if available
-- UPDATE public.profiles p
-- SET ville = f.district
-- FROM public.fokontany f
-- WHERE p.fokontany_id = f.id;
