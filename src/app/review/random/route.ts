import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// "Review a random hand": picks one of the user's starred hands at random and opens it.
// Falls back to the Starred page (with a note) when nothing is starred yet.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.from("stars").select("hand_id");
  const ids = (data ?? []).map((r) => r.hand_id as number);
  const url = request.nextUrl.clone();
  url.search = "";
  if (ids.length === 0) {
    url.pathname = "/starred";
    url.searchParams.set("empty", "1");
  } else {
    url.pathname = `/hands/${ids[Math.floor(Math.random() * ids.length)]}`;
    url.searchParams.set("from", "random");
  }
  return NextResponse.redirect(url);
}
