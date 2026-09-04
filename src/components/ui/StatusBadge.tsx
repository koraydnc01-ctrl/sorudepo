import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { QuestionStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: QuestionStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span className="status-dot" style={{ backgroundColor: c.dot }} />
      {STATUS_LABELS[status]}
    </span>
  );
}
