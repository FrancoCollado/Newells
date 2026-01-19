-- Create odontogramas table to store dental diagrams
CREATE TABLE IF NOT EXISTS public.odontogramas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_odontogramas_player_id ON public.odontogramas(player_id);
CREATE INDEX IF NOT EXISTS idx_odontogramas_uploaded_by ON public.odontogramas(uploaded_by);

-- Enable Row Level Security
ALTER TABLE public.odontogramas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view odontogramas if they have access to the player
CREATE POLICY "Users can view odontogramas" ON public.odontogramas
  FOR SELECT
  USING (true);

-- Policy: Only odontologos and dirigentes can insert odontogramas
CREATE POLICY "Odontologos and dirigentes can insert odontogramas" ON public.odontogramas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('odontologo', 'dirigente')
    )
  );

-- Policy: Only the uploader or dirigentes can delete odontogramas
CREATE POLICY "Uploader and dirigentes can delete odontogramas" ON public.odontogramas
  FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'dirigente'
    )
  );

-- Add comment to document the table
COMMENT ON TABLE public.odontogramas IS 'Stores dental diagrams (odontogramas) uploaded by dentists for players';
