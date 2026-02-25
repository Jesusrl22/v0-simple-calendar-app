-- Habilitar RLS en team_members y crear políticas correctas
-- Este script corrige los errores de seguridad en la tabla team_members

-- Primero, eliminar las políticas existentes si existen
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can insert team members" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can delete team members" ON team_members;
DROP POLICY IF EXISTS "Owners and admins can update team member roles" ON team_members;
DROP POLICY IF EXISTS "Service role can manage team members" ON team_members;

-- Habilitar RLS en la tabla
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS correctas
CREATE POLICY "Users can view members of their teams" ON team_members
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners and admins can insert team members" ON team_members
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update team member roles" ON team_members
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can delete team members" ON team_members
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Permitir que el service role pueda gestionar miembros (para operaciones del servidor)
CREATE POLICY "Service role can manage team members" ON team_members
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
