"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";

type NotificationRow = {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  question_id: string | null;
  questions: {
    topic: { name: string } | null;
    student: { full_name: string } | null;
  } | null;
    studentName: string;
};

const TYPE_LABELS: Record<string, string> = {
  yeni_soru: "yeni bir soru yükledi",
  tekrar_cozulecek: "bu soruyu çözemedi",
  ogrenci_cozdu: "bu soruyu çözdü",
};

export function NotificationBell() {
  const supabase = createClient();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadCount() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { count: unread } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setCount(unread ?? 0);
  }

  useEffect(() => {
    loadCount();
  }, []);

    async function openPanel() {
    const next = !open;
    setOpen(next);
    if (!next) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select(
        "id, type, is_read, created_at, question_id, questions(topic:topics(name), student_id)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const list = (data as any) ?? [];

    const studentIds = [
      ...new Set(list.map((n: any) => n.questions?.student_id).filter(Boolean)),
    ];

    let namesById: Record<string, string> = {};
    if (studentIds.length > 0) {
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, users(full_name)")
        .in("id", studentIds);
      namesById = Object.fromEntries(
        (studentsData ?? []).map((s: any) => [s.id, s.users?.full_name ?? "Bir öğrenci"])
      );
    }

    const enriched = list.map((n: any) => ({
      ...n,
      studentName: namesById[n.questions?.student_id] ?? "Bir öğrenci",
    }));

    setItems(enriched);
    setLoading(false);

    const unreadIds = list.filter((n: any) => !n.is_read).map((n: any) => n.id);
    if (unreadIds.length > 0) {
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
      setCount(0);
    }
  }

  return (
    <div className="relative">
      <button onClick={openPanel} className="relative inline-flex items-center">
        <span className="text-lg">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-status-bekliyor text-white text-[10px] font-medium">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 max-w-[90vw] max-h-96 overflow-y-auto bg-white border border-line rounded-lg shadow-lg z-50">
          {loading && <p className="text-sm text-muted p-3">Yükleniyor...</p>}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted p-3">Henüz bildirim yok.</p>
          )}
          {!loading &&
            items.map((n) => (
              <div key={n.id} className="px-3 py-2.5 border-b border-line last:border-b-0 text-sm">
                <div className="text-ink">
                  {n.studentName}
                  {TYPE_LABELS[n.type] ?? n.type}
                  {(n.questions as any)?.topic?.name && (
                    <> ({(n.questions as any).topic.name})</>
                  )}
                </div>
                <div className="text-xs text-muted mt-0.5">{formatDateTime(n.created_at)}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
