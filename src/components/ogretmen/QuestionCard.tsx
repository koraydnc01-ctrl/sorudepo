"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { STATUS_LABELS, STATUS_ORDER, TAG_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { Question, QuestionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuestionCard({ question }: { question: Question }) {
  const router = useRouter();
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const tags = question.question_tags ?? [];

  async function updateStatus(status: QuestionStatus) {
    setSaving(true);
    await supabase.from("questions").update({ status }).eq("id", question.id);
    setSaving(false);
    router.refresh();
  }

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    await supabase
      .from("teacher_notes")
      .insert({ question_id: question.id, note: note.trim() });
    setNote("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="notebook-card overflow-hidden">
      <div className="flex gap-3 p-3.5">
        <button
          onClick={() => setImageOpen(true)}
          className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-line bg-paper relative"
        >
          <Image
            src={question.image_url}
            alt="Soru fotoğrafı"
            fill
            sizes="80px"
            className="object-cover"
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted">
            {question.subject?.name ?? "Matematik"} · {question.topic?.name}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {formatDateTime(question.created_at)}
          </div>
          {question.student_note && (
            <p className="text-sm text-ink mt-1.5 line-clamp-2">
              &ldquo;{question.student_note}&rdquo;
            </p>
          )}
          <div className="mt-2">
            <StatusBadge status={question.status} />
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="px-3.5 pb-3 flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full bg-status-tekrarBg text-status-tekrar"
            >
              Öğrenci: {TAG_LABELS[t.tag]}
            </span>
          ))}
        </div>
      )}

      <div className="px-3.5 pb-3.5 flex flex-wrap gap-2">
        <span className="text-xs text-muted self-center">
          Durum öğrenci tarafından güncelleniyor.
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-brand font-medium self-center ml-auto"
        >
          {expanded ? "Kapat" : "Not ekle · detay"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-line px-3.5 py-3.5 flex flex-col gap-4 bg-paper/50">
          <div>
            <div className="text-xs font-medium text-ink mb-2">Öğretmen notları</div>
            <div className="flex flex-col gap-2 mb-2">
              {(question.teacher_notes ?? []).map((n) => (
                <div key={n.id} className="text-sm bg-white border border-line rounded-lg px-3 py-2">
                  {n.note}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn. Üs kurallarını karıştırıyor."
                className="flex-1 px-3 py-2 rounded-lg border border-line bg-white text-sm outline-none focus:border-brand"
              />
              <Button size="sm" onClick={addNote} disabled={saving || !note.trim()}>
                Ekle
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-ink mb-2">
              Durumu elle değiştir <span className="text-muted font-normal">(istisnai durumlar için)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={saving}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-full border",
                    s === question.status
                      ? "border-brand text-brand bg-brand-light"
                      : "border-line text-muted hover:border-brand/40"
                  )}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {imageOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImageOpen(false)}
        >
          <img
            src={question.image_url}
            alt="Soru fotoğrafı"
            className="max-h-full max-w-full rounded-lg"
          />
        </div>
      )}
    </div>
  );
}