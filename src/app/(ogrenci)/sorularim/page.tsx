"use client";

import { useEffect, useState } from "react";
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

export default function SorularimPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("sekme") ?? "bekleyen");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("questions")
        .select("*, topic:topics(name), subject:subjects(name), teacher_notes(*)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      setQuestions((data ?? []) as Question[]);
      setLoading(false);
    }
    load();
  }, []);

  const statuses = TAB_STATUS[tab];
  const filtered = statuses ? questions.filter((q) => statuses.includes(q.status)) : questions;

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

      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-muted">Yükleniyor...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted">Bu sekmede soru bulunmuyor.</p>
        )}
        {filtered.map((q) => (
          <StudentQuestionCard key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
}
