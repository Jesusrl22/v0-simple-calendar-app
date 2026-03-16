import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { email } = await request.json()
    const userId = params.userId

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update email in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email: email,
      email_confirm: true, // Auto-confirm the new email
    })

    if (authError) {
      console.error('[API] Error updating email in auth:', authError)
      return NextResponse.json({ error: 'Failed to update email' }, { status: 400 })
    }

    // Update email in users table
    const { error: dbError } = await supabase
      .from('users')
      .update({ email: email })
      .eq('id', userId)

    if (dbError) {
      console.error('[API] Error updating email in database:', dbError)
      return NextResponse.json({ error: 'Failed to update email in database' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}
