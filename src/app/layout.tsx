import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./auth/actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poker Ledger",
  description: "Log live poker sessions, star hands to review, and see your hourly rate.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b border-border bg-card">
          <nav className="mx-auto flex max-w-5xl items-center gap-5 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold text-felt-bright">
              ♠ Poker Ledger
            </Link>
            {user && (
              <>
                <Link href="/" className="text-muted hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/sessions" className="text-muted hover:text-foreground">
                  Sessions
                </Link>
                <Link href="/hands" className="text-muted hover:text-foreground">
                  Hands
                </Link>
                <Link href="/starred" className="text-muted hover:text-foreground">
                  Starred
                </Link>
                <Link href="/import" className="text-muted hover:text-foreground">
                  Import
                </Link>
                <span className="ml-auto text-muted">{user.email}</span>
                <form action={logout}>
                  <button className="rounded-md border border-border px-3 py-1 hover:bg-background">
                    Log out
                  </button>
                </form>
              </>
            )}
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
