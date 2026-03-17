import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, name } = body

    if (!userId || !name) {
      return NextResponse.json({ error: 'userId and name required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    console.log('[v0] Updating name for user:', userId)

    // Update user name in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[v0] Error updating user name:', updateError)
      return NextResponse.json({ error: 'Failed to update name' }, { status: 500 })
    }

    console.log('[v0] User name updated successfully:', userId)

    return NextResponse.json({
      success: true,
      message: 'Name updated successfully.',
    })
  } catch (error) {
    console.error('[v0] Error updating name:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
