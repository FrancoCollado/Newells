-- Add attendance_percentage column to players table
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS attendance_percentage numeric DEFAULT 100;

-- Add comment to explain the column
COMMENT ON COLUMN public.players.attendance_percentage IS 'Porcentaje de asistencia del jugador (0-100)';

-- Update existing players to have 100% attendance by default
UPDATE public.players
SET attendance_percentage = 100
WHERE attendance_percentage IS NULL;
