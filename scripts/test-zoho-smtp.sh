#!/bin/bash

# Script para probar el sistema de reset de contraseña con Zoho SMTP

set -e

echo "🧪 Prueba del Sistema de Reset de Contraseña"
echo "=============================================="
echo ""

# Verificar variables de entorno
echo "✓ Verificando variables de entorno..."

if [ -z "$SMTP_HOST" ]; then
  echo "❌ Error: SMTP_HOST no está configurada"
  exit 1
fi

if [ -z "$SMTP_PORT" ]; then
  echo "❌ Error: SMTP_PORT no está configurada"
  exit 1
fi

if [ -z "$SMTP_USER" ]; then
  echo "❌ Error: SMTP_USER no está configurada"
  exit 1
fi

if [ -z "$SMTP_PASSWORD" ]; then
  echo "❌ Error: SMTP_PASSWORD no está configurada"
  exit 1
fi

echo "✓ SMTP_HOST: $SMTP_HOST"
echo "✓ SMTP_PORT: $SMTP_PORT"
echo "✓ SMTP_USER: $SMTP_USER"
echo ""

# Solicitar email
read -p "Ingresa el email del usuario: " USER_EMAIL

# Obtener la URL de la app
if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
  APP_URL="http://localhost:3000"
else
  APP_URL="$NEXT_PUBLIC_APP_URL"
fi

echo ""
echo "📧 Enviando solicitud de reset a: $USER_EMAIL"
echo "🔗 URL de la app: $APP_URL"
echo ""

# Hacer la solicitud POST
curl -X POST "${APP_URL}/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$USER_EMAIL\"}" \
  -w "\n" \
  -v

echo ""
echo "✓ Solicitud enviada"
echo "📥 Revisa tu bandeja de entrada en: $USER_EMAIL"
echo ""
