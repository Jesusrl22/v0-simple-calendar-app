import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6")
    const sortBy = searchParams.get("sortBy") || "rating" // rating, helpful, newest

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })

    let query = supabase
      .from("user_reviews")
      .select("id, name, rating, title, comment, helpful_count, created_at")
      .limit(limit)

    if (sortBy === "rating") {
      query = query.order("rating", { ascending: false }).order("helpful_count", { ascending: false })
    } else if (sortBy === "helpful") {
      query = query.order("helpful_count", { ascending: false }).order("rating", { ascending: false })
    } else if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error

    return Response.json({ reviews: data || [] })
  } catch (error) {
    console.error("[v0] Reviews GET error:", error)
    return Response.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, rating, title, comment, user_id } = body

    if (!name || !email || !rating || !comment) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })

    const { data, error } = await supabase
      .from("user_reviews")
      .insert([
        {
          user_id: user_id || null,
          name,
          email,
          rating,
          title: title || null,
          comment,
        },
      ])
      .select()

    if (error) throw error

    return Response.json({ review: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Reviews POST error:", error)
    return Response.json({ error: "Failed to create review" }, { status: 500 })
  }
}
