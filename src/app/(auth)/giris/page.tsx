"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function GirisPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "teacher") router.push("/dashboard");
    else if (profile?.role === "student") router.push("/anasayfa");
    else router.push("/");

    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
      <h1 className="font-display text-3xl text-ink mb-1">Giriş yap</h1>
      <p className="text-muted text-sm mb-8">Soru Takip hesabına giriş yap.</p>

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
        <div>
          <label className="text-sm text-ink font-medium block mb-1.5">Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white focus:border-brand outline-none text-sm"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-status-bekliyor">{error}</p>}

        <Button type="submit" size="lg" loading={loading} className="mt-2">
          Giriş yap
        </Button>
      </form>

      <div className="flex flex-col gap-2 mt-8 text-sm text-center text-muted">
        <Link href="/ogretmen-kayit" className="text-brand font-medium">
          Öğretmen olarak kayıt ol
        </Link>
        <Link href="/ogrenci-kayit" className="text-brand font-medium">
          Öğrenci olarak kayıt ol
        </Link>
      </div>
    </main>
  );
}
