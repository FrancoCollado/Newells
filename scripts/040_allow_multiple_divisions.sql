-- Convert division column to text array to allow multiple divisions
-- 1. Rename existing column
ALTER TABLE public.players RENAME COLUMN division TO division_old;

-- 2. Create new array column
ALTER TABLE public.players ADD COLUMN division text[] DEFAULT '{}'::text[];

-- 3. Migrate data
UPDATE public.players SET division = ARRAY[division_old];

-- 4. (Optional) Remove old column - keeping it commented for safety until verified
-- ALTER TABLE public.players DROP COLUMN division_old;
