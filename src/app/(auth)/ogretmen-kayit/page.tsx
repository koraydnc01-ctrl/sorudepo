"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function OgretmenKayitPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Kayıt sırasında bir sorun oluştu.");
      setLoading(false);
      return;
    }

    const { error: userError } = await supabase.from("users").insert({
      id: data.user.id,
      role: "teacher",
      full_name: fullName,
      email,
    });

    if (userError) {
      setError(userError.message);
      setLoading(false);
      return;
    }

    await supabase.from("teachers").insert({ id: data.user.id, approved: false });

    router.push("/onay-bekliyor");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
      <h1 className="font-display text-3xl text-ink mb-1">Öğretmen kaydı</h1>
      <p className="text-muted text-sm mb-8">
        Öğrencilerini davet edip sorularını takip etmeye başla.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-ink font-medium block mb-1.5">Ad Soyad</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white focus:border-brand outline-none text-sm"
            placeholder="Koray Öğretmen"
          />
        </div>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white focus:border-brand outline-none text-sm"
            placeholder="En az 6 karakter"
          />
        </div>

        {error && <p className="text-sm text-status-bekliyor">{error}</p>}

        <Button type="submit" size="lg" loading={loading} className="mt-2">
          Hesap oluştur
        </Button>
      </form>

      <p className="text-sm text-center text-muted mt-8">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="text-brand font-medium">
          Giriş yap
        </Link>
      </p>
    </main>
  );
}
