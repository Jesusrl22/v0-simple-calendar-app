# Future Task - Advanced Task Management System

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jesusrayaleon1-gmailcoms-projects/v0-simple-calendar-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/ttmkMZuLJJy)

## 🚀 Sistema Completo de Gestión de Tareas

Future Task es un sistema avanzado de gestión de tareas con:
- ✅ Autenticación completa con verificación de email
- 📧 Sistema de correos (Nodemailer + Zoho/SMTP)
- 🔔 Notificaciones Push (Web Push API + Service Worker)
- 📅 Calendario con recordatorios
- 🤖 Asistente AI integrado
- 👥 Colaboración en equipo
- 📊 Estadísticas y logros
- ⏱️ Temporizador Pomodoro

## 📖 Documentación Completa

Para configurar el sistema de correos y notificaciones, consulta:

**[GUIA_COMPLETA_CORREOS_Y_NOTIFICACIONES.md](./GUIA_COMPLETA_CORREOS_Y_NOTIFICACIONES.md)** - Guía completa en español

## 🧪 Test del Sistema

### Opción 1: Interfaz Web
Accede a: `/admin/test-system`

### Opción 2: API Endpoint
\`\`\`bash
curl https://tu-app.vercel.app/api/test-system
\`\`\`

El test verificará automáticamente:
- ✅ Variables de entorno configuradas
- ✅ Conexión a Supabase
- ✅ Estructura de base de datos
- ✅ Configuración de SMTP (correos)
- ✅ Configuración de VAPID (notificaciones push)

## 🔧 Variables de Entorno Requeridas

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# SMTP (Zoho o tu proveedor)
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_USER=tu-email@tudominio.com
SMTP_PASSWORD=tu_app_password_de_zoho
SMTP_FROM=tu-email@tudominio.com

# Web Push (genera con: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica
VAPID_PRIVATE_KEY=tu_clave_privada

# App URL
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
\`\`\`

## 📧 Sistema de Correos

El sistema envía automáticamente:
1. **Email de Verificación** - Al registrarse
2. **Email de Bienvenida** - Después de verificar
3. **Reset de Contraseña** - Al olvidar contraseña
4. **Nuevo Dispositivo** - Al detectar login desde nuevo dispositivo
5. **Suscripción Cancelada** - Al cancelar plan premium

## 🔔 Sistema de Notificaciones Push

Las notificaciones se envían para:
- 📋 Recordatorios de tareas
- 📅 Eventos próximos del calendario
- 🏆 Logros desbloqueados
- 👥 Actualizaciones de equipo

### Cron Jobs Configurados

\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/check-expired-subscriptions",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/check-upcoming-events",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/ai/reset-credits",
      "schedule": "0 0 1 * *"
    }
  ]
}
\`\`\`

## 🛠️ Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth + Custom Auth
- **UI**: Shadcn/ui + Tailwind CSS
- **Correos**: Nodemailer + Zoho/SMTP
- **Notificaciones**: Web Push API + Service Worker
- **AI**: Vercel AI SDK
- **Pagos**: PayPal Integration

## Overview

This repository stays in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/jesusrayaleon1-gmailcoms-projects/v0-simple-calendar-app](https://vercel.com/jesusrayaleon1-gmailcoms-projects/v0-simple-calendar-app)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/ttmkMZuLJJy](https://v0.dev/chat/projects/ttmkMZuLJJy)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
