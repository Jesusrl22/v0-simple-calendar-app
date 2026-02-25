import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("[v0] Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function testEmailFlow() {
  try {
    console.log("[v0] Testing Supabase Email System...");
    console.log("[v0] Email: jesusrayaleon1@gmail.com");
    console.log("");

    // Attempt 1: Try to resend verification email using resend()
    console.log("[v0] Attempt 1: Resending verification email using resend()...");
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: "jesusrayaleon1@gmail.com",
      options: {
        emailRedirectTo: "http://localhost:3000/auth/callback",
      },
    });

    if (resendError) {
      console.log("[v0] Resend result:", resendError.message);
    } else {
      console.log("[v0] SUCCESS! Resend returned no error - email likely sent!");
    }

    console.log("");
    console.log("[v0] ========== DIAGNOSIS ==========");
    console.log("[v0] If you see 'SUCCESS' above:");
    console.log("[v0] - Check your email (jesusrayaleon1@gmail.com)");
    console.log("[v0] - Supabase SMTP is working!");
    console.log("[v0] If you see an error:");
    console.log("[v0] - Supabase SMTP may not be configured");
    console.log("[v0] - Check Supabase Auth settings");

  } catch (err) {
    console.error("[v0] Exception:", err.message);
  }
}

testEmailFlow();
