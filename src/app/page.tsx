import { redirect } from "next/navigation";

// The dashboard becomes the home page in a later PR; until then, land on the session list.
export default function Home() {
  redirect("/sessions");
}
