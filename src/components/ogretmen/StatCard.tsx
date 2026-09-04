export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="notebook-card px-4 py-3.5">
      <div className="font-display text-2xl text-ink leading-none">{value}</div>
      <div className="text-xs text-muted mt-1.5">{label}</div>
    </div>
  );
}
