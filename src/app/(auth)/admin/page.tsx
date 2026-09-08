import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminTeacherRow } from "@/components/admin/AdminTeacherRow";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: me } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!me?.is_admin) redirect("/dashboard");

  const { data: teacherRows } = await supabase
    .from("users")
    .select("id, full_name, email, teachers(approved)")
    .eq("role", "teacher");

  const { data: studentRows } = await supabase
    .from("students")
    .select("id, sinif, okul_no, teacher_id, users(full_name, email)");

  const teachers = (teacherRows ?? []).map((t: any) => ({
    id: t.id,
    full_name: t.full_name,
    email: t.email,
    approved: t.teachers?.approved ?? false,
    students: (studentRows ?? [])
      .filter((s: any) => s.teacher_id === t.id)
      .map((s: any) => ({
        id: s.id,
        full_name: s.users?.full_name ?? "İsimsiz öğrenci",
        email: s.users?.email ?? "",
        sinif: s.sinif,
        okul_no: s.okul_no,
      })),
  }));

  const bekleyenler = teachers.filter((t) => !t.approved);
  const onayliler = teachers.filter((t) => t.approved);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Admin Paneli</h1>
        <p className="text-muted text-sm mt-1">
          Öğretmen onayları ve hesap yönetimi.
        </p>
      </div>

      {bekleyenler.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-ink mb-3">
            Onay bekleyen öğretmenler ({bekleyenler.length})
          </h2>
          <div className="flex flex-col gap-2.5">
            {bekleyenler.map((t) => (
              <AdminTeacherRow key={t.id} teacher={t} currentUserId={user.id} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-ink mb-3">
          Onaylı öğretmenler ({onayliler.length})
        </h2>
        <div className="flex flex-col gap-2.5">
          {onayliler.map((t) => (
            <AdminTeacherRow key={t.id} teacher={t} currentUserId={user.id} />
          ))}
          {onayliler.length === 0 && (
            <p className="text-sm text-muted px-1">Henüz onaylı öğretmen yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
