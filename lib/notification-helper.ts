/**
 * Helper para enviar notificaciones push
 * Uso: sendNotification(userId, 'task_due', { taskName: 'Mi tarea' })
 */

export type NotificationType = 
  | 'task_due'
  | 'task_comment'
  | 'pomodoro_done'
  | 'achievement'
  | 'event_reminder'
  | 'team_invite'
  | 'general'

interface NotificationTemplates {
  [key: string]: {
    title: string
    body: string
    url: string
  }
}

const notificationTemplates: NotificationTemplates = {
  task_due: {
    title: '📅 Tarea vencida',
    body: 'Tu tarea "{taskName}" vence pronto',
    url: '/app/tasks'
  },
  task_comment: {
    title: '💬 Nuevo comentario',
    body: '"{userName}" comentó en "{taskName}"',
    url: '/app/teams'
  },
  pomodoro_done: {
    title: '🍅 Pomodoro completado',
    body: '25 minutos de concentración. ¡Tómate 5 minutos de descanso!',
    url: '/app/pomodoro'
  },
  achievement: {
    title: '🏆 ¡Logro desbloqueado!',
    body: '{achievementName}',
    url: '/app/achievements'
  },
  event_reminder: {
    title: '📌 Recordatorio de evento',
    body: '{eventName} - comienza en {time}',
    url: '/app/calendar'
  },
  team_invite: {
    title: '👥 Invitación a equipo',
    body: '{userName} te invitó a {teamName}',
    url: '/app/teams'
  },
  general: {
    title: 'Notificación',
    body: '{message}',
    url: '/app'
  }
}

interface SendNotificationOptions {
  userId: string
  type: NotificationType
  data?: Record<string, string | number>
  customTitle?: string
  customBody?: string
  customUrl?: string
}

/**
 * Envía una notificación push al usuario
 * @param options Opciones de la notificación
 */
export async function sendNotification(options: SendNotificationOptions): Promise<Response> {
  const {
    userId,
    type,
    data = {},
    customTitle,
    customBody,
    customUrl
  } = options

  const template = notificationTemplates[type] || notificationTemplates.general

  // Reemplazar variables en el template
  let title = customTitle || template.title
  let body = customBody || template.body
  let url = customUrl || template.url

  // Reemplazar placeholders con datos
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    title = title.replace(placeholder, String(value))
    body = body.replace(placeholder, String(value))
  })

  console.log('[v0] Sending notification:', { userId, type, title, body, url })

  const response = await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      title,
      body,
      type,
      url
    })
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('[v0] Failed to send notification:', error)
  }

  return response
}

/**
 * Helper para enviar desde el servidor (API routes, CRON jobs)
 * @param baseUrl URL base de la aplicación (ej: https://tuapp.com)
 */
export function createServerNotificationSender(baseUrl: string) {
  return async (options: SendNotificationOptions) => {
    const {
      userId,
      type,
      data = {},
      customTitle,
      customBody,
      customUrl
    } = options

    const template = notificationTemplates[type] || notificationTemplates.general

    let title = customTitle || template.title
    let body = customBody || template.body
    let url = customUrl || template.url

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      title = title.replace(placeholder, String(value))
      body = body.replace(placeholder, String(value))
    })

    console.log('[v0] Sending server notification:', { userId, type, title, body, url })

    const response = await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title,
        body,
        type,
        url
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] Failed to send notification:', error)
    }

    return response
  }
}
