# 🔔 Notificaciones Push - Guía de Implementación

Las notificaciones push permiten a los usuarios recibir alertas incluso cuando la aplicación está cerrada. Este proyecto ya tiene toda la infraestructura configurada, solo necesitas generar las claves VAPID.

## ⚙️ Configuración Rápida

### 1. Generar las Claves VAPID

Las claves VAPID son credenciales que autorizan tu servidor para enviar notificaciones push. Se generan una sola vez.

```bash
npm install web-push --save-dev
npx web-push generate-vapid-keys
```

O usa el script incluido:

```bash
node scripts/generate-vapid-keys.js
```

Esto te mostrará dos claves:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (pública - sale en el navegador)
- `VAPID_PRIVATE_KEY` (privada - solo en el servidor)

### 2. Agregar Variables de Entorno

Copia las claves a tu archivo `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_SUBJECT=mailto:support@futuretask.app
```

### 3. Reiniciar Servidor

```bash
npm run dev
```

## 🎯 Características Implementadas

### ✅ Service Worker (`public/sw.js`)
- Maneja eventos push desde el servidor
- Muestra notificaciones al usuario
- Gestiona clics en notificaciones
- Abre URLs correctas cuando el usuario interactúa

### ✅ Hook de Notificaciones (`hooks/usePushNotifications.ts`)
- Verifica compatibilidad del navegador
- Solicita permisos al usuario
- Gestiona suscripción/desuscripción
- Sincroniza con el servidor

### ✅ API de Suscripción (`/api/notifications/subscribe`)
- Guarda la suscripción push en Supabase
- Almacena el endpoint y las claves criptográficas
- Único por dispositivo/navegador

### ✅ API de Envío (`/api/notifications/send`)
- Envía notificaciones a todos los dispositivos del usuario
- Valida permisos del usuario
- Limpia suscripciones inválidas (410)
- Logging completo para debugging

### ✅ UI en Settings (`/app/app/settings/page.tsx`)
- Switch para activar/desactivar notificaciones
- Indicador de compatibilidad del navegador
- Estados de carga
- Retroalimentación al usuario

## 📱 Cómo Funciona

```
1. Usuario da permiso → 2. Naveg registra Service Worker
         ↓
3. Crea suscripción push → 4. Envía al servidor
         ↓
5. Servidor guarda en BD → 6. Usuario recibe notificaciones
```

Cuando ocurre un evento (tarea vencida, comentario, etc.):
- Servidor llama a `/api/notifications/send`
- Se envía a todos los dispositivos del usuario
- Incluso si la app está cerrada, el navegador muestra la notificación
- Clic → abre la app en la URL correcta

## 🚀 Enviar Notificaciones

### Desde el Cliente

```javascript
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    title: '🍅 Pomodoro completado',
    body: '25 minutos de concentración. ¡Tómate 5 minutos de descanso!',
    type: 'pomodoro',
    url: '/app/pomodoro'
  })
})
```

### Desde CRON Jobs

Usar `SUPABASE_SERVICE_ROLE_KEY` para autenticación:

```typescript
// app/api/cron/check-task-reminders/route.ts
await fetch(`${process.env.VERCEL_URL}/api/notifications/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    title: '📅 Tarea vencida',
    body: taskName,
    type: 'reminder',
    url: '/app/tasks'
  })
})
```

## 📝 Ejemplos de Notificaciones

### Recordatorio de Tarea
```javascript
{
  title: '📅 Recordatorio de tarea',
  body: 'Proyecto Finanzas - Vence en 1 hora',
  type: 'reminder',
  url: '/app/tasks'
}
```

### Comentario en Tarea
```javascript
{
  title: '💬 Carlos comentó en tu tarea',
  body: 'Rediseño web - "¿Avanzaste con los mockups?"',
  type: 'comment',
  url: '/app/teams'
}
```

### Logro Desbloqueado
```javascript
{
  title: '🏆 ¡Logro desbloqueado!',
  body: 'Primera semana completada 🔥',
  type: 'achievement',
  url: '/app/achievements'
}
```

## 🔒 Seguridad

- Las claves VAPID son únicas por aplicación
- La clave privada nunca sale del servidor
- Las suscripciones se validan con `user_id`
- RLS en Supabase previene acceso no autorizado
- Las suscripciones inválidas se limpian automáticamente

## 🛠️ Debugging

### Ver logs en consola del servidor

```bash
npm run dev  # Verá todos los logs [v0]
```

### Probar suscripción
1. Ve a Settings → Notificaciones
2. Haz clic en "Activar notificaciones"
3. Autoriza en el navegador
4. Verifica la suscripción en Supabase: `push_subscriptions`

### Probar envío
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "title": "Test",
    "body": "Testing notifications",
    "url": "/app/tasks"
  }'
```

## 📊 Base de Datos

Tabla `push_subscriptions`:
```sql
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh_key text,
  auth_key text,
  user_agent text,
  last_used_at timestamp,
  created_at timestamp DEFAULT now(),
  UNIQUE(endpoint)
);
```

## ✨ Próximas Mejoras

- [ ] Notificaciones de recordatorio (15 min antes)
- [ ] Historial de notificaciones
- [ ] Preferencias de tipo de notificación
- [ ] Silenciadores por hora (Do Not Disturb)
- [ ] Notificaciones offline (sincronización después)

## 🆘 Problemas Comunes

**"Notificaciones no soportadas"**
- Incompatible con navegadores antiguos (IE)
- Requiere HTTPS en producción (localhost OK en desarrollo)

**"No recibo notificaciones"**
- Verifica que diste permiso en Settings
- Abre DevTools → Application → Service Workers
- Revisa que el endpoint esté en `push_subscriptions`

**"Claves VAPID no configuradas"**
- Ejecuta `node scripts/generate-vapid-keys.js`
- Agrega a `.env.local`
- Reinicia servidor dev

---

**Documentación:** https://developer.mozilla.org/en-US/docs/Web/API/Push_API
