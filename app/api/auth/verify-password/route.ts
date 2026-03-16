import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Master admin password for viewing user passwords
    const MASTER_PASSWORD = '535353-JesusRaya'

    // Verify against master password
    if (password !== MASTER_PASSWORD) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
