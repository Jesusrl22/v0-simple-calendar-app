-- Agregar campos para reseteo de contraseña si no existen
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Crear índice para limpiar tokens expirados
CREATE INDEX IF NOT EXISTS idx_users_reset_token_expires ON users(reset_token_expires);

COMMENT ON COLUMN users.reset_token IS 'Token de reset de contraseña generado aleatoriamente';
COMMENT ON COLUMN users.reset_token_expires IS 'Fecha y hora de expiración del token de reset';
