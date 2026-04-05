/**
 * Ejemplo: Agregar notificaciones cuando hay comentarios en tareas de equipo
 * 
 * Modificar app/api/task-comments/route.ts para incluir:
 * 1. Obtener ID del usuario que crea la tarea
 * 2. Enviar notificación al usuario
 */

// En el POST handler, después de insertar el comentario:

import { sendNotification } from '@/lib/notification-helper'

export async function POST(request: NextRequest) {
  try {
    // ... código existente ...

    // Después de insertar el comentario:
    const { data: newComment, error } = await serviceSupabase
      .from("task_comments")
      .insert({ task_id: taskId, user_id: user.id, comment: comment.trim() })
      .select("id, comment, created_at, user_id")
      .single()

    if (error) throw error

    // NUEVO: Obtener información de la tarea
    const { data: task } = await serviceSupabase
      .from("team_tasks")
      .select("id, title, assigned_to, created_by")
      .eq("id", taskId)
      .single()

    if (task) {
      // NUEVO: Notificar al usuario que creó la tarea Y al asignado
      const notifyUsers = new Set<string>()
      if (task.created_by && task.created_by !== user.id) {
        notifyUsers.add(task.created_by)
      }
      if (task.assigned_to && task.assigned_to !== user.id) {
        notifyUsers.add(task.assigned_to)
      }

      // NUEVO: Enviar notificaciones
      for (const userId of notifyUsers) {
        try {
          // Si es cliente-side, usar sendNotification
          // Si es servidor, pasar userId
          await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              title: '💬 Nuevo comentario',
              body: `${u?.name} comentó en "${task.title}"`,
              type: 'task_comment',
              url: `/app/teams/${teamId}/tasks/${taskId}`
            })
          })
        } catch (err) {
          console.error('[v0] Error sending comment notification:', err)
          // No lanzar error, solo log
        }
      }
    }

    // ... resto del código ...
  }
}

/**
 * ALTERNATIVA: Usar el helper de notificaciones
 * 
 * import { createServerNotificationSender } from '@/lib/notification-helper'
 * 
 * const sendNotif = createServerNotificationSender(
 *   process.env.VERCEL_URL || 'http://localhost:3000'
 * )
 * 
 * for (const userId of notifyUsers) {
 *   await sendNotif({
 *     userId,
 *     type: 'task_comment',
 *     data: {
 *       taskName: task.title,
 *       userName: u?.name || 'Alguien'
 *     }
 *   })
 * }
 */
