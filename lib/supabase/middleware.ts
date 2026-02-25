import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.includes(".") ||
    request.nextUrl.pathname === "/email-test" ||
    request.nextUrl.pathname === "/test-smtp" ||
    request.nextUrl.pathname === "/test-config"
  ) {
    return response
  }

  const accessToken = request.cookies.get("sb-access-token")?.value
  const refreshToken = request.cookies.get("sb-refresh-token")?.value

  if (request.nextUrl.pathname.startsWith("/app")) {
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") {
    return response
  }

  if (!accessToken && !refreshToken) {
    return response
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  try {
    if (!accessToken) {
      if (refreshToken) {
        const refreshResponse = await fetch(
          `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          },
        )

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          response.cookies.set("sb-access-token", refreshData.access_token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          })
          if (refreshData.refresh_token) {
            response.cookies.set("sb-refresh-token", refreshData.refresh_token, {
              path: "/",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 30,
            })
          }
          return response
        } else {
          response.cookies.delete("sb-access-token")
          response.cookies.delete("sb-refresh-token")
          if (request.nextUrl.pathname.startsWith("/app")) {
            return NextResponse.redirect(new URL("/login", request.url))
          }
        }
      }
      return response
    }

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (userResponse.ok) {
      return response
    }

    if (refreshToken) {
      const refreshResponse = await fetch(
        `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      )

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        response.cookies.set("sb-access-token", refreshData.access_token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        })
        if (refreshData.refresh_token) {
          response.cookies.set("sb-refresh-token", refreshData.refresh_token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
          })
        }
        return response
      }
    }

    response.cookies.delete("sb-access-token")
    response.cookies.delete("sb-refresh-token")

    if (request.nextUrl.pathname.startsWith("/app")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return response
  } catch {
    response.cookies.delete("sb-access-token")
    response.cookies.delete("sb-refresh-token")

    if (request.nextUrl.pathname.startsWith("/app")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return response
  }
}
