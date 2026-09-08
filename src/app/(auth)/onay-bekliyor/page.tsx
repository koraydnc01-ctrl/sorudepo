"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function OnayBekliyorPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/giris");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-6 py-10 text-center max-w-sm mx-auto">
      <div className="text-4xl mb-4">⏳</div>
      <h1 className="font-display text-2xl text-ink mb-2">Hesabın onay bekliyor</h1>
      <p className="text-muted text-sm mb-8">
        Kaydın alındı. Hesabın onaylandığında giriş yapabileceksin — bu genelde
        kısa sürer, biraz sonra tekrar dene.
      </p>
      <Button onClick={handleSignOut} loading={loading} variant="secondary">
        Çıkış yap
      </Button>
    </main>
  );
}
