import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "teacher") redirect("/dashboard");
    if (profile?.role === "student") redirect("/anasayfa");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl text-ink mb-2">Soru Deposu</h1>
      <p className="text-muted mb-10 max-w-xs">
        Yanlışların ve çözemediğin sorular, eksiklerini gösteren en değerli rehberindir.
      </p>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <Link
          href="/ogretmen-kayit"
          className="notebook-card px-5 py-4 text-left hover:border-brand/40 transition-colors"
        >
          <div className="font-medium text-ink">Öğretmenim</div>
          <div className="text-sm text-muted mt-0.5">Hesap oluştur ve öğrencilerimi ekleyeyim</div>
        </Link>
        <Link
          href="/ogrenci-kayit"
          className="notebook-card px-5 py-4 text-left hover:border-brand/40 transition-colors"
        >
          <div className="font-medium text-ink">Öğrenciyim</div>
          <div className="text-sm text-muted mt-0.5">Öğretmenimin davet koduyla katılayım</div>
        </Link>
      </div>

      <Link href="/giris" className="text-sm text-brand mt-8 font-medium">
        Zaten hesabım var, giriş yapayım
      </Link>

      <Link href="/hakkinda" target="_blank" className="text-sm text-muted mt-3 font-medium underline">
        Hakkında
      </Link>
    </main>
  );
}
