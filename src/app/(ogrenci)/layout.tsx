import { StudentNav } from "@/components/ogrenci/StudentNav";
import { NotificationBell } from "@/components/ui/NotificationBell";

export default function OgrenciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-line bg-white">
        <span className="font-display text-lg text-ink">Soru Takip</span>
        <NotificationBell />
      </header>
      <div className="max-w-md mx-auto px-4 py-6">{children}</div>
      <StudentNav />
    </div>
  );
}
