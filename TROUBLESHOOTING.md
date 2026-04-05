# 🔧 Troubleshooting de Notificaciones Push

## ❌ Problema: "Notificaciones no soportadas en este navegador"

### Causa
El navegador no tiene soporte para Push API o Service Workers.

### Solución
1. **Verifica navegador:**
   - ✅ Chrome/Edge 50+
   - ✅ Firefox 44+
   - ✅ Opera 37+
   - ⚠️ Safari (iOS 16.4+, problemas)
   - ❌ Internet Explorer (no soportado)

2. **Código de debug:**
```javascript
console.log('serviceWorker:', 'serviceWorker' in navigator)
console.log('PushManager:', 'PushManager' in window)
console.log('Notification:', 'Notification' in window)
```

---

## ❌ Problema: "Notificaciones bloqueadas"

### Causa
El usuario rechazó permisos o el navegador bloqueó notificaciones.

### Solución
1. **Habilitar permisos:**
   - Chrome: Click en icono candado 🔒 → Permitir
   - Firefox: Settings → Privacy → Permissions → Notificaciones
   - Edge: Settings → Privacy → Notifications → Permitir

2. **Resetear permisos:**
   - Chrome: `chrome://settings/content/notifications`
   - Firefox: `about:preferences#privacy`
   - Busca tu dominio y cambia a "Permitir"

3. **En tu código:**
```typescript
const permission = Notification.permission
console.log('[v0] Permission status:', permission)
// 'granted' = permitido
// 'denied' = bloqueado
// 'default' = sin decidir
```

---

## ❌ Problema: "Service Worker no se registra"

### Causa
- Archivo `public/sw.js` no existe
- Error en el archivo sw.js
- HTTPS requerido en producción

### Solución
1. **Verifica archivo existe:**
```bash
ls -la public/sw.js
# Debe existir
```

2. **Verifica sintaxis:**
```javascript
// DevTools Console
navigator.serviceWorker.register('/sw.js')
  .then(reg => console.log('✅ Registrado:', reg))
  .catch(err => console.error('❌ Error:', err))
```

3. **En producción:**
   - Requiere HTTPS
   - En localhost/desarrollo funciona con HTTP

4. **Resetear Service Worker:**
```javascript
// DevTools Console
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(r => r.unregister()))
  .then(() => location.reload())
```

---

## ❌ Problema: "VAPID keys not configured"

### Causa
Las variables de entorno no están establecidas.

### Solución
1. **Generar claves:**
```bash
node scripts/generate-vapid-keys.js
```

