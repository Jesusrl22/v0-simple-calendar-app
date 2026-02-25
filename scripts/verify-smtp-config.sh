#!/bin/bash

# Script para verificar que todas las variables SMTP están configuradas correctamente

echo "🔍 Verificando Configuración SMTP"
echo "==================================="
echo ""

ERRORS=0

# Función auxiliar para verificar variables
check_var() {
  local var_name=$1
  local var_value=${!var_name}
  
  if [ -z "$var_value" ]; then
    echo "❌ $var_name - NO CONFIGURADA"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ $var_name - Configurada"
  fi
}

# Verificar variables críticas
check_var "SMTP_HOST"
check_var "SMTP_PORT"
check_var "SMTP_USER"
check_var "SMTP_PASSWORD"
check_var "SMTP_FROM"
check_var "NEXT_PUBLIC_APP_URL"
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"

echo ""
echo "==================================="

if [ $ERRORS -eq 0 ]; then
  echo "✅ TODAS las variables están configuradas"
  echo ""
  echo "Valores configurados:"
  echo "  SMTP_HOST: $SMTP_HOST"
  echo "  SMTP_PORT: $SMTP_PORT"
  echo "  SMTP_USER: $SMTP_USER"
  echo "  SMTP_FROM: $SMTP_FROM"
  echo "  NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"
  exit 0
else
  echo "❌ Faltan $ERRORS variables por configurar"
  echo ""
  echo "Agrega estas variables en Vercel:"
  echo "  Settings → Environment Variables"
  exit 1
fi
