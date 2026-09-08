"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StudentInfo = {
  id: string;
  full_name: string;
  email: string;
  sinif: string | null;
  okul_no: string | null;
};

type TeacherInfo = {
  id: string;
  full_name: string;
  email: string;
  approved: boolean;
  students: StudentInfo[];
};

export function AdminTeacherRow({
  teacher,
  currentUserId,
}: {
  teacher: TeacherInfo;
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isSelf = teacher.id === currentUserId;

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleApprove() {
    setLoading("approve");
    setError(null);
    const res = await fetch("/api/admin/onayla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: teacher.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Onaylama başarısız oldu.");
      setLoading(null);
      return;
    }
    setLoading(null);
    router.refresh();
  }

  async function handleDeleteTeacher() {
    const confirmed = window.confirm(
      `${teacher.full_name} adlı öğretmeni ve TÜM öğrencilerini, sorularını, verilerini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    setLoading("delete-teacher");
    setError(null);
    const res = await fetch("/api/admin/ogretmen-sil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: teacher.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Silme başarısız oldu.");
      setLoading(null);
      return;
    }
    setLoading(null);
    router.refresh();
  }

  async function handleDeleteStudent(studentId: string, studentName: string) {
    const confirmed = window.confirm(
      `${studentName} adlı öğrenciyi ve tüm sorularını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    setLoading(`delete-student-${studentId}`);
    setError(null);
    const res = await fetch("/api/admin/ogrenci-sil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Silme başarısız oldu.");
      setLoading(null);
      return;
    }
    setLoading(null);
    router.refresh();
  }

  async function handleDeleteSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    const confirmed = window.confirm(
      `Seçtiğiniz ${ids.length} öğrenciyi ve tüm sorularını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    setLoading("delete-selected");
    setError(null);
    const res = await fetch("/api/admin/ogrenci-coklu-sil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: ids }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Silme başarısız oldu.");
      setLoading(null);
      return;
    }
    setSelected(new Set());
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="notebook-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium text-ink">
            {teacher.full_name}
            {isSelf && <span className="text-xs text-muted font-normal"> (sen)</span>}
          </div>
          <div className="text-xs text-muted mt-0.5">{teacher.email}</div>
          <div className="text-xs text-muted mt-0.5">
            {teacher.students.length} öğrenci
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {!teacher.approved && (
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="text-xs px-3 py-1.5 rounded-full bg-status-tamam text-white font-medium disabled:opacity-50"
              type="button"
            >
              {loading === "approve" ? "Onaylanıyor..." : "Onayla"}
            </button>
          )}
          {!isSelf && (
            <button
              onClick={handleDeleteTeacher}
              disabled={loading !== null}
              className="text-xs px-3 py-1.5 rounded-full border border-status-bekliyor text-status-bekliyor font-medium disabled:opacity-50"
              type="button"
            >
              {loading === "delete-teacher" ? "Siliniyor..." : "Öğretmeni sil"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-status-bekliyor mt-2">{error}</p>}

      {teacher.students.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none text-xs text-muted font-medium select-none flex items-center gap-1">
            Öğrencileri göster
            <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
          </summary>

          {selected.size > 0 && (
            <div className="flex items-center justify-between mt-2 mb-1 px-1">
              <span className="text-xs text-muted">{selected.size} öğrenci seçildi</span>
              <button
                onClick={handleDeleteSelected}
                disabled={loading !== null}
                className="text-xs px-3 py-1.5 rounded-full bg-status-bekliyor text-white font-medium disabled:opacity-50"
                type="button"
              >
                {loading === "delete-selected" ? "Siliniyor..." : "Seçilenleri sil"}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5 mt-2">
            {teacher.students.map((s) => {
              const detay = [s.sinif, s.okul_no ? `No:${s.okul_no}` : null]
                .filter(Boolean)
                .join(" · ");
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleSelected(s.id)}
                    disabled={loading !== null}
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-ink">{s.full_name}</div>
                    <div className="text-xs text-muted">
                      {s.email}
                      {detay && ` · ${detay}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteStudent(s.id, s.full_name)}
                    disabled={loading !== null}
                    className="text-xs text-status-bekliyor font-medium disabled:opacity-50 shrink-0"
                    type="button"
                  >
                    {loading === `delete-student-${s.id}` ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
