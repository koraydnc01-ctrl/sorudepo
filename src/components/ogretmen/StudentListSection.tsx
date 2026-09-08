"use client";

import { useMemo, useState } from "react";
import { StudentListItem } from "@/components/ogretmen/StudentListItem";
import { AddStudentCard } from "@/components/ogretmen/AddStudentCard";
import { BulkAddStudentsCard } from "@/components/ogretmen/BulkAddStudentsCard";
import type { StudentRow } from "@/lib/types";

type PendingInvite = { id: string; code: string; student_name: string };

export function StudentListSection({
  teacherId,
  studentRows,
  pendingInvites,
}: {
  teacherId: string;
  studentRows: StudentRow[];
  pendingInvites: PendingInvite[];
}) {
  const [sinifFilter, setSinifFilter] = useState("");

  const siniflar = useMemo(() => {
    const set = new Set<string>();
    for (const s of studentRows) {
      if (s.sinif) set.add(s.sinif);
    }
    return [...set].sort();
  }, [studentRows]);

  const filteredStudents = useMemo(() => {
    if (!sinifFilter) return studentRows;
    return studentRows.filter((s) => s.sinif === sinifFilter);
  }, [studentRows, sinifFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-ink">Öğrenciler</h2>
        {siniflar.length > 0 && (
          <select
            value={sinifFilter}
            onChange={(e) => setSinifFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-line bg-white text-xs"
          >
            <option value="">Tüm sınıflar</option>
            {siniflar.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        <AddStudentCard teacherId={teacherId} />
        <BulkAddStudentsCard />

        {!sinifFilter &&
          pendingInvites.map((invite) => (
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

        {filteredStudents.map((student) => (
          <StudentListItem key={student.id} student={student} />
        ))}

        {filteredStudents.length === 0 && pendingInvites.length === 0 && !sinifFilter && (
          <p className="text-sm text-muted px-1">
            Henüz öğrenci eklemedin. Yukarıdaki butonla ilk öğrenciyi ekle.
          </p>
        )}

        {filteredStudents.length === 0 && sinifFilter && (
          <p className="text-sm text-muted px-1">
            {sinifFilter} sınıfında öğrenci bulunmuyor.
          </p>
        )}
      </div>
    </div>
  );
}
