import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name = (user?.user_metadata?.display_name as string | undefined) ?? user?.email;

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h1 className="text-xl font-semibold">Hi, {name}</h1>
      <p className="mt-2 text-sm text-muted">
        You&apos;re logged in. Sessions, hands and your dashboard arrive in the next PRs.
      </p>
    </section>
  );
}
