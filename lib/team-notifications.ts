/**
 * Team notification helpers.
 * Each function:
 *  1. Inserts an in-app notification row into `notifications`
 *  2. Sends an email via Brevo (fire-and-forget, never throws)
 */
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "./brevo"
import {
  taskAssignedEmail,
  taskCompletedEmail,
  taskDueSoonEmail,
  newMemberEmail,
} from "./email-templates"

const getServiceSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

// ─── helpers ──────────────────────────────────────────────────────────────────

async function getUserInfo(userId: string): Promise<{ name: string; email: string; language?: string } | null> {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from("users")
    .select("name, email, language")
    .eq("id", userId)
    .single()
  return data
}

async function storeNotification(opts: {
  userId: string
  title: string
  message: string
  type: string
  taskId?: string
}) {
  const supabase = getServiceSupabase()
  await supabase.from("notifications").insert({
    user_id: opts.userId,
    title: opts.title,
    message: opts.message,
    type: opts.type,
    task_id: opts.taskId ?? null,
    read: false,
    timestamp: new Date().toISOString(),
  })
}

// ─── public notification functions ────────────────────────────────────────────

/**
 * Notify a user they were assigned a team task.
 */
export async function notifyTaskAssigned(opts: {
  assigneeId: string
  assignerName: string
  taskId: string
  taskTitle: string
  teamId: string
  teamName: string
}) {
  const assignee = await getUserInfo(opts.assigneeId)
  if (!assignee) return

  const title = "Se te asignó una tarea"
  const message = `${opts.assignerName} te asignó: ${opts.taskTitle}`

  await storeNotification({
    userId: opts.assigneeId,
    title,
    message,
    type: "task_assigned",
    taskId: opts.taskId,
  })

  await sendEmail({
    to: assignee.email,
    subject: `${opts.assignerName} te asignó una tarea en ${opts.teamName}`,
    htmlContent: taskAssignedEmail({
      assigneeName: assignee.name || assignee.email,
      assignerName: opts.assignerName,
      taskTitle: opts.taskTitle,
      teamName: opts.teamName,
      teamId: opts.teamId,
      language: assignee.language,
    }),
    textContent: `${message} — Equipo: ${opts.teamName}`,
  }).catch(() => {}) // fire-and-forget
}

/**
 * Notify all team members (except completer) that a task was completed.
 */
export async function notifyTaskCompleted(opts: {
  completedByUserId: string
  completedByName: string
  taskId: string
  taskTitle: string
  teamId: string
  teamName: string
}) {
  const supabase = getServiceSupabase()

  // Get all team members except the person who completed
  const { data: members } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", opts.teamId)
    .neq("user_id", opts.completedByUserId)

  if (!members || members.length === 0) return

  await Promise.all(
    members.map(async (m) => {
      const recipient = await getUserInfo(m.user_id)
      if (!recipient) return

      const title = "Tarea completada"
      const message = `${opts.completedByName} completó: ${opts.taskTitle}`

      await storeNotification({
        userId: m.user_id,
        title,
        message,
        type: "task_completed",
        taskId: opts.taskId,
      })

      await sendEmail({
        to: recipient.email,
        subject: `${opts.completedByName} completó una tarea en ${opts.teamName}`,
        htmlContent: taskCompletedEmail({
          recipientName: recipient.name || recipient.email,
          completedByName: opts.completedByName,
          taskTitle: opts.taskTitle,
          teamName: opts.teamName,
          teamId: opts.teamId,
          language: recipient.language,
        }),
        textContent: `${message} — Equipo: ${opts.teamName}`,
      }).catch(() => {})
    })
  )
}

/**
 * Notify the assigned user that their team task is due within 24 hours.
 */
export async function notifyTaskDueSoon(opts: {
  assigneeId: string
  taskId: string
  taskTitle: string
  teamId: string
  teamName: string
  dueDate: string
}) {
  const assignee = await getUserInfo(opts.assigneeId)
  if (!assignee) return

  const dueDateFormatted = new Date(opts.dueDate).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

  const title = "Tarea próxima a vencer"
  const message = `"${opts.taskTitle}" vence en menos de 24h`

  await storeNotification({
    userId: opts.assigneeId,
    title,
    message,
    type: "task_due_soon",
    taskId: opts.taskId,
  })

  await sendEmail({
    to: assignee.email,
    subject: `Recordatorio: "${opts.taskTitle}" vence pronto`,
    htmlContent: taskDueSoonEmail({
      assigneeName: assignee.name || assignee.email,
      taskTitle: opts.taskTitle,
      teamName: opts.teamName,
      teamId: opts.teamId,
      dueDate: dueDateFormatted,
      language: assignee.language,
    }),
    textContent: `${message} — Equipo: ${opts.teamName}`,
  }).catch(() => {})
}

/**
 * Notify the team owner(s) that a new member joined.
 */
export async function notifyNewMember(opts: {
  newMemberId: string
  teamId: string
  teamName: string
}) {
  const supabase = getServiceSupabase()

  const newMember = await getUserInfo(opts.newMemberId)
  if (!newMember) return

  // Get owners and admins
  const { data: owners } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", opts.teamId)
    .in("role", ["owner", "admin"])
    .neq("user_id", opts.newMemberId)

  if (!owners || owners.length === 0) return

  await Promise.all(
    owners.map(async (o) => {
      const owner = await getUserInfo(o.user_id)
      if (!owner) return

      const title = "Nuevo miembro en el equipo"
      const message = `${newMember.name || newMember.email} se unió a ${opts.teamName}`

      await storeNotification({
        userId: o.user_id,
        title,
        message,
        type: "new_team_member",
      })

      await sendEmail({
        to: owner.email,
        subject: `${newMember.name || newMember.email} se unió a ${opts.teamName}`,
        htmlContent: newMemberEmail({
          ownerName: owner.name || owner.email,
          newMemberName: newMember.name || newMember.email,
          newMemberEmail: newMember.email,
          teamName: opts.teamName,
          teamId: opts.teamId,
          language: owner.language,
        }),
        textContent: message,
      }).catch(() => {})
    })
  )
}
