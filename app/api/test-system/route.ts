import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import webpush from "web-push"

/**
 * Test System Endpoint
 * Verifica que todos los sistemas (correos, notificaciones, DB) estén configurados correctamente
 * 
 * GET /api/test-system
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    summary: { total: 0, passed: 0, failed: 0 },
  }

  // 1. Test Environment Variables
  console.log("[v0] Testing environment variables...")
  results.checks.envVars = {
    name: "Environment Variables",
    tests: {
      supabaseUrl: {
        status: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ PASS" : "❌ FAIL",
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Missing",
      },
      supabaseAnonKey: {
        status: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ PASS" : "❌ FAIL",
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configured" : "Missing",
      },
      supabaseServiceKey: {
        status: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ PASS" : "❌ FAIL",
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configured" : "Missing",
      },
      smtpHost: {
        status: !!process.env.SMTP_HOST ? "✅ PASS" : "❌ FAIL",
        value: process.env.SMTP_HOST || "Missing",
      },
      smtpPort: {
        status: !!process.env.SMTP_PORT ? "✅ PASS" : "❌ FAIL",
        value: process.env.SMTP_PORT || "Missing",
      },
      smtpUser: {
        status: !!process.env.SMTP_USER ? "✅ PASS" : "❌ FAIL",
        value: process.env.SMTP_USER
          ? process.env.SMTP_USER.substring(0, 3) + "***@" + process.env.SMTP_USER.split("@")[1]
          : "Missing",
      },
      smtpPassword: {
        status: !!process.env.SMTP_PASSWORD ? "✅ PASS" : "❌ FAIL",
        value: process.env.SMTP_PASSWORD ? "Configured (hidden)" : "Missing",
      },
      smtpFrom: {
        status: !!process.env.SMTP_FROM ? "✅ PASS" : "⚠️ WARN",
        value: process.env.SMTP_FROM || "Not set (will use SMTP_USER)",
      },
      vapidPublicKey: {
        status: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "✅ PASS" : "❌ FAIL",
        value: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.substring(0, 10) + "..."
          : "Missing",
      },
      vapidPrivateKey: {
        status: !!process.env.VAPID_PRIVATE_KEY ? "✅ PASS" : "❌ FAIL",
        value: process.env.VAPID_PRIVATE_KEY ? "Configured (hidden)" : "Missing",
      },
      appUrl: {
        status: !!process.env.NEXT_PUBLIC_APP_URL ? "✅ PASS" : "⚠️ WARN",
        value: process.env.NEXT_PUBLIC_APP_URL || "Not set (using localhost)",
      },
    },
  }

  // 2. Test Supabase Connection
  console.log("[v0] Testing Supabase connection...")
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.from("users").select("count").limit(1)

    results.checks.supabase = {
      name: "Supabase Connection",
      status: !error ? "✅ PASS" : "❌ FAIL",
      message: !error ? "Successfully connected to Supabase" : error.message,
    }
  } catch (error: any) {
    results.checks.supabase = {
      name: "Supabase Connection",
      status: "❌ FAIL",
      message: error.message,
    }
  }

  // 3. Test Database Tables
  console.log("[v0] Testing database tables...")
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const tables = [
      "users",
      "tasks",
      "calendar_events",
      "push_subscriptions",
      "achievements",
      "streaks",
      "reviews",
    ]

    const tableTests: any = {}

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1)
        tableTests[table] = {
          status: !error ? "✅ PASS" : "❌ FAIL",
          message: !error ? "Table exists" : error.message,
        }
      } catch (err: any) {
        tableTests[table] = {
          status: "❌ FAIL",
          message: err.message,
        }
      }
    }

    results.checks.databaseTables = {
      name: "Database Tables",
      tests: tableTests,
    }
  } catch (error: any) {
    results.checks.databaseTables = {
      name: "Database Tables",
      status: "❌ FAIL",
      message: error.message,
    }
  }

  // 4. Test SMTP Configuration (without sending email)
  console.log("[v0] Testing SMTP configuration...")
  results.checks.smtp = {
    name: "SMTP Configuration",
    status:
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
        ? "✅ PASS"
        : "❌ FAIL",
    message:
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
        ? "All SMTP variables configured (test sending via /api/test-email)"
        : "Missing SMTP configuration. Check: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD",
    config: {
      host: process.env.SMTP_HOST || "Not set",
      port: process.env.SMTP_PORT || "Not set",
      user: process.env.SMTP_USER
        ? process.env.SMTP_USER.substring(0, 3) + "***@" + process.env.SMTP_USER.split("@")[1]
        : "Not set",
    },
  }

  // 5. Test VAPID Keys
  console.log("[v0] Testing VAPID keys...")
  try {
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        "mailto:support@futuretask.app",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      )

      results.checks.vapid = {
        name: "VAPID Keys",
        status: "✅ PASS",
        message: "VAPID keys configured correctly",
      }
    } else {
      results.checks.vapid = {
        name: "VAPID Keys",
        status: "❌ FAIL",
        message: "Missing VAPID keys. Generate with: npx web-push generate-vapid-keys",
      }
    }
  } catch (error: any) {
    results.checks.vapid = {
      name: "VAPID Keys",
      status: "❌ FAIL",
      message: error.message,
    }
  }

  // 6. Test User Table Structure
  console.log("[v0] Testing user table structure...")
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.from("users").select("*").limit(1).single()

    if (data) {
      const requiredFields = ["reset_token", "reset_token_expires", "email", "name"]
      const missingFields = requiredFields.filter((field) => !(field in data))

      results.checks.userTableStructure = {
        name: "User Table Structure",
        status: missingFields.length === 0 ? "✅ PASS" : "⚠️ WARN",
        message:
          missingFields.length === 0
            ? "All required fields present"
            : `Missing fields: ${missingFields.join(", ")}`,
      }
    } else {
      results.checks.userTableStructure = {
        name: "User Table Structure",
        status: "⚠️ WARN",
        message: "No users found to test structure (create a user first)",
      }
    }
  } catch (error: any) {
    results.checks.userTableStructure = {
      name: "User Table Structure",
      status: "❌ FAIL",
      message: error.message,
    }
  }

  // Calculate summary
  const allChecks = Object.values(results.checks).flatMap((check: any) => {
    if (check.tests) {
      return Object.values(check.tests)
    }
    return [check]
  })

  results.summary.total = allChecks.length
  results.summary.passed = allChecks.filter(
    (check: any) => check.status && check.status.includes("✅")
  ).length
  results.summary.failed = allChecks.filter(
    (check: any) => check.status && check.status.includes("❌")
  ).length
  results.summary.warnings = allChecks.filter(
    (check: any) => check.status && check.status.includes("⚠️")
  ).length

  results.summary.overallStatus =
    results.summary.failed === 0
      ? results.summary.warnings > 0
        ? "⚠️ PASS WITH WARNINGS"
        : "✅ ALL TESTS PASSED"
      : "❌ SOME TESTS FAILED"

  console.log("[v0] System test completed:", results.summary)

  return NextResponse.json(results, { status: 200 })
}
