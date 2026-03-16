import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await userResponse.json()

    // Check if user is admin
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: adminUser } = await supabase.from('users').select('is_admin').eq('id', user.id).single()

    if (!adminUser?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get user password from user_credentials
    console.log('[v0] Fetching password for user:', userId)
    
    const { data: credentials, error } = await supabase
      .from('user_credentials')
      .select('password_hash')
      .eq('user_id', userId.toString())
      .maybeSingle()

    console.log('[v0] Query result:', { credentials, error })

    if (error) {
      console.error('[v0] Error fetching user credentials:', error)
      return NextResponse.json({ error: 'Error fetching credentials' }, { status: 404 })
    }

    if (!credentials) {
      console.warn('[v0] No credentials found for user:', userId)
      return NextResponse.json({ error: 'No password found' }, { status: 404 })
    }

    // Return the password (stored in plain text in password_hash field for admin)
    return NextResponse.json({
      password: credentials.password_hash || 'No password set',
    })
  } catch (error: any) {
    console.error('Error fetching user password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
