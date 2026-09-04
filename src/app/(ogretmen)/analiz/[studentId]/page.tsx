import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopicBarChart } from "@/components/ogretmen/TopicBarChart";
import { AiSummaryCard } from "@/components/ogretmen/AiSummaryCard";
import { TAG_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { QuestionTag } from "@/lib/types";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "30", label: "Son 30 gün" },
  { value: "90", label: "Son 90 gün" },
  { value: "all", label: "Tüm zamanlar" },
];

export default async function AnalizPage({
  params,
  searchParams,
}: {
  params: { studentId: string };
  searchParams: { aralik?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const aralik = searchParams.aralik ?? "30";

  const { data: studentUser } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", params.studentId)
    .single();

  const { data: allQuestions } = await supabase
    .from("questions")
    .select("id, created_at, topic:topics(name), question_tags(tag)")
    .eq("student_id", params.studentId)
    .eq("teacher_id", user.id);

  const list = allQuestions ?? [];

  const now = Date.now();
  const cutoff =
    aralik === "30" ? now - 30 * 86400000 : aralik === "90" ? now - 90 * 86400000 : 0;

  const filtered = list.filter((q) => new Date(q.created_at).getTime() >= cutoff);

  const topicCounts = new Map<string, number>();
  for (const q of filtered) {
    const name = (q as any).topic?.name ?? "Diğer";
    topicCounts.set(name, (topicCounts.get(name) ?? 0) + 1);
  }
  const chartData = [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  // son 30 günde belirgin artış gösteren konular için uyarı
  const last30 = list.filter(
    (q) => new Date(q.created_at).getTime() >= now - 30 * 86400000
  );
  const last30Counts = new Map<string, number>();
  for (const q of last30) {
    const name = (q as any).topic?.name ?? "Diğer";
    last30Counts.set(name, (last30Counts.get(name) ?? 0) + 1);
  }
  const warnings = [...last30Counts.entries()].filter(([, count]) => count >= 8);

  // etiket yüzdeleri
  const tagCounts = new Map<QuestionTag, number>();
  let totalTags = 0;
  for (const q of filtered) {
    for (const t of (q as any).question_tags ?? []) {
      tagCounts.set(t.tag, (tagCounts.get(t.tag) ?? 0) + 1);
      totalTags++;
    }
  }
  const tagPercents = [...tagCounts.entries()]
    .map(([tag, count]) => ({
      tag,
      count,
      percent: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href={`/ogrenciler/${params.studentId}`} className="text-xs text-muted">
          {studentUser?.full_name ?? "Öğrenci"}
        </Link>
        <h1 className="font-display text-2xl text-ink mt-1">Konu analizi</h1>
      </div>

      <AiSummaryCard studentId={params.studentId} />

      {warnings.length > 0 && (
        <div className="flex flex-col gap-2">
          {warnings.map(([topic, count]) => (
            <div
              key={topic}
              className="notebook-card px-4 py-3 text-sm bg-status-bekliyorBg border-status-bekliyor/20 text-status-bekliyor"
            >
              Dikkat: {studentUser?.full_name?.split(" ")[0] ?? "Öğrenci"} son 30 günde{" "}
              <strong>{topic}</strong> konusunda {count} soru ekledi.
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/analiz/${params.studentId}?aralik=${f.value}`}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border",
              aralik === f.value
                ? "border-brand text-brand bg-brand-light"
                : "border-line text-muted"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="notebook-card p-4">
        {chartData.length > 0 ? (
          <TopicBarChart data={chartData} />
        ) : (
          <p className="text-sm text-muted">Bu aralıkta soru bulunmuyor.</p>
        )}
      </div>

      {tagPercents.length > 0 && (
        <div className="notebook-card p-4">
          <h2 className="text-sm font-medium text-ink mb-3">Zorlanma nedenleri</h2>
          <div className="flex flex-col gap-2.5">
            {tagPercents.map(({ tag, percent }) => (
              <div key={tag}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink">{TAG_LABELS[tag]}</span>
                  <span className="text-muted">%{percent}</span>
                </div>
                <div className="h-1.5 rounded-full bg-line overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
