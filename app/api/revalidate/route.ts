import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'test-secret'

export async function POST(request: NextRequest) {
  try {
    // Validar que la solicitud sea legítima
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
    }

    const secret = authHeader.split(' ')[1]
    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const body = await request.json()
    const path = body.path || '/'

    revalidatePath(path)

    return NextResponse.json({
      revalidated: true,
      path: path,
      message: `Path ${path} has been revalidated successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'POST to this endpoint with Authorization header to revalidate paths',
    usage: 'curl -X POST http://localhost:3000/api/revalidate -H "Authorization: Bearer YOUR_SECRET" -d {"path":"/"}',
  })
}
