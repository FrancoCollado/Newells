-- Ensure document is unique for players to use it as login identifier
ALTER TABLE public.players
ADD CONSTRAINT players_document_key UNIQUE (document);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_document ON public.players(document);
