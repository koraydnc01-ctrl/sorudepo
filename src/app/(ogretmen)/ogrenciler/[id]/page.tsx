import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionCard } from "@/components/ogretmen/QuestionCard";
import type { Question } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OgrenciDetayPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: studentUser } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", params.id)
    .single();

  const { data: questions } = await supabase
    .from("questions")
    .select(
      "*, topic:topics(name), subject:subjects(name), teacher_notes(*), question_tags(tag)"
    )
    .eq("student_id", params.id)
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  const list = (questions ?? []) as Question[];
  const bekleyen = list.filter((q) => q.status !== "TAMAMLANDI").length;
  const cozulen = list.filter((q) => q.status === "TAMAMLANDI").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/dashboard" className="text-xs text-muted">
          Panel
        </Link>
        <h1 className="font-display text-2xl text-ink mt-1">
          {studentUser?.full_name ?? "Öğrenci"}
        </h1>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-ink">
            <span className="font-medium">{list.length}</span>{" "}
            <span className="text-muted">toplam soru</span>
          </span>
          <span className="text-status-bekliyor">
            <span className="font-medium">{bekleyen}</span>{" "}
            <span className="text-muted">bekleyen</span>
          </span>
          <span className="text-status-tamam">
            <span className="font-medium">{cozulen}</span>{" "}
            <span className="text-muted">çözülen</span>
          </span>
        </div>
        <Link
          href={`/analiz/${params.id}`}
          className="inline-block text-sm text-brand font-medium mt-3"
        >
          Konu analizini gör
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {list.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
        {list.length === 0 && (
          <p className="text-sm text-muted">Bu öğrenci henüz soru yüklemedi.</p>
        )}
      </div>
    </div>
  );
}
