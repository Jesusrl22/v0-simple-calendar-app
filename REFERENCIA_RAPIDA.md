# 📖 Referencia Rápida - Notificaciones Push

## 🎯 Inicio Rápido (2 min)

```bash
# 1. Generar claves
node scripts/generate-vapid-keys.js

# 2. Copiar a .env.local
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
# VAPID_PRIVATE_KEY=...

# 3. Reiniciar
npm run dev

# 4. Probar: Settings → Activar notificaciones
```

---

## 💻 Código - Cliente

### Enviar Notificación
```typescript
import { sendNotification } from '@/lib/notification-helper'

// Simple
await sendNotification({
  userId: user.id,
  type: 'task_due',
  data: { taskName: 'Proyecto web' }
})

// Personalizado
await sendNotification({
  userId,
  type: 'general',
  customTitle: '¡Hola!',
  customBody: 'Tu mensaje aquí',
  customUrl: '/app/tasks'
})
```

### Usar Hook
```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function MyComponent() {
  const {
    isSupported,       // ¿Soporta push?
    isSubscribed,      // ¿Activado?
    isLoading,         // ¿Cargando?
    enableNotifications,  // Activar
    disableNotifications  // Desactivar
  } = usePushNotifications()

  return (
    <button onClick={isSubscribed ? disableNotifications : enableNotifications}>
      {isSubscribed ? '🔔 Activo' : '🔕 Inactivo'}
    </button>
  )
}
```

---

## 🖥️ Código - Servidor

### En API Route
```typescript
// app/api/my-endpoint/route.ts
import { sendNotification } from '@/lib/notification-helper'

export async function POST(req: Request) {
  // ... tu lógica ...
  
  // Enviar notificación
  await sendNotification({
    userId: 'user-uuid',
    type: 'task_comment',
    data: {
      taskName: 'Mi tarea',
      userName: 'Carlos'
    }
  })
}
```

### En CRON Job
```typescript
// app/api/cron/my-job/route.ts
import { createServerNotificationSender } from '@/lib/notification-helper'

export async function POST(req: Request) {
  const send = createServerNotificationSender(
    process.env.VERCEL_URL || 'http://localhost:3000'
  )

  await send({
    userId,
    type: 'achievement',
    data: { achievementName: 'Primera semana' }
  })
}
```

---

## 📝 Tipos de Notificación

| Tipo | Ícono | Uso |
|------|-------|-----|
| `task_due` | 📅 | Tarea próxima a vencer |
| `task_comment` | 💬 | Comentario en tarea |
| `pomodoro_done` | 🍅 | Pomodoro terminado |
| `achievement` | 🏆 | Logro desbloqueado |
| `event_reminder` | 📌 | Evento próximo |
| `team_invite` | 👥 | Invitación a equipo |
| `general` | 📢 | Mensaje personalizado |

---

## 🔧 Configuración

### .env.local Necesario
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEx...
VAPID_PRIVATE_KEY=sxQ...
VAPID_SUBJECT=mailto:support@tuapp.com
```

### Generar Claves
```bash
node scripts/generate-vapid-keys.js
# O manual:
npx web-push generate-vapid-keys
```

---

## 📊 Database

### Tabla: push_subscriptions
```sql
SELECT * FROM push_subscriptions WHERE user_id = 'xxx';
```

Columnas:
- `id` - UUID
- `user_id` - Usuario
- `endpoint` - URL del navegador
- `p256dh_key` - Clave criptográfica
- `auth_key` - Clave autenticación
- `created_at` - Fecha
- `last_used_at` - Último uso

---

## 🧪 Testing

### Manual - cURL
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-aqui",
    "title": "Test",
    "body": "¡Funciona!",
    "url": "/app/tasks"
  }'
```

### En Browser Console
```javascript
// Verificar soporte
'serviceWorker' in navigator && 'PushManager' in window

// Verificar Service Worker
navigator.serviceWorker.getRegistrations()

// Verificar suscripción
navigator.serviceWorker.ready
  .then(r => r.pushManager.getSubscription())
```

---

## 🆘 Errores Comunes

| Error | Solución |
|-------|----------|
| "Notificaciones no soportadas" | Actualizar navegador |
| "VAPID keys not configured" | Ejecutar `generate-vapid-keys.js` |
| "Unauthorized" | Verificar autenticación |
| "No subscriptions" | Usuario debe activar primero |
| "Invalid subscription (410)" | Se limpia automáticamente |

---

## 📚 Archivos Importantes

```
✅ public/sw.js - Service Worker
✅ hooks/usePushNotifications.ts - Hook React
✅ lib/notifications.ts - Utilidades
✅ lib/notification-helper.ts - Helper
✅ app/api/notifications/ - APIs
✅ scripts/generate-vapid-keys.js - Generador
```

---

## 📖 Documentación

- `PUSH_NOTIFICATIONS.md` - Guía completa
- `NOTIFICATIONS_QUICK_START.md` - Inicio rápido
- `SETUP_CHECKLIST.md` - Lista de verificación
- `TROUBLESHOOTING.md` - Problemas y soluciones
- `EXAMPLE_ADD_NOTIFICATIONS.md` - Ejemplos

---

## ✨ Casos de Uso

### Tarea Vencida
```typescript
await sendNotification({
  userId,
  type: 'task_due',
  data: { taskName: 'Proyecto web' }
})
```

### Comentario en Tarea
```typescript
await sendNotification({
  userId,
  type: 'task_comment',
  data: { 
    taskName: 'Rediseño',
    userName: 'Carlos'
  }
})
```

### Logro Desbloqueado
```typescript
await sendNotification({
  userId,
  type: 'achievement',
  data: { achievementName: 'Primera semana' }
})
```

### Mensaje Personalizado
```typescript
await sendNotification({
  userId,
  type: 'general',
  customTitle: '¡Hola!',
  customBody: 'Tienes un nuevo mensaje'
})
```

---

## 🎯 Checklist Rápida

- [ ] Generar claves VAPID
- [ ] Agregar a .env.local
- [ ] Reiniciar servidor
- [ ] Probar en Settings
- [ ] Ver en push_subscriptions
- [ ] Enviar notificación de prueba
- [ ] Integrar en tu código
- [ ] Probar en producción

---

**Versión:** 2024
**Idioma:** Español (ES)
**Soporte:** Ver TROUBLESHOOTING.md
