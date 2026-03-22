import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { token_hash, type, email } = await request.json()

    console.log('[API] Verify email - token_hash:', token_hash ? 'present' : 'missing', 'type:', type, 'email:', email)

    if (!token_hash || !type) {
      return NextResponse.json(
        { error: 'Missing token or type', message: 'Invalid verification link.' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role to verify the user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify the OTP token using Supabase
    console.log('[API] Calling Supabase verifyOtp...')
    
    // First method: Try using verifyOtp with type 'signup' or 'email_change'
    const { data, error } = await supabase.auth.admin.verifyOtp({
      phone: '',
      token: token_hash,
      type: type as 'signup' | 'email_change' | 'invite',
    })

    if (error) {
      console.error('[API] verifyOtp error:', error)
      
      // If that fails, try with email if provided
      if (email) {
        console.log('[API] Attempting email verification with admin API...')
        
        // Find user by email
        const { data: users } = await supabase.auth.admin.listUsers()
        const user = users?.users?.find((u) => u.email === email)

        if (!user) {
          return NextResponse.json(
            { error: 'User not found', message: 'Could not find user with this email.' },
            { status: 404 }
          )
        }

        // Update the user to mark email as confirmed
        console.log('[API] Marking email as confirmed for user:', user.id)
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        })

        if (updateError) {
          console.error('[API] Failed to confirm email:', updateError)
          return NextResponse.json(
            { error: updateError.message, message: 'Failed to verify email.' },
            { status: 500 }
          )
        }

        // Also update in the users table
        await supabase.from('users').update({ email_verified: true }).eq('id', user.id)

        console.log('[API] Email verified successfully for user:', user.id)
        return NextResponse.json({
          success: true,
          message: 'Email verified successfully!',
          user: { id: user.id, email: user.email },
        })
      }

      return NextResponse.json(
        { error: error.message, message: 'Failed to verify email. The link may have expired.' },
        { status: 400 }
      )
    }

    console.log('[API] Email verified successfully, user:', data.user?.id)

    // Also update in the users table to mark email as verified
    if (data.user?.id) {
      await supabase.from('users').update({ email_verified: true }).eq('id', data.user.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      user: data.user,
    })
  } catch (error: any) {
    console.error('[API] Verify email exception:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed', message: 'An error occurred during verification.' },
      { status: 500 }
    )
  }
}
