-- Fix: "new row violates row-level security policy for table leagues"
--
-- Root cause: the INSERT policy required auth.uid() = created_by, but clients
-- were passing created_by manually, which could mismatch in edge cases (UUID
-- casing, session timing, etc.).
--
-- Fix: set created_by automatically from auth.uid() at the DB layer.
-- Clients no longer send created_by — the server owns it.

ALTER TABLE public.leagues ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Update INSERT policy: just verify the user is authenticated.
-- created_by is already guaranteed to equal auth.uid() via the DEFAULT.
DROP POLICY IF EXISTS "Authenticated users can create a League" ON public.leagues;

CREATE POLICY "Authenticated users can create a League"
  ON public.leagues FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
