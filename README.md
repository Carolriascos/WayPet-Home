# WayPet Home

Plataforma web para centralizar reportes de mascotas perdidas y encontradas.

## Cómo arrancar el backend
1. Instalar Node.js 24, Git y Docker Desktop.
2. cd backend
3. Copiar .env.example a .env y poner una contraseña en DB_PASSWORD.
4. npm ci
5. docker compose up -d
6. npm run start:dev
7. Abrir http://localhost:3000/api