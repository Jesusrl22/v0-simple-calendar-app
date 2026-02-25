#!/bin/bash

# Script para probar el flujo completo de reset de contraseña
# Uso: bash scripts/test-password-reset.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
EMAIL_TO_TEST="${1:-test@example.com}"
TEMP_DIR="/tmp/password_reset_test"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Password Reset Flow Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check environment variables
echo -e "${YELLOW}[1/4] Verificando variables de entorno...${NC}"
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_URL no está configurada${NC}"
    exit 1
fi
if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Variables de entorno OK${NC}"
echo ""

# Step 2: Request password reset
echo -e "${YELLOW}[2/4] Solicitando reset de contraseña para $EMAIL_TO_TEST...${NC}"
RESET_RESPONSE=$(curl -s -X POST "$APP_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_TO_TEST\"}")

echo -e "${BLUE}Respuesta:${NC} $RESET_RESPONSE"

if echo "$RESET_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Solicitud de reset enviada${NC}"
else
    echo -e "${RED}✗ Error en solicitud de reset${NC}"
    echo "$RESET_RESPONSE"
    exit 1
fi
echo ""

# Step 3: Check Supabase logs
echo -e "${YELLOW}[3/4] Verificando logs de Supabase...${NC}"
echo -e "${BLUE}Importante: Ve a tu dashboard de Supabase:${NC}"
echo -e "${BLUE}  1. Authentication → Users${NC}"
echo -e "${BLUE}  2. Busca el usuario: $EMAIL_TO_TEST${NC}"
echo -e "${BLUE}  3. Verifica que su email esté confirmado${NC}"
echo ""

# Step 4: Instructions for manual testing
echo -e "${YELLOW}[4/4] Instrucciones para completar la prueba:${NC}"
echo ""
echo -e "${BLUE}1. Revisa tu bandeja de entrada:${NC}"
echo -e "   - Email: $EMAIL_TO_TEST"
echo -e "   - Asunto: 'Restablecer tu contraseña' (o similar)"
echo -e "   - Si no ves el email, revisa SPAM"
echo ""
echo -e "${BLUE}2. Haz clic en el link del email${NC}"
echo -e "   - Te llevará a: $APP_URL/reset-password"
echo -e "   - El URL contendrá: ?access_token=...&type=recovery"
echo ""
echo -e "${BLUE}3. Ingresa tu nueva contraseña:${NC}"
echo -e "   - Primera vez: tu nueva contraseña"
echo -e "   - Confirmar: repite la misma contraseña"
echo -e "   - Mínimo 6 caracteres"
echo ""
echo -e "${BLUE}4. Haz clic en 'Restablecer Contraseña'${NC}"
echo ""
echo -e "${BLUE}5. Si todo está bien:${NC}"
echo -e "   - Verás: '¡Contraseña restablecida!'"
echo -e "   - Te redirigirá a: $APP_URL/login"
echo ""
echo -e "${BLUE}6. Logea con:${NC}"
echo -e "   - Email: $EMAIL_TO_TEST"
echo -e "   - Contraseña: tu nueva contraseña"
echo ""

# Troubleshooting
echo -e "${YELLOW}Troubleshooting si no funciona:${NC}"
echo ""
echo -e "${RED}✗ No recibes el email:${NC}"
echo -e "  1. Verifica que Email Auth esté habilitado en Supabase"
echo -e "  2. Ve a: Authentication → Providers → Email (debe estar ON)"
echo -e "  3. Revisa la plantilla de 'Reset Password' esté configurada"
echo -e "  4. Revisa los logs: Authentication → Logs → Email"
echo ""
echo -e "${RED}✗ El link del email no funciona:${NC}"
echo -e "  1. Verifica que NEXT_PUBLIC_APP_URL sea correcto"
echo -e "  2. El link no debe estar expirado (24 horas)"
echo -e "  3. Intenta copiar el URL manualmente al navegador"
echo ""
echo -e "${RED}✗ Cambio de contraseña falla:${NC}"
echo -e "  1. Abre DevTools (F12) → Console"
echo -e "  2. Busca logs con '[v0]' para más detalles"
echo -e "  3. Verifica que el token sea válido"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Test completado${NC}"
echo -e "${GREEN}========================================${NC}"
