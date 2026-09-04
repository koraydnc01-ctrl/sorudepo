"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/ui/NotificationBell";

const LINKS = [
  { href: "/dashboard", label: "Panel" },
  { href: "/arama", label: "Ara" },
];

export function TeacherNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/giris");
    router.refresh();
  }

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 border-b border-line bg-white">
        <span className="font-display text-lg text-ink">Soru Takip</span>
        <NotificationBell />
      </header>

      <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-line bg-white">
        <Link href="/dashboard" className="font-display text-xl text-ink flex items-center gap-2">
          Soru Takip
          <NotificationBell />
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-medium",
                pathname.startsWith(link.href)
                  ? "bg-brand-light text-brand"
                  : "text-muted hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-muted hover:text-status-bekliyor"
          >
            Çıkış yap
          </button>
        </nav>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line flex items-center justify-around py-2 z-20">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-1 text-center py-2 text-xs font-medium rounded-lg mx-2",
              pathname.startsWith(link.href) ? "text-brand" : "text-muted"
            )}
          >
            {link.label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="flex-1 text-center py-2 text-xs font-medium text-muted mx-2"
        >
          Çıkış
        </button>
      </nav>
    </>
  );
}
