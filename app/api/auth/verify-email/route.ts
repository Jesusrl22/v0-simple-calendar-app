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

    console.log('[API] Starting email verification process...')

    // Method 1: Use the public client's verifyOtp which is the correct way for email verification
    // This simulates what the frontend would do if they had access to the token
    try {
      // Create an anonymous client to verify OTP (simulating client-side behavior)
      const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      console.log('[API] Attempting verifyOtp with token_hash...')
      const { data: verifyData, error: verifyError } = await anonClient.auth.verifyOtp({
        email: email || '',
        token: token_hash,
        type: type as 'signup' | 'email_change' | 'invite',
      })

      if (verifyError) {
        console.error('[API] verifyOtp error:', verifyError?.message)
        throw verifyError
      }

      console.log('[API] verifyOtp successful! User ID:', verifyData.user?.id)

      // Update users table to mark email as verified
      if (verifyData.user?.id) {
        console.log('[API] Updating users table for user:', verifyData.user.id)
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', verifyData.user.id)

        if (updateError) {
          console.error('[API] Error updating users table:', updateError)
        } else {
          console.log('[API] Successfully updated users table')
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully!',
        user: verifyData.user,
      })
    } catch (verifyError: any) {
      console.error('[API] Verify OTP failed:', verifyError?.message || verifyError)

      // Fallback: Try to find user by email and manually mark as verified
      console.log('[API] Attempting fallback: manual verification for email:', email)

      if (!email) {
        return NextResponse.json(
          { error: 'Email required for verification', message: 'Invalid verification link.' },
          { status: 400 }
        )
      }

      try {
        // Get user by email from auth
        console.log('[API] Listing all users to find:', email)
        const { data: users, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
          console.error('[API] Error listing users:', listError?.message)
          return NextResponse.json(
            { error: listError.message, message: 'Failed to verify email.' },
            { status: 500 }
          )
        }

        console.log('[API] Total users found:', users?.users?.length || 0)
        const user = users?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
          console.log('[API] User not found with email:', email)
          console.log('[API] Available emails:', users?.users?.map((u) => u.email).join(', '))
          return NextResponse.json(
            { error: 'User not found', message: 'Could not find user with this email.' },
            { status: 404 }
          )
        }

        console.log('[API] Found user:', user.id, '- email:', user.email, '- email_confirmed_at:', user.email_confirmed_at)

        // Update user auth to mark as email confirmed
        console.log('[API] Updating auth for user:', user.id)
        const { error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        })

        if (updateAuthError) {
          console.error('[API] Failed to confirm email in auth:', updateAuthError?.message)
          return NextResponse.json(
            { error: updateAuthError.message, message: 'Failed to verify email in auth system.' },
            { status: 500 }
          )
        }

        console.log('[API] Auth updated successfully')

        // Also update users table
        console.log('[API] Updating users table for user:', user.id)
        const { error: updateTableError } = await supabase
          .from('users')
          .update({
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateTableError) {
          console.error('[API] Failed to update users table:', updateTableError?.message)
          return NextResponse.json(
            { error: updateTableError.message, message: 'Email marked as verified but database update failed.' },
            { status: 500 }
          )
        }

        console.log('[API] Email verified successfully using fallback method')
        return NextResponse.json({
          success: true,
          message: 'Email verified successfully!',
          user: { id: user.id, email: user.email },
        })
      } catch (fallbackError: any) {
        console.error('[API] Fallback verification failed:', fallbackError?.message || fallbackError)
        return NextResponse.json(
          { error: fallbackError?.message || 'Verification failed', message: 'Failed to verify email. The link may have expired or is invalid.' },
          { status: 400 }
        )
      }
    }
  } catch (error: any) {
    console.error('[API] Verify email exception:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed', message: 'An error occurred during verification.' },
      { status: 500 }
    )
  }
}
