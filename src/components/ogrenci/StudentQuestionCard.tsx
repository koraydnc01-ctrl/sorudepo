"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import type { Question } from "@/lib/types";

export function StudentQuestionCard({ question }: { question: Question }) {
  const router = useRouter();
  const supabase = createClient();
  const [imageOpen, setImageOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function markSolved() {
    setSaving(true);
    await supabase
      .from("questions")
      .update({ status: "OGRENCI_COZDU" })
      .eq("id", question.id);
    setSaving(false);
    router.refresh();
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

      {question.status === "TEKRAR_COZULECEK" && (
        <div className="px-3.5 pb-3.5">
          <Button size="sm" onClick={markSolved} loading={saving} className="w-full">
            Çözdüm
          </Button>
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
