-- Script para agregar el sistema de tipos de liga (AFA/ROSARINA/PRESTAMO)
-- Este script agrega las columnas necesarias y crea la tabla de estadísticas separadas

-- 1. Agregar columnas a la tabla players
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS league_types TEXT[] DEFAULT ARRAY['ROSARINA']::TEXT[]; -- Array porque un jugador puede estar en ambas

ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS loan_status TEXT DEFAULT NULL; -- 'PRESTAMO' o NULL

-- 2. Agregar columna a la tabla matches para identificar el tipo de liga
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS league_type TEXT DEFAULT 'ROSARINA'; -- 'AFA' o 'ROSARINA'

-- 3. Crear tabla para estadísticas por liga (separar AFA y ROSARINA)
CREATE TABLE IF NOT EXISTS public.player_league_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  league_type TEXT NOT NULL CHECK (league_type IN ('AFA', 'ROSARINA')),
  minutes_played INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(player_id, league_type)
);

-- 4. Habilitar RLS en la nueva tabla
ALTER TABLE public.player_league_stats ENABLE ROW LEVEL SECURITY;

-- 5. Crear política de acceso para usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can access player_league_stats" ON public.player_league_stats;
CREATE POLICY "Authenticated users can access player_league_stats" 
  ON public.player_league_stats FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Crear función para incrementar estadísticas por liga
CREATE OR REPLACE FUNCTION increment_player_league_stats(
  p_id UUID, 
  p_league_type TEXT,
  p_minutes INTEGER, 
  p_goals INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Insertar o actualizar estadísticas por liga
  INSERT INTO public.player_league_stats (player_id, league_type, minutes_played, matches_played, goals, updated_at)
  VALUES (p_id, p_league_type, p_minutes, 1, p_goals, NOW())
  ON CONFLICT (player_id, league_type) 
  DO UPDATE SET 
    minutes_played = player_league_stats.minutes_played + p_minutes,
    matches_played = player_league_stats.matches_played + 1,
    goals = player_league_stats.goals + p_goals,
    updated_at = NOW();
    
  -- También actualizar las estadísticas totales del jugador (para retrocompatibilidad)
  UPDATE public.players
  SET 
    minutes_played = minutes_played + p_minutes,
    matches_played = matches_played + 1,
    goals = goals + p_goals
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_player_league_stats_player ON public.player_league_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_league_stats_league_type ON public.player_league_stats(league_type);
CREATE INDEX IF NOT EXISTS idx_players_league_types ON public.players USING GIN(league_types);
CREATE INDEX IF NOT EXISTS idx_matches_league_type ON public.matches(league_type);

-- 8. Migrar datos existentes (todos los jugadores actuales están en ROSARINA por defecto)
-- Los partidos existentes se consideran ROSARINA
UPDATE public.matches SET league_type = 'ROSARINA' WHERE league_type IS NULL;

-- Crear registros iniciales en player_league_stats para jugadores existentes
-- (basándonos en que todos los datos actuales son de ROSARINA)
INSERT INTO public.player_league_stats (player_id, league_type, minutes_played, matches_played, goals)
SELECT 
  id,
  'ROSARINA',
  minutes_played,
  matches_played,
  goals
FROM public.players
ON CONFLICT (player_id, league_type) DO NOTHING;

-- 9. Verificación de la estructura
SELECT 'Script ejecutado exitosamente. Tablas y funciones creadas.' AS status;
