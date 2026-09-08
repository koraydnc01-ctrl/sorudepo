import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { teacherId } = await request.json();
  if (!teacherId) {
    return NextResponse.json({ error: "teacherId zorunludur." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!me?.is_admin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const service = createServiceClient();

  const { data: studentRows } = await service
    .from("students")
    .select("id")
    .eq("teacher_id", teacherId);
  const studentIds = (studentRows ?? []).map((s) => s.id);

  const { data: questionRows } = await service
    .from("questions")
    .select("id")
    .eq("teacher_id", teacherId);
  const questionIds = (questionRows ?? []).map((q) => q.id);

  if (questionIds.length > 0) {
    await service.from("question_tags").delete().in("question_id", questionIds);
    await service.from("teacher_notes").delete().in("question_id", questionIds);
  }

  const allUserIds = [teacherId, ...studentIds];
  await service.from("notifications").delete().in("user_id", allUserIds);

  await service.from("questions").delete().eq("teacher_id", teacherId);
  await service.from("students").delete().eq("teacher_id", teacherId);
  await service.from("invite_codes").delete().eq("teacher_id", teacherId);
  await service.from("teachers").delete().eq("id", teacherId);
  await service.from("users").delete().in("id", allUserIds);

  for (const id of allUserIds) {
    await service.auth.admin.deleteUser(id).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
