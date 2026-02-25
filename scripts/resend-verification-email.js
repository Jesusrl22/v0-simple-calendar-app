import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("[v0] Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function resendVerificationEmail() {
  try {
    console.log("[v0] Attempting to resend verification email to existing user...");
    console.log("[v0] Email: jesusrayaleon1@gmail.com");

    // Resend verification email using generateLink
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: "jesusrayaleon1@gmail.com",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });

    if (error) {
      console.error("[v0] ERROR:", error.message);
      console.error("[v0] Error code:", error.code);
      return;
    }

    if (data) {
      console.log("[v0] SUCCESS! Link generated:");
      console.log("[v0] Link:", data.properties?.action_link);
      console.log(
        "[v0] This means Supabase CAN generate verification links and should send emails"
      );
    }
  } catch (err) {
    console.error("[v0] Exception:", err.message);
  }
}

resendVerificationEmail();
