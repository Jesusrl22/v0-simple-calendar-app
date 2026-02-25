import { NextResponse, type NextRequest } from "next/server"

function setCookieOptions(isProduction: boolean) {
  return {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
  }
}

async function tryRefreshToken(
  supabaseUrl: string,
  supabaseAnonKey: string,
  refreshToken: string,
): Promise<{ access_token: string; refresh_token?: string } | null> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()
  const isProduction = process.env.NODE_ENV === "production"
  const pathname = request.nextUrl.pathname

  // Skip static assets and API routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname === "/email-test" ||
    pathname === "/test-smtp" ||
    pathname === "/test-config"
  ) {
    return response
  }

  const accessToken = request.cookies.get("sb-access-token")?.value
  const refreshToken = request.cookies.get("sb-refresh-token")?.value
  const isAppRoute = pathname.startsWith("/app")
  const isAuthRoute = pathname === "/login" || pathname === "/signup"

  console.log("[v0] middleware", pathname, "hasAccess:", !!accessToken, "hasRefresh:", !!refreshToken)

  // No tokens at all
  if (!accessToken && !refreshToken) {
    if (isAppRoute) {
      console.log("[v0] no tokens, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return response
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  // If we only have a refresh token, try to get new tokens
  if (!accessToken && refreshToken) {
    const refreshed = await tryRefreshToken(supabaseUrl, supabaseAnonKey, refreshToken)
    if (refreshed) {
      response.cookies.set("sb-access-token", refreshed.access_token, {
        ...setCookieOptions(isProduction),
        maxAge: 60 * 60 * 24 * 7,
      })
      if (refreshed.refresh_token) {
        response.cookies.set("sb-refresh-token", refreshed.refresh_token, {
          ...setCookieOptions(isProduction),
          maxAge: 60 * 60 * 24 * 30,
        })
      }
      return response
    }
    // Refresh failed — clear cookies and redirect if needed
    response.cookies.delete("sb-access-token")
    response.cookies.delete("sb-refresh-token")
    if (isAppRoute) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return response
  }

  // We have an access token — decode the JWT expiry locally to avoid a network call
  // JWT payload is base64url encoded in segment [1]
  try {
    const payloadBase64 = accessToken!.split(".")[1]
    if (payloadBase64) {
      const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"))
      const expiresAt = payload.exp * 1000 // ms
      const now = Date.now()
      const bufferMs = 60 * 1000 // refresh 60s before expiry

      console.log("[v0] token exp:", new Date(expiresAt).toISOString(), "now:", new Date(now).toISOString(), "valid:", now < expiresAt - bufferMs)

      if (now < expiresAt - bufferMs) {
        // Token still valid — allow through without a network call
        return response
      }

      // Token is expired or about to expire — try refresh
      if (refreshToken) {
        const refreshed = await tryRefreshToken(supabaseUrl, supabaseAnonKey, refreshToken)
        if (refreshed) {
          response.cookies.set("sb-access-token", refreshed.access_token, {
            ...setCookieOptions(isProduction),
            maxAge: 60 * 60 * 24 * 7,
          })
          if (refreshed.refresh_token) {
            response.cookies.set("sb-refresh-token", refreshed.refresh_token, {
              ...setCookieOptions(isProduction),
              maxAge: 60 * 60 * 24 * 30,
            })
          }
          return response
        }
      }

      // Could not refresh — clear and redirect if on protected route
      console.log("[v0] refresh failed, clearing cookies")
      response.cookies.delete("sb-access-token")
      response.cookies.delete("sb-refresh-token")
      if (isAppRoute) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return response
    }
  } catch {
    // JWT decode failed — still allow through if we have a token,
    // don't blindly delete cookies on a parse error
  }

  return response
}
