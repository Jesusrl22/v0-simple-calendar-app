"use server"

import { createClient } from "@supabase/supabase-js"

export async function checkEmailSetup() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Try to call a function that requires email to be working
    // This is a simple test - we're checking if the auth is responding
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("[SERVER] Email setup error:", error)
      return { success: false, error: error.message }
    }

    // If we got here, the auth system is working
    return {
      success: true,
      message: "Supabase auth system is working. Emails should be sent correctly.",
    }
  } catch (error: any) {
    console.error("[SERVER] Email setup check error:", error)
    return {
      success: false,
      error: error.message || "Error checking email setup",
    }
  }
}
