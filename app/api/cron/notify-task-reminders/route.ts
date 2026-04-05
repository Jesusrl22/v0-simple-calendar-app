/**
 * Ejemplo: CRON Job para enviar recordatorios de tareas
 * Ejecuta cada hora y notifica sobre tareas que vencen pronto
 * 
 * Ruta: app/api/cron/notify-task-reminders/route.ts
 */

import { createClient } from '@supabase/supabase-js'
import { createServerNotificationSender } from '@/lib/notification-helper'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  // Verificar que es una solicitud válida (desde Vercel Cron o autorizado)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[v0] Starting task reminder notifications...')

  const sendNotif = createServerNotificationSender(
    process.env.VERCEL_URL || 'http://localhost:3000'
  )

  try {
    // Obtener tareas que vencen en las próximas 2 horas
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000)
    const now = new Date()

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, user_id, due_date, completed')
      .eq('completed', false)
      .gte('due_date', now.toISOString())
      .lte('due_date', twoHoursFromNow.toISOString())

    if (error) {
      console.error('[v0] Error fetching tasks:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log(`[v0] Found ${tasks?.length || 0} tasks with upcoming due dates`)

    let notificationsCount = 0

    // Enviar notificación a cada usuario
    if (tasks) {
      for (const task of tasks) {
        try {
          // Calcular tiempo restante
          const dueDate = new Date(task.due_date)
          const minutesLeft = Math.round((dueDate.getTime() - now.getTime()) / 60000)
          
          let timeText = `${minutesLeft}m`
          if (minutesLeft > 60) {
            timeText = `${Math.round(minutesLeft / 60)}h`
          }

          await sendNotif({
            userId: task.user_id,
            type: 'task_due',
            data: {
              taskName: task.title
            },
            customBody: `"${task.title}" vence en ${timeText}`
          })

          notificationsCount++
        } catch (err) {
          console.error(`[v0] Error sending notification for task ${task.id}:`, err)
        }
      }
    }

    console.log(`[v0] Sent ${notificationsCount} task reminder notifications`)

    return NextResponse.json({
      success: true,
      tasksFound: tasks?.length || 0,
      notificationsSent: notificationsCount
    })
  } catch (error) {
    console.error('[v0] Task reminder job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
