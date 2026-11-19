
-- WAYPET HOME
-- Datos ficticios de prueba y usuario administrador
-- PostgreSQL

BEGIN;

-- 1. Usuario administrador: Carolina Riascos
-- La contraseña se recibe como variable de psql.
INSERT INTO public.users (
  name, email, password_hash, phone, role
)
VALUES (
  'Carolina Riascos',
  'caroriascos@gmail.com',
  :'admin_password_hash',
  '3157023894',
  'administrador'
)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  phone = EXCLUDED.phone,
  role = 'administrador';

-- 2. Usuario ficticio para las relaciones
INSERT INTO public.users (
  name, email, password_hash, phone, role
)
VALUES (
  'Usuario Demo',
  'demo.seed@waypet.invalid',
  'NO_LOGIN_SEED_ACCOUNT',
  '3000000000',
  'usuario'
)
ON CONFLICT (email) DO NOTHING;

-- 3. Mascotas ficticias
INSERT INTO public.pets (
  id, name, breed, color, size, sex, characteristics
)
VALUES
  (1001, 'Max', 'Labrador', 'Dorado', 'grande',
   'macho', 'Collar azul'),
  (1002, 'Luna', 'Criolla', 'Blanco', 'mediano',
   'hembra', 'Mancha negra en el ojo')
ON CONFLICT (id) DO NOTHING;

-- 4. Reporte de mascota perdida
INSERT INTO public.reports (
  id, type, event_date, location,
  description, status, user_id, pet_id
)
VALUES (
  1001,
  'perdida',
  '2026-10-20',
  'Parque del Perro, Cali',
  'Mascota perdida durante un paseo',
  'activo',
  (SELECT id FROM public.users
   WHERE email = 'demo.seed@waypet.invalid'),
  1001
)
ON CONFLICT (id) DO NOTHING;

-- 5. Reporte de mascota encontrada
INSERT INTO public.reports (
  id, type, event_date, location,
  description, status, user_id, pet_id
)
VALUES (
  1002,
  'encontrada',
  '2026-10-21',
  'Calle 5, Cali',
  'Mascota encontrada cerca del parque',
  'activo',
  (SELECT id FROM public.users
   WHERE email = 'demo.seed@waypet.invalid'),
  1002
)
ON CONFLICT (id) DO NOTHING;

-- 6. Pista ficticia
INSERT INTO public.clues (
  id, report_id, user_id, description,
  location, sighted_at, latitude, longitude
)
VALUES (
  1001,
  1001,
  (SELECT id FROM public.users
   WHERE email = 'demo.seed@waypet.invalid'),
  'Posible avistamiento cerca del parque',
  'Parque del Perro, Cali',
  '2026-10-21 15:30:00-05',
  3.437,
  -76.543
)
ON CONFLICT (id) DO NOTHING;

-- 7. Posible coincidencia entre reportes
INSERT INTO public.matches (
  id, similarity_percentage, matching_features,
  status, lost_report_id, found_report_id
)
VALUES (
  1001,
  85,
  'Coincidencia ficticia de características',
  'pendiente',
  1001,
  1002
)
ON CONFLICT DO NOTHING;

-- 8. Notificación de coincidencia
INSERT INTO public.notifications (
  id, message, is_read, user_id, match_id
)
VALUES (
  1001,
  'Se encontró una posible coincidencia para Max',
  false,
  (SELECT id FROM public.users
   WHERE email = 'demo.seed@waypet.invalid'),
  1001
)
ON CONFLICT (id) DO NOTHING;

-- 9. Actualizar secuencias
SELECT setval(
  pg_get_serial_sequence('public.users', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.users), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('public.pets', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.pets), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('public.reports', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.reports), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('public.clues', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.clues), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('public.matches', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.matches), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('public.notifications', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.notifications), 1),
  true
);

COMMIT;
