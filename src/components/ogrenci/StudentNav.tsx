"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/anasayfa", label: "Ana Sayfa" },
  { href: "/sorularim", label: "Sorularım" },
];

export function StudentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/giris");
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-line flex items-center justify-around py-2 z-20">
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
  );
}
