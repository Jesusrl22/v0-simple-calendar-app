-- Script completo para configurar la base de datos de Future Task
-- Ejecuta este script en Supabase SQL Editor

-- 1. Asegurar que la extensión uuid esté habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear trigger para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_tier, ai_credits, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    10,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Eliminar trigger antiguo si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Crear nuevo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar que las políticas RLS estén correctas
-- Política para insertar perfil propio
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política para ver perfil propio
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Política para actualizar perfil propio
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Deshabilitar confirmación de email (OPCIONAL - solo para desarrollo)
-- Esto permite que los usuarios inicien sesión inmediatamente después de registrarse
-- Ve a: Authentication > Settings > Enable Email Confirmations y desactívalo

-- ✅ Setup completo! Ahora puedes:
-- 1. Registrar usuarios en /signup
-- 2. Los usuarios se crearán automáticamente en la tabla users con el trigger
-- 3. Iniciar sesión en /login
-- 4. Ver usuarios en /admin/dashboard (usuario: admin, contraseña: ADMIN_PASSWORD)
