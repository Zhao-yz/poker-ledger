import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// PLAN.md test 1 (data isolation). This runs against the real Supabase project with two
// test accounts, so it needs .env.local (project URL + publishable key) and .env.test.local
// (TEST_USER_A_* / TEST_USER_B_*). Neither file is committed; without them the test is skipped.
for (const name of [".env.local", ".env.test.local"]) {
  const f = fileURLToPath(new URL(`../../${name}`, import.meta.url)); // project root, whatever the working directory
  if (existsSync(f)) process.loadEnvFile(f);
}

const env = process.env;
const ready = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.TEST_USER_A_PASSWORD && env.TEST_USER_B_PASSWORD,
);

function client(): SupabaseClient {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}

async function signIn(email: string, password: string) {
  const c = client();
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c;
}

describe.skipIf(!ready)("data isolation", () => {
  let userA: SupabaseClient;
  let userB: SupabaseClient;
  let sessionId: number;
  const marker = `isolation-test-${Date.now()}`;

  beforeAll(async () => {
    userA = await signIn(env.TEST_USER_A_EMAIL!, env.TEST_USER_A_PASSWORD!);
    userB = await signIn(env.TEST_USER_B_EMAIL!, env.TEST_USER_B_PASSWORD!);

    // Given: User A logs a session at M8trix (with a note we can search for).
    const { data: venue } = await userA.from("venues").upsert({ name: "M8trix" }, { onConflict: "user_id,name" }).select("id").single();
    const { data: session, error } = await userA
      .from("sessions")
      .insert({ venue_id: venue!.id, played_on: "2026-10-30", start_time: "11:00", end_time: "02:00", buy_in: 520, cash_out: 240, notes: marker })
      .select("id")
      .single();
    if (error) throw error;
    sessionId = session.id;
  });

  afterAll(async () => {
    if (sessionId) await userA.from("sessions").delete().eq("id", sessionId);
  });

  it("User A can see the session they logged", async () => {
    const { data } = await userA.from("sessions").select("id").eq("id", sessionId);
    expect(data).toHaveLength(1);
  });

  it("User B's session list does not include User A's session", async () => {
    // When: User B loads their sessions list.
    const { data, error } = await userB.from("sessions").select("id, notes");
    expect(error).toBeNull();
    // Then: none of the rows are User A's.
    expect(data!.some((s) => s.notes === marker)).toBe(false);
  });

  it("User B asking for User A's session id directly gets nothing", async () => {
    const { data } = await userB.from("sessions").select("*").eq("id", sessionId).maybeSingle();
    expect(data).toBeNull();
  });

  it("User B cannot edit or delete User A's session", async () => {
    await userB.from("sessions").update({ cash_out: 99999 }).eq("id", sessionId);
    await userB.from("sessions").delete().eq("id", sessionId);
    const { data } = await userA.from("sessions").select("cash_out").eq("id", sessionId).single();
    expect(Number(data!.cash_out)).toBe(240);
  });
});
