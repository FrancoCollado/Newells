-- 045_add_eu_passport_to_players.sql
ALTER TABLE players ADD COLUMN IF NOT EXISTS has_eu_passport BOOLEAN DEFAULT false;
COMMENT ON COLUMN players.has_eu_passport IS 'Indica si el jugador posee pasaporte comunitario (UE)';
