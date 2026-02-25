import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ items: [] })
    }

    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ items: [] })
    }

    const user = await userResponse.json()

    const itemsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/wishlist_items?user_id=eq.${user.id}&order=created_at.desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      },
    )

    if (!itemsResponse.ok) {
      const error = await itemsResponse.json()
      console.error("Failed to fetch wishlist:", error)
      return NextResponse.json({ items: [] })
    }

    const items = await itemsResponse.json()
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, price, priority, url } = body

    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    })

    const user = await userResponse.json()

    const itemResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/wishlist_items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: user.id,
        title,
        description,
        price,
        priority,
        url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    })

    const item = await itemResponse.json()
    return NextResponse.json({ item: item[0] })
  } catch (error) {
    console.error("Error creating wishlist item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, price, priority, url } = body

    const itemResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/wishlist_items?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          title,
          description,
          price,
          priority,
          url,
          updated_at: new Date().toISOString(),
        }),
      },
    )

    const item = await itemResponse.json()
    return NextResponse.json({ item: item[0] })
  } catch (error) {
    console.error("Error updating wishlist item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/wishlist_items?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting wishlist item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