2. **Agregar a .env.local:**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEx...
VAPID_PRIVATE_KEY=sxQ...
VAPID_SUBJECT=mailto:support@futuretask.app
```

3. **Reiniciar servidor:**
```bash
npm run dev
```

4. **Verificar en consola:**
```javascript
console.log('VAPID key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
```

---

## ❌ Problema: "Suscripción no se guarda"

### Causa
- Permisos no concedidos
- Fallo en la API `/api/notifications/subscribe`
- Error en Supabase

### Solución
1. **Verifica permisos concedidos:**
```javascript
const permission = Notification.permission
console.log('Permission:', permission) // debe ser 'granted'
```

2. **Revisa logs del servidor:**
```bash
npm run dev
# Busca errores [v0] en la consola
```

3. **Prueba la API manualmente:**
```bash
curl -X POST http://localhost:3000/api/notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=..." \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }'
```

4. **Revisa Supabase:**
   - Supabase → push_subscriptions
   - Busca tu user_id
   - Si está vacía, revisar API

---

## ❌ Problema: "No recibo notificaciones"

### Causa
- La aplicación está en primer plano (normal)
- No hay suscripción activa
- Error al enviar desde servidor

### Solución
1. **Verifica que está suscrito:**
```sql
-- Supabase SQL Editor
SELECT * FROM push_subscriptions 
WHERE user_id = 'tu-user-id';
```

2. **Cierra la aplicación:**
   - Las notificaciones se muestran solo cuando app está cerrada
   - Si está abierta, no se muestra (es normal)

3. **Revisa logs del servidor:**
```bash
npm run dev
# Busca: "[v0] Sending notification"
# Busca: "[v0] Notification sent successfully"
```

4. **Prueba manualmente:**
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "tu-user-id",
    "title": "Test",
    "body": "Testing",
    "url": "/app/tasks"
  }'
```

5. **Revisa DevTools:**
   - Application → Service Workers
   - Busca errores en la consola
   - Revisa Network tab

---

## ❌ Problema: "Error 401 Unauthorized"

### Causa
Token de autenticación inválido o expirado.

### Solución
1. **Verifica sesión:**
```javascript
// DevTools Console
const { data } = await fetch('/api/auth/session').then(r => r.json())
console.log('Session:', data)
```

2. **Si está vacío:**
   - Hace logout y login de nuevo
   - Abre nueva pestaña y prueba

3. **Para API calls del servidor:**
   - Usar `SUPABASE_SERVICE_ROLE_KEY`
   - No `SUPABASE_ANON_KEY`

---

## ❌ Problema: "Error 410 - Subscription invalid"

### Causa
El endpoint push expiró o es inválido.

### Solución
1. **Automático:**
   - El servidor borra endpoints 410 automáticamente
   - Próxima vez que se active, se crea nuevo

2. **Manual - resetear:**
```sql
-- Supabase SQL Editor
DELETE FROM push_subscriptions 
WHERE user_id = 'tu-user-id';
```

3. **Cliente - reactivar:**
   - Settings → Notificaciones → Desactivar
   - Settings → Notificaciones → Activar

---

## ✅ Cómo Debuggear

### DevTools - Consola
```javascript
// 1. Verificar soporte
console.log({
  sw: 'serviceWorker' in navigator,
  push: 'PushManager' in window,
  notif: 'Notification' in window
})

// 2. Verificar Service Worker
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('Registrations:', regs))

// 3. Verificar suscripción
navigator.serviceWorker.ready
  .then(reg => reg.pushManager.getSubscription())
  .then(sub => console.log('Subscription:', sub))

// 4. Verificar permisos
console.log('Permission:', Notification.permission)
```

### Logs del Servidor
```bash
# Buscar logs específicos
npm run dev 2>&1 | grep "\[v0\]"

# O guardar en archivo
npm run dev > debug.log 2>&1
tail -f debug.log | grep "\[v0\]"
```

### Network Tab (DevTools)
1. Abre DevTools → Network tab
2. Filtra por `/api/notifications`
3. Envía una notificación
4. Revisa request/response

### Database (Supabase)
```sql
-- Revisar suscripciones
SELECT user_id, endpoint, created_at FROM push_subscriptions
ORDER BY created_at DESC;

-- Revisar endpoints activos
SELECT COUNT(*) as total FROM push_subscriptions;

-- Buscar user específico
SELECT * FROM push_subscriptions 
WHERE user_id = 'tu-user-id';
```

---

## 📊 Estados Esperados

### Flujo Normal
```
1. Usuario abre Settings ✓
2. Haz click "Activar notificaciones" ✓
3. Navegador pide permiso ✓
4. Usuario autoriza ✓
5. Se registra Service Worker ✓
6. Se crea suscripción push ✓
7. Se guarda en push_subscriptions ✓
8. UI muestra "Activo" ✓
```

### Cuando Funciona
- ✅ Permiso concedido
- ✅ Service Worker registrado
- ✅ Endpoint en BD
- ✅ VAPID keys configuradas
- ✅ App cerrada (para ver notificación)

---

## 🆘 Escalación

Si después de todo esto no funciona:

1. **Revisa logs completos:**
```bash
npm run dev 2>&1 | tee debug.log
```

2. **Exporta información:**
- Logs del servidor (debug.log)
- Logs del navegador (DevTools Console)
- Screenshot de push_subscriptions
- JSON de la suscripción

3. **Contactar soporte con:**
- Navegador y versión
- URL del sitio
- User ID
- Logs arriba mencionados

---

**Última revisión:** 2024
**Versión:** 1.0
