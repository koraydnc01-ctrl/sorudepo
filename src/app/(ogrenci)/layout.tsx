import { StudentNav } from "@/components/ogrenci/StudentNav";

export default function OgrenciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <StudentNav />
      <div className="max-w-md mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
