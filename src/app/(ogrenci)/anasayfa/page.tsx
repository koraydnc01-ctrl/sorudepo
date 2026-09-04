import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OgrenciAnasayfaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: questions } = await supabase
    .from("questions")
    .select("status")
    .eq("student_id", user.id);

  const list = questions ?? [];
  const tekrarCozulecek = list.filter((q) => q.status === "TEKRAR_COZULECEK").length;
  const bekleyen = list.filter((q) => q.status !== "TAMAMLANDI").length;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <h1 className="font-display text-2xl text-ink">
          Merhaba, {profile?.full_name?.split(" ")[0] ?? "Öğrenci"}
        </h1>
      </div>

      <Link
        href="/soru-ekle"
        className="notebook-card bg-brand text-white flex flex-col items-center justify-center gap-2 py-14 text-center hover:bg-brand-dark transition-colors"
      >
        <span className="text-3xl leading-none">+</span>
        <span className="font-medium">Yapamadığım Soru Ekle</span>
      </Link>

      {tekrarCozulecek > 0 && (
        <Link
          href="/sorularim?sekme=tekrar"
          className="notebook-card px-4 py-3.5 flex items-center justify-between bg-status-tekrarBg border-status-tekrar/20"
        >
          <span className="text-sm text-status-tekrar font-medium">
            {tekrarCozulecek} soru tekrar çözmeni bekliyor
          </span>
        </Link>
      )}

      <div className="flex gap-3">
        <div className="notebook-card flex-1 px-4 py-3.5 text-center">
          <div className="font-display text-2xl text-ink">{bekleyen}</div>
          <div className="text-xs text-muted mt-1">Bekleyen soru</div>
        </div>
        <Link href="/sorularim" className="notebook-card flex-1 px-4 py-3.5 text-center">
          <div className="font-display text-2xl text-ink">{list.length}</div>
          <div className="text-xs text-muted mt-1">Toplam soru</div>
        </Link>
      </div>
    </div>
  );
}
