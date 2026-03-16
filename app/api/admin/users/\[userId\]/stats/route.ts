import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get tasks count
    const { count: tasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get notes count
    const { count: notesCount } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get habits count
    const { count: habitsCount } = await supabase
      .from('habits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get pomodoro sessions count
    const { count: pomodoroCount } = await supabase
      .from('pomodoro_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({
      stats: {
        tasks: tasksCount || 0,
        notes: notesCount || 0,
        habits: habitsCount || 0,
        pomodoros: pomodoroCount || 0,
      },
    })
  } catch (error) {
    console.error('[API] Error fetching user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
