"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { TAG_LABELS, TAG_LIST } from "@/lib/constants";
import { formatDateTime, cn } from "@/lib/utils";
import type { Question, QuestionTag } from "@/lib/types";

export function StudentQuestionCard({
  question,
  onChanged,
}: {
  question: Question;
  onChanged?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [imageOpen, setImageOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickingReason, setPickingReason] = useState(false);

  const isDone = question.status === "TAMAMLANDI";
  const tags = question.question_tags ?? [];

  async function afterChange() {
    if (onChanged) {
      await onChanged();
    } else {
      router.refresh();
    }
  }

  async function markSolved() {
    setSaving(true);
    await supabase.from("questions").update({ status: "TAMAMLANDI" }).eq("id", question.id);
    setSaving(false);
    setPickingReason(false);
    await afterChange();
  }

  async function markUnsolved(tag: QuestionTag) {
    setSaving(true);
    await supabase
      .from("questions")
      .update({ status: "TEKRAR_COZULECEK" })
      .eq("id", question.id);
    await supabase.from("question_tags").insert({ question_id: question.id, tag });
    setSaving(false);
    setPickingReason(false);
    await afterChange();
  }

  async function reopen() {
    setSaving(true);
    await supabase.from("questions").update({ status: "BEKLIYOR" }).eq("id", question.id);
    setSaving(false);
    await afterChange();
  }

  return (
    <div className="notebook-card overflow-hidden">
      <div className="flex gap-3 p-3.5">
        <button
          onClick={() => setImageOpen(true)}
          className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-line"
        >
          <img
            src={question.image_url}
            alt="Soru fotoğrafı"
            className="w-full h-full object-cover"
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted">{question.topic?.name}</div>
          <div className="text-xs text-muted mt-0.5">
            {formatDateTime(question.created_at)}
          </div>
          <div className="mt-2">
            <StatusBadge status={question.status} />
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full bg-status-tekrarBg text-status-tekrar"
            >
              {TAG_LABELS[t.tag]}
            </span>
          ))}
        </div>
      )}

      {(question.teacher_notes ?? []).length > 0 && (
        <div className="px-3.5 pb-3 flex flex-col gap-1.5">
          {question.teacher_notes!.map((n) => (
            <div
              key={n.id}
              className="text-sm bg-paper border border-line rounded-lg px-3 py-2 text-ink"
            >
              {n.note}
            </div>
          ))}
        </div>
      )}

      <div className="px-3.5 pb-3.5">
        {!isDone && !pickingReason && (
          <div className="flex gap-2">
            <Button size="sm" onClick={markSolved} loading={saving} className="flex-1">
              Çözdüm
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPickingReason(true)}
              disabled={saving}
              className="flex-1"
            >
              Çözemedim
            </Button>
          </div>
        )}

        {!isDone && pickingReason && (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-muted">Neden çözemedin?</div>
            <div className="flex flex-wrap gap-1.5">
              {TAG_LIST.map((tag) => (
                <button
                  key={tag}
                  onClick={() => markUnsolved(tag)}
                  disabled={saving}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-full border border-line text-muted",
                    "hover:border-brand/40 hover:text-brand"
                  )}
                >
                  {TAG_LABELS[tag]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPickingReason(false)}
              className="text-xs text-muted self-start"
            >
              Vazgeç
            </button>
          </div>
        )}

        {isDone && (
          <button onClick={reopen} disabled={saving} className="text-xs text-muted">
            Tekrar çalışmak istiyorum
          </button>
        )}
      </div>

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