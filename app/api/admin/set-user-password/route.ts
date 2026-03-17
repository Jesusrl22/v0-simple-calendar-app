import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, password } = body

    if (!userId || !password) {
      return NextResponse.json({ error: 'userId and password required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    console.log('[v0] Setting password for user:', userId)

    // First check if credentials record exists
    const { data: existing } = await supabase
      .from('user_credentials')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_credentials')
        .update({
          password_hash: password,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('[v0] Error updating credentials:', updateError)
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
      }

      console.log('[v0] Password updated for user:', userId)
    } else {
      // Create new record
      const { error: insertError } = await supabase.from('user_credentials').insert({
        user_id: userId,
        password_hash: password,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('[v0] Error creating credentials:', insertError)
        return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
      }

      console.log('[v0] Password set for user:', userId)
    }

    return NextResponse.json({ success: true, message: 'Password saved successfully' })
  } catch (error) {
    console.error('[v0] Error setting password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
