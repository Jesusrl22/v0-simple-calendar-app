// Email HTML templates for team notifications
// Uses a consistent design matching the FutureTask brand

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #0a0a0f;
  color: #e5e7eb;
  padding: 0;
  margin: 0;
`

const CONTAINER_STYLE = `
  max-width: 560px;
  margin: 40px auto;
  background: linear-gradient(135deg, #111118 0%, #16161f 100%);
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  overflow: hidden;
`

const HEADER_STYLE = `
  background: linear-gradient(135deg, #6c47ff 0%, #4f35c7 100%);
  padding: 32px 40px;
  text-align: center;
`

const BODY_STYLE = `
  padding: 32px 40px;
`

const FOOTER_STYLE = `
  padding: 24px 40px;
  border-top: 1px solid #2a2a3a;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
`

const BUTTON_STYLE = `
  display: inline-block;
  background: linear-gradient(135deg, #6c47ff 0%, #4f35c7 100%);
  color: #ffffff !important;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  margin-top: 24px;
`

const TASK_CARD_STYLE = `
  background: #1a1a2e;
  border: 1px solid #2a2a3a;
  border-left: 3px solid #6c47ff;
  border-radius: 8px;
  padding: 16px 20px;
  margin: 20px 0;
`

function buildEmail(options: {
  icon: string
  headerTitle: string
  greeting: string
  mainText: string
  taskTitle?: string
  teamName?: string
  extraText?: string
  ctaText: string
  ctaUrl: string
  language?: string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://futuretask.app"
  const url = options.ctaUrl.startsWith("http") ? options.ctaUrl : `${appUrl}${options.ctaUrl}`

  return `
<!DOCTYPE html>
<html lang="${options.language || "en"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.headerTitle}</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CONTAINER_STYLE}">
    <div style="${HEADER_STYLE}">
      <div style="font-size: 36px; margin-bottom: 12px;">${options.icon}</div>
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">
        ${options.headerTitle}
      </h1>
    </div>
    <div style="${BODY_STYLE}">
      <p style="color: #e5e7eb; font-size: 16px; margin: 0 0 8px 0;">
        ${options.greeting}
      </p>
      <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0;">
        ${options.mainText}
      </p>
      ${options.taskTitle ? `
      <div style="${TASK_CARD_STYLE}">
        <p style="color: #a78bfa; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0;">TAREA</p>
        <p style="color: #e5e7eb; font-size: 16px; font-weight: 600; margin: 0;">${options.taskTitle}</p>
        ${options.teamName ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Equipo: ${options.teamName}</p>` : ""}
      </div>
      ` : ""}
      ${options.extraText ? `<p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0;">${options.extraText}</p>` : ""}
      <div style="text-align: center;">
        <a href="${url}" style="${BUTTON_STYLE}">${options.ctaText}</a>
      </div>
    </div>
    <div style="${FOOTER_STYLE}">
      <p style="margin: 0 0 4px 0;">FutureTask &mdash; Your productivity companion</p>
      <p style="margin: 0;"><a href="${appUrl}/settings" style="color: #6c47ff; text-decoration: none;">Manage notifications</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// 1. Task assigned to you
export function taskAssignedEmail(options: {
  assigneeName: string
  assignerName: string
  taskTitle: string
  teamName: string
  teamId: string
  language?: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://futuretask.app"
  return buildEmail({
    icon: "📋",
    headerTitle: "Se te asignó una tarea",
    greeting: `Hola ${options.assigneeName},`,
    mainText: `<strong style="color: #e5e7eb;">${options.assignerName}</strong> te ha asignado una nueva tarea en el equipo <strong style="color: #e5e7eb;">${options.teamName}</strong>.`,
    taskTitle: options.taskTitle,
    teamName: options.teamName,
    ctaText: "Ver tarea",
    ctaUrl: `${appUrl}/app/teams/${options.teamId}`,
    language: options.language,
  })
}

// 2. Task completed by a team member
export function taskCompletedEmail(options: {
  recipientName: string
  completedByName: string
  taskTitle: string
  teamName: string
  teamId: string
  language?: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://futuretask.app"
  return buildEmail({
    icon: "✅",
    headerTitle: "Tarea completada",
    greeting: `Hola ${options.recipientName},`,
    mainText: `<strong style="color: #e5e7eb;">${options.completedByName}</strong> ha completado una tarea en el equipo <strong style="color: #e5e7eb;">${options.teamName}</strong>.`,
    taskTitle: options.taskTitle,
    teamName: options.teamName,
    ctaText: "Ver equipo",
    ctaUrl: `${appUrl}/app/teams/${options.teamId}`,
    language: options.language,
  })
}

// 3. Task due soon (24h reminder)
export function taskDueSoonEmail(options: {
  assigneeName: string
  taskTitle: string
  teamName: string
  teamId: string
  dueDate: string
  language?: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://futuretask.app"
  return buildEmail({
    icon: "⏰",
    headerTitle: "Tarea próxima a vencer",
    greeting: `Hola ${options.assigneeName},`,
    mainText: `Tienes una tarea que vence en menos de 24 horas en el equipo <strong style="color: #e5e7eb;">${options.teamName}</strong>.`,
    taskTitle: options.taskTitle,
    teamName: options.teamName,
    extraText: `Fecha de vencimiento: <strong style="color: #f59e0b;">${options.dueDate}</strong>`,
    ctaText: "Ver tarea",
    ctaUrl: `${appUrl}/app/teams/${options.teamId}`,
    language: options.language,
  })
}

// 4. New member joined the team
export function newMemberEmail(options: {
  ownerName: string
  newMemberName: string
  newMemberEmail: string
  teamName: string
  teamId: string
  language?: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://futuretask.app"
  return buildEmail({
    icon: "👋",
    headerTitle: "Nuevo miembro en el equipo",
    greeting: `Hola ${options.ownerName},`,
    mainText: `<strong style="color: #e5e7eb;">${options.newMemberName}</strong> (${options.newMemberEmail}) se ha unido al equipo <strong style="color: #e5e7eb;">${options.teamName}</strong>.`,
    teamName: options.teamName,
    ctaText: "Ver equipo",
    ctaUrl: `${appUrl}/app/teams/${options.teamId}`,
    language: options.language,
  })
}
