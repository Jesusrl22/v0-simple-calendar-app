import { NextResponse } from "next/server"
import { checkEmailSetup } from "@/app/actions/check-email-setup"

export async function GET() {
  try {
    const result = await checkEmailSetup()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error checking email setup" },
      { status: 500 }
    )
  }
}
