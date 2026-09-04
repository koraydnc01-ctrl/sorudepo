import Link from "next/link";
import type { StudentRow } from "@/lib/types";

export function StudentListItem({ student }: { student: StudentRow }) {
  return (
    <Link
      href={`/ogrenciler/${student.id}`}
      className="notebook-card flex items-center justify-between px-4 py-3.5 hover:border-brand/40 transition-colors"
    >
      <div>
        <div className="font-medium text-ink">{student.full_name}</div>
        {!student.invite_used && (
          <div className="text-xs text-status-derste mt-0.5">
            Davet bekleniyor · {student.invite_code}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <div className="text-status-bekliyor font-medium">{student.bekleyen}</div>
          <div className="text-[11px] text-muted">Bekleyen</div>
        </div>
        <div className="text-right">
          <div className="text-status-tamam font-medium">{student.cozulen}</div>
          <div className="text-[11px] text-muted">Çözülen</div>
        </div>
      </div>
    </Link>
  );
}
