# ⚡ Guía Rápida: Notificaciones Push

## 🎯 En 3 Pasos

### 1️⃣ Generar Claves VAPID
```bash
node scripts/generate-vapid-keys.js
```

Copiar output a `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:support@futuretask.app
```

### 2️⃣ Reiniciar Servidor
```bash
npm run dev
```

### 3️⃣ Activar Notificaciones
- Va a Settings → Notificaciones
- Clic en "Activar notificaciones"
- Autoriza en el navegador

✅ **¡Listo!**

---

## 🚀 Usar en tu Código

### Cliente (React)
```typescript
import { sendNotification } from '@/lib/notification-helper'

// Enviar notificación
await sendNotification({
  userId: user.id,
  type: 'task_comment',
  data: {
    taskName: 'Proyecto web',
    userName: 'Carlos'
  }
})
```

### Servidor (API/CRON)
```typescript
import { createServerNotificationSender } from '@/lib/notification-helper'

const sendNotif = createServerNotificationSender(
  process.env.VERCEL_URL || 'http://localhost:3000'
)

await sendNotif({
  userId,
  type: 'task_due',
  data: { taskName: 'Mi tarea' }
})
```

---

## 📋 Tipos de Notificación

| Tipo | Ejemplo |
|------|---------|
| `task_due` | Tarea vencida |
| `task_comment` | Comentario en tarea |
| `pomodoro_done` | Pomodoro completado |
| `achievement` | Logro desbloqueado |
| `event_reminder` | Recordatorio de evento |
| `team_invite` | Invitación a equipo |
| `general` | Mensaje personalizado |

---

## 🔍 Debugging

**Service Worker registrado?**
- DevTools → Application → Service Workers
- Debe mostrar `/sw.js` como "Active"

**Suscripción guardada?**
- Supabase → push_subscriptions table
- Debe haber un registro con tu user_id

**No recibo notificaciones?**
1. Verifica permisos en browser
2. Revisa console del navegador (F12)
3. Revisa logs del servidor

---

📖 Ver documentación completa en `PUSH_NOTIFICATIONS.md`
