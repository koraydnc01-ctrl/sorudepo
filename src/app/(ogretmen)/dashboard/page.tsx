import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/ogretmen/StatCard";
import { StudentListItem } from "@/components/ogretmen/StudentListItem";
import { AddStudentCard } from "@/components/ogretmen/AddStudentCard";
import type { StudentRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  const { data: students } = await supabase
    .from("students")
    .select("id, users(full_name)")
    .eq("teacher_id", user.id);

  const { data: pendingInvites } = await supabase
    .from("invite_codes")
    .select("id, code, student_name")
    .eq("teacher_id", user.id)
    .eq("used", false);

  const { data: questions } = await supabase
    .from("questions")
       .select("id, student_id, status, created_at, updated_at, topic:topics(name), question_tags(id)")
    .eq("teacher_id", user.id);

  const allQuestions = questions ?? [];

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const bekleyenToplam = allQuestions.filter((q) => q.status === "BEKLIYOR").length;
  const buHaftaEklenen = allQuestions.filter((q) => q.created_at >= weekAgo).length;
  const buHaftaCozulen = allQuestions.filter(
    (q) => q.status === "TAMAMLANDI" && q.updated_at >= weekAgo
  ).length;

  // en fazla zorlanılan 5 konu (toplam soru sayısına göre)
  const topicCounts = new Map<string, number>();
  for (const q of allQuestions) {
    const topicName = (q as any).topic?.name ?? "Diğer";
   const retryCount = (q as any).question_tags?.length ?? 0;
    topicCounts.set(topicName, (topicCounts.get(topicName) ?? 0) + retryCount);
  }
  const topTopics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const studentRows: StudentRow[] = (students ?? []).map((s: any) => {
    const studentQuestions = allQuestions.filter((q) => q.student_id === s.id);
    return {
      id: s.id,
      full_name: s.users?.full_name ?? "İsimsiz öğrenci",
      invite_code: null,
      invite_used: true,
      bekleyen: studentQuestions.filter((q) =>
        ["BEKLIYOR", "DERSTE_ELE_ALINDI", "TEKRAR_COZULECEK", "OGRENCI_COZDU"].includes(
          q.status
        )
      ).length,
      cozulen: studentQuestions.filter((q) => q.status === "TAMAMLANDI").length,
      toplam: studentQuestions.length,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">
          Merhaba, {profile?.full_name?.split(" ")[0] ?? "Öğretmen"}
        </h1>
        <p className="text-muted text-sm mt-1">İşte bu haftanın özeti.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Toplam öğrenci" value={studentRows.length} />
        <StatCard label="Toplam bekleyen soru" value={bekleyenToplam} />
        <StatCard label="Bu hafta eklenen" value={buHaftaEklenen} />
        <StatCard label="Bu hafta çözülen" value={buHaftaCozulen} />
      </div>

      {topTopics.length > 0 && (
        <div className="notebook-card p-4">
          <h2 className="text-sm font-medium text-ink mb-3">
            En fazla zorlanılan konular
          </h2>
          <div className="flex flex-col gap-2">
            {topTopics.map(([topic, count]) => (
              <div key={topic} className="flex items-center justify-between text-sm">
                <span className="text-ink">{topic}</span>
                <span className="text-muted">{count} soru</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-ink mb-3">Öğrenciler</h2>
        <div className="flex flex-col gap-2.5">
          <AddStudentCard teacherId={user.id} />

          {(pendingInvites ?? []).map((invite) => (
            <div
              key={invite.id}
              className="notebook-card px-4 py-3.5 flex items-center justify-between border-dashed"
            >
              <div>
                <div className="font-medium text-ink">{invite.student_name}</div>
                <div className="text-xs text-status-derste mt-0.5">
                  Davet bekleniyor · {invite.code}
                </div>
              </div>
            </div>
          ))}

          {studentRows.map((student) => (
            <StudentListItem key={student.id} student={student} />
          ))}

          {studentRows.length === 0 && (pendingInvites ?? []).length === 0 && (
            <p className="text-sm text-muted px-1">
              Henüz öğrenci eklemedin. Yukarıdaki butonla ilk öğrenciyi ekle.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
