"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs } from "@/components/ui/Tabs";
import { StudentQuestionCard } from "@/components/ogrenci/StudentQuestionCard";
import type { Question } from "@/lib/types";

const TAB_STATUS: Record<string, Question["status"][] | null> = {
  bekleyen: ["BEKLIYOR", "DERSTE_ELE_ALINDI"],
  tekrar: ["TEKRAR_COZULECEK"],
  tamamlanan: ["TAMAMLANDI"],
  tumu: null,
};

function SorularimContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("sekme") ?? "bekleyen");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("questions")
      .select("*, topic:topics(name), subject:subjects(name), teacher_notes(*), question_tags(tag)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    setQuestions((data ?? []) as Question[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statuses = TAB_STATUS[tab];
  const filtered = statuses ? questions.filter((q) => statuses.includes(q.status)) : questions;

  const grouped = new Map<string, Question[]>();
  for (const q of filtered) {
    const topicName = (q as any).topic?.name ?? "Konusuz";
    if (!grouped.has(topicName)) grouped.set(topicName, []);
    grouped.get(topicName)!.push(q);
  }
  const groupedEntries = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl text-ink pt-2">Sorularım</h1>
      <Tabs
        tabs={[
          { value: "bekleyen", label: "Bekleyen" },
          { value: "tekrar", label: "Tekrar Çözülecek" },
          { value: "tamamlanan", label: "Tamamlanan" },
          { value: "tumu", label: "Tümü" },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="flex flex-col gap-5">
        {loading && <p className="text-sm text-muted">Yükleniyor...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted">Bu sekmede soru bulunmuyor.</p>
        )}
        {groupedEntries.map(([topicName, topicQuestions]) => (
          <div key={topicName} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-ink flex items-center gap-1.5">
              {topicName}
              <span className="text-xs text-muted font-normal">
                ({topicQuestions.length})
              </span>
            </h2>
            {topicQuestions.map((q) => (
              <StudentQuestionCard key={q.id} question={q} onChanged={load} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SorularimPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted pt-4">Yükleniyor...</p>}>
      <SorularimContent />
    </Suspense>
  );
}
