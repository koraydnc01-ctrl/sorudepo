"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function SifreBelirlePage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Şifre güncellenemedi, linkin süresi dolmuş olabilir.");
      setLoading(false);
      return;
    }

    router.push("/giris");
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
      <h1 className="font-display text-3xl text-ink mb-1">Yeni şifre belirle</h1>
      <p className="text-muted text-sm mb-8">
        Hesabın için yeni bir şifre gir.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-ink font-medium block mb-1.5">Yeni şifre</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white focus:border-brand outline-none text-sm"
            placeholder="En az 6 karakter"
          />
        </div>
        {error && <p className="text-sm text-status-bekliyor">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="mt-2">
          Şifreyi güncelle
        </Button>
      </form>
    </main>
  );
}
