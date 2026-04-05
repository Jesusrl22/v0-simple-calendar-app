# ✅ Checklist de Implementación de Notificaciones Push

## Backend - Infraestructura ✅
- [x] Service Worker (`public/sw.js`)
- [x] API Subscribe (`/api/notifications/subscribe`)
- [x] API Unsubscribe (`/api/notifications/unsubscribe`)
- [x] API Send (`/api/notifications/send`)
- [x] Database table `push_subscriptions`
- [x] RLS policies configuradas

## Frontend - React ✅
- [x] Hook `usePushNotifications`
- [x] Librería de notificaciones (`lib/notifications.ts`)
- [x] Helper de notificaciones (`lib/notification-helper.ts`)
- [x] UI en Settings page
- [x] Gestión de permisos
- [x] Estados de carga

## Documentación ✅
- [x] Guía completa (`PUSH_NOTIFICATIONS.md`)
- [x] Inicio rápido (`NOTIFICATIONS_QUICK_START.md`)
- [x] Ejemplo de integración (`EXAMPLE_ADD_NOTIFICATIONS.md`)
- [x] Resumen ejecutivo (`NOTIFICATIONS_SUMMARY.md`)
- [x] Script generador de claves

## Tu Configuración - Por Hacer 🔧

### 1. Generar Claves VAPID (5 min)
```bash
node scripts/generate-vapid-keys.js
```

**Checklist:**
- [ ] Ejecutaste el script
- [ ] Copiar `NEXT_PUBLIC_VAPID_PUBLIC_KEY` a .env.local
- [ ] Copiar `VAPID_PRIVATE_KEY` a .env.local
- [ ] Copiar `VAPID_SUBJECT` a .env.local
- [ ] Reiniciaste el servidor dev

### 2. Probar Notificaciones (2 min)
- [ ] Abre Settings → Notificaciones
- [ ] Haz clic "Activar notificaciones"
- [ ] Autoriza en el navegador
- [ ] Verifica en DevTools → Application → Service Workers
- [ ] Verifica en Supabase → push_subscriptions

### 3. Integrar en tu App (depende del caso)

#### Opción A: Recordatorios de Tareas (Incluido)
- [ ] Revisar `app/api/cron/notify-task-reminders/route.ts`
- [ ] Copiar/adaptar si necesitas
- [ ] Configurar en Vercel Cron si es necesario

#### Opción B: Comentarios (Ejemplo disponible)
- [ ] Leer `EXAMPLE_ADD_NOTIFICATIONS.md`
- [ ] Adaptar `app/api/task-comments/route.ts`
- [ ] Probar enviando un comentario

#### Opción C: Otros eventos
- [ ] Usar helper `sendNotification()` en tu código
- [ ] Pasar `userId`, `type`, y `data`
- [ ] Revisar tipos disponibles

### 4. Producción
- [ ] Agregar claves a environment variables de Vercel
- [ ] Cambiar `VAPID_SUBJECT` a tu email real
- [ ] Probar en deploy staging
- [ ] Testear en diferentes navegadores

## Códigos de Ejemplo Listos para Copiar

### Cliente - Enviar Notificación
```typescript
import { sendNotification } from '@/lib/notification-helper'

await sendNotification({
  userId: user.id,
  type: 'task_due',
  data: { taskName: 'Mi tarea' }
})
```

### Servidor - Enviar Notificación
```typescript
import { createServerNotificationSender } from '@/lib/notification-helper'

const send = createServerNotificationSender('http://localhost:3000')
await send({
  userId,
  type: 'task_due',
  data: { taskName: 'Mi tarea' }
})
```

### CRON Job - Recordatorios Cada Hora
```typescript
// Revisar: app/api/cron/notify-task-reminders/route.ts
// Listo para usar, solo copia el archivo si lo necesitas
```

## Tipos de Notificación Disponibles

```typescript
'task_due'       // 📅 Tarea vencida
'task_comment'   // 💬 Comentario en tarea
'pomodoro_done'  // 🍅 Pomodoro completado
'achievement'    // 🏆 Logro desbloqueado
'event_reminder' // 📌 Recordatorio evento
'team_invite'    // 👥 Invitación a equipo
'general'        // Mensaje personalizado
```

## Archivo de Claves

Lugar: `.env.local`
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=... (generada)
VAPID_PRIVATE_KEY=... (generada)
VAPID_SUBJECT=mailto:support@futuretask.app
```

## Archivos Nuevos Creados

```
scripts/
└── generate-vapid-keys.js

app/api/cron/
└── notify-task-reminders/
    └── route.ts

lib/
└── notification-helper.ts

Documentación:
├── PUSH_NOTIFICATIONS.md
├── NOTIFICATIONS_QUICK_START.md
├── NOTIFICATIONS_SUMMARY.md
├── EXAMPLE_ADD_NOTIFICATIONS.md
└── SETUP_CHECKLIST.md (este archivo)
```

## Validación - Cómo Verificar que Funciona

### 1. Service Worker Registrado
```javascript
// En DevTools Console
navigator.serviceWorker.getRegistrations()
// Debe retornar array con /sw.js
```

### 2. Suscripción Guardada
```sql
-- En Supabase SQL Editor
SELECT * FROM push_subscriptions WHERE user_id = 'your-user-id';
-- Debe retornar 1+ registros
```

### 3. Enviar Notificación de Prueba
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "title": "🧪 Test",
    "body": "Testing notifications",
    "url": "/app/tasks"
  }'
```

## Soporte

**Errores comunes:**
- "VAPID keys not configured" → Ejecuta `generate-vapid-keys.js`
- "Notifications not supported" → Usa navegador moderno
- "No subscriptions" → Verifica que usuario activó notificaciones
- "Endpoint invalid (410)" → Automáticamente se limpia

**Debug:**
- Abre DevTools (F12)
- Console tab → busca logs `[v0]`
- Application tab → Service Workers
- Application tab → Storage → Push notifications

---

**¡Listo para implementar!** 🚀

Cuando termines la configuración, actualiza este checklist:
- [x] ✅ Implementación completa
- [x] ✅ Documentación disponible
- [x] ✅ Ejemplos listos
- [ ] ⏳ Claves generadas
- [ ] ⏳ Probado en navegador
- [ ] ⏳ Integrado en app
