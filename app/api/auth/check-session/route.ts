import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value
  const refreshToken = cookieStore.get("sb-refresh-token")?.value

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ hasSession: false, user: null })
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.ok) {
      const userData = await response.json()
      return NextResponse.json({
        hasSession: true,
        user: userData,
      })
    }

    if (refreshToken) {
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      )

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()

        const newResponse = NextResponse.json({
          hasSession: true,
          user: refreshData.user,
        })

        newResponse.cookies.set("sb-access-token", refreshData.access_token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        })

        if (refreshData.refresh_token) {
          newResponse.cookies.set("sb-refresh-token", refreshData.refresh_token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
          })
        }

        return newResponse
      }
    }

    const noSessionResponse = NextResponse.json({ hasSession: false, user: null })
    noSessionResponse.cookies.delete("sb-access-token")
    noSessionResponse.cookies.delete("sb-refresh-token")
    return noSessionResponse
  } catch (error) {
    const errorResponse = NextResponse.json({ hasSession: false, user: null })
    errorResponse.cookies.delete("sb-access-token")
    errorResponse.cookies.delete("sb-refresh-token")
    return errorResponse
  }
}
