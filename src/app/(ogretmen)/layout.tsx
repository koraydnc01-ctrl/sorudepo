import { TeacherNav } from "@/components/ogretmen/TeacherNav";

export default function OgretmenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TeacherNav />
      <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
