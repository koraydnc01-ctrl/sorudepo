"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function SifremiUnuttumPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-belirle`,
    });

    if (resetError) {
      setError("Bir sorun oluştu, tekrar dene.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
      <h1 className="font-display text-3xl text-ink mb-1">Şifremi unuttum</h1>
      <p className="text-muted text-sm mb-8">
        E-posta adresine bir şifre sıfırlama linki gönderelim.
      </p>

      {sent ? (
        <div className="px-3.5 py-2.5 rounded-lg bg-status-tamamBg text-status-tamam text-sm">
          Email adresine bir sıfırlama linki gönderdik. Gelen kutunu (ve spam klasörünü) kontrol et.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-ink font-medium block mb-1.5">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white focus:border-brand outline-none text-sm"
              placeholder="ornek@eposta.com"
            />
          </div>
          {error && <p className="text-sm text-status-bekliyor">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="mt-2">
            Sıfırlama linki gönder
          </Button>
        </form>
      )}

      <p className="text-sm text-center text-muted mt-8">
        <Link href="/giris" className="text-brand font-medium">
          Giriş sayfasına dön
        </Link>
      </p>
    </main>
  );
}
