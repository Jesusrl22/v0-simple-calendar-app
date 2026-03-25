import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const REAL_USERS = ["alvaro19dvg@gmail.com", "cristina232345@hotmail.com", "jesusrayaleon1@gmail.com"];

async function cleanupUsers() {
  try {
    console.log("[CLEANUP] Starting user verification and cleanup...");
    console.log("[CLEANUP] Real users to keep:", REAL_USERS);

    // 1. Mark real users as verified
    console.log("\n[CLEANUP] Step 1: Marking real users as verified...");
    const { error: updateError } = await supabase
      .from("users")
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .in("email", REAL_USERS);

    if (updateError) {
      console.error("[CLEANUP] Error marking users verified:", updateError);
      return;
    }
    console.log("[CLEANUP] ✓ Real users marked as verified");

    // 2. Get all current users
    console.log("\n[CLEANUP] Step 2: Fetching all users...");
    const { data: allUsers, error: fetchError } = await supabase
      .from("users")
      .select("id, email, email_verified");

    if (fetchError) {
      console.error("[CLEANUP] Error fetching users:", fetchError);
      return;
    }

    const usersToDelete = allUsers.filter((u) => !REAL_USERS.includes(u.email));
    console.log(`[CLEANUP] Found ${allUsers.length} total users`);
    console.log(`[CLEANUP] Will keep: ${REAL_USERS.length} real users`);
    console.log(`[CLEANUP] Will delete: ${usersToDelete.length} bot/spam users`);

    if (usersToDelete.length > 0) {
      console.log("\n[CLEANUP] Step 3: Deleting unverified users...");
      const deleteIds = usersToDelete.map((u) => u.id);

      // Delete from user_credentials first (foreign key constraint)
      const { error: credError } = await supabase
        .from("user_credentials")
        .delete()
        .in("user_id", deleteIds);

      if (credError) {
        console.warn("[CLEANUP] Warning deleting credentials:", credError.message);
      } else {
        console.log(`[CLEANUP] ✓ Deleted ${usersToDelete.length} credential records`);
      }

      // Delete from users
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .in("id", deleteIds);

      if (deleteError) {
        console.error("[CLEANUP] Error deleting users:", deleteError);
        return;
      }
      console.log(`[CLEANUP] ✓ Deleted ${usersToDelete.length} user records`);
    }

    // 3. Verify final state
    console.log("\n[CLEANUP] Step 4: Verifying final state...");
    const { data: finalUsers, error: finalError } = await supabase
      .from("users")
      .select("id, email, email_verified, created_at")
      .order("created_at", { ascending: false });

    if (finalError) {
      console.error("[CLEANUP] Error fetching final users:", finalError);
      return;
    }

    console.log("\n[CLEANUP] ✓ FINAL USERS IN DATABASE:");
    console.log("================================================");
    finalUsers.forEach((u) => {
      console.log(`  Email: ${u.email}`);
      console.log(`  Verified: ${u.email_verified}`);
      console.log(`  ID: ${u.id}`);
      console.log("  ---");
    });
    console.log("================================================");
    console.log(
      `[CLEANUP] ✓ Database cleaned! Total users: ${finalUsers.length}`
    );
    console.log("[CLEANUP] All remaining users are verified real accounts");
  } catch (error) {
    console.error("[CLEANUP] Unexpected error:", error);
  }
}

cleanupUsers();
