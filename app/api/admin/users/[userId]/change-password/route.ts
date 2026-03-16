import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { password } = await request.json()
    const userId = params.userId

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update password in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: password,
    })

    if (error) {
      console.error('[API] Error updating password:', error)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
