-- 5. Insertar Jugador de Prueba para el Portal
-- Nombre: Lionel Messi
-- Password esperada: lionelmessi
INSERT INTO public.players (
    name, 
    division, 
    age, 
    position, 
    height, 
    weight, 
    is_injured, 
    league_types,
    matches_played,
    goals
)
VALUES (
    'Lionel Messi', 
    '10ma', 
    13, 
    'Delantero', 
    169, 
    67.5, 
    false, 
    ARRAY['ROSARINA'],
    10,
    50
)
ON CONFLICT DO NOTHING;