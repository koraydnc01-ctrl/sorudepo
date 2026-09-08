"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QuestionCard } from "@/components/ogretmen/QuestionCard";
import { STATUS_LABELS, STATUS_ORDER, TAG_LABELS, TAG_LIST } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

type StudentOption = { id: string; full_name: string; sinif: string | null; okul_no: string | null };
type TopicOption = { id: string; name: string };

export default function AramaPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);

  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const [sinifFilter, setSinifFilter] = useState("");
  const [studentId, setStudentId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    async function loadFilters() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: studentRows } = await supabase
        .from("students")
        .select("id, sinif, okul_no, users(full_name)")
        .eq("teacher_id", user.id);
      setStudents(
        (studentRows ?? []).map((s: any) => ({
          id: s.id,
          full_name: s.users?.full_name,
          sinif: s.sinif ?? null,
          okul_no: s.okul_no ?? null,
        }))
      );

      const { data: topicRows } = await supabase.from("topics").select("id, name").order("sort_order");
      setTopics(topicRows ?? []);
    }
    loadFilters();
  }, []);

  const siniflar = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      if (s.sinif) set.add(s.sinif);
    }
    return [...set].sort();
  }, [students]);

  const studentsInSinif = useMemo(() => {
    if (!sinifFilter) return students;
    return students.filter((s) => s.sinif === sinifFilter);
  }, [students, sinifFilter]);

  function handleSinifChange(value: string) {
    setSinifFilter(value);
    setStudentId("");
  }

  const search = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("questions")
      .select(
        "*, topic:topics(name), subject:subjects(name), teacher_notes(*), question_tags(tag, created_at)"
      )
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    } else if (sinifFilter) {
      const ids = studentsInSinif.map((s) => s.id);
      query = query.in("student_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
    }
    if (topicId) query = query.eq("topic_id", topicId);
    if (status) query = query.eq("status", status);

    const { data } = await query;
    let result = (data ?? []) as Question[];

    if (tag) {
      result = result.filter((q) =>
        (q.question_tags ?? []).some((t) => t.tag === tag)
      );
    }

    setQuestions(result);
    setLoading(false);
  }, [studentId, sinifFilter, studentsInSinif, topicId, status, tag]);

  useEffect(() => {
    search();
  }, [search]);

  const grouped = new Map<string, Question[]>();
  for (const q of questions) {
    const topicName = (q as any).topic?.name ?? "Konusuz";
    if (!grouped.has(topicName)) grouped.set(topicName, []);
    grouped.get(topicName)!.push(q);
  }
  const groupedEntries = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl text-ink">Ara ve filtrele</h1>
        <p className="text-muted text-sm mt-1">
          Tüm öğrencilerin sorularında ara.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {siniflar.length > 0 && (
          <select
            value={sinifFilter}
            onChange={(e) => handleSinifChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-line bg-white text-sm"
          >
            <option value="">Tüm sınıflar</option>
            {siniflar.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="px-3.5 py-2.5 rounded-lg border border-line bg-white text-sm"
        >
          <option value="">
            {sinifFilter ? `${sinifFilter} sınıfındaki tüm öğrenciler` : "Tüm öğrenciler"}
          </option>
          {studentsInSinif.map((s) => {
            const detay = [s.sinif, s.okul_no ? `No:${s.okul_no}` : null]
              .filter(Boolean)
              .join(" · ");
            return (
              <option key={s.id} value={s.id}>
                {s.full_name}
                {detay ? ` (${detay})` : ""}
              </option>
            );
          })}
        </select>

        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="px-3.5 py-2.5 rounded-lg border border-line bg-white text-sm"
        >
          <option value="">Tüm konular</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatus("")}
            className={cn(
              "text-xs px-2.5 py-1.5 rounded-full border",
              status === "" ? "border-brand text-brand bg-brand-light" : "border-line text-muted"
            )}
          >
            Tüm durumlar
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-full border",
                status === s ? "border-brand text-brand bg-brand-light" : "border-line text-muted"
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={() => setTagFilterOpen((v) => !v)}
            className="text-sm text-muted font-medium flex items-center gap-1"
            type="button"
          >
            Etikete göre filtrele{tag && ` (${TAG_LABELS[tag as keyof typeof TAG_LABELS]})`}
            <span className="text-xs">{tagFilterOpen ? "▲" : "▼"}</span>
          </button>
          {tagFilterOpen && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                onClick={() => setTag("")}
                className={cn(
                  "text-xs px-2.5 py-1.5 rounded-full border",
                  tag === "" ? "border-brand text-brand bg-brand-light" : "border-line text-muted"
                )}
              >
                Tüm etiketler
              </button>
              {TAG_LIST.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-full border",
                    tag === t ? "border-brand text-brand bg-brand-light" : "border-line text-muted"
                  )}
                >
                  {TAG_LABELS[t]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-muted">Yükleniyor...</p>}
        {!loading && questions.length === 0 && (
          <p className="text-sm text-muted">Kriterlere uyan soru bulunamadı.</p>
        )}
        {groupedEntries.map(([topicName, topicQuestions]) => (
          <details
            key={topicName}
            className="group rounded-lg border border-border bg-white"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between px-4 py-3 select-none">
              <span className="text-sm font-medium text-ink flex items-center gap-1.5">
                {topicName}
                <span className="text-xs text-muted font-normal">
                  ({topicQuestions.length})
                </span>
              </span>
              <span className="text-muted text-xs transition-transform duration-200 group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="flex flex-col gap-3 px-4 pb-4">
              {topicQuestions.map((q) => (
                <QuestionCard key={q.id} question={q} onChanged={search} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
