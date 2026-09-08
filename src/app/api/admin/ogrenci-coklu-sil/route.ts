import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { studentIds } = await request.json();
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return NextResponse.json({ error: "studentIds zorunludur." }, { status: 400 });
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

  const { data: questionRows } = await service
    .from("questions")
    .select("id")
    .in("student_id", studentIds);
  const questionIds = (questionRows ?? []).map((q) => q.id);

  if (questionIds.length > 0) {
    await service.from("question_tags").delete().in("question_id", questionIds);
    await service.from("teacher_notes").delete().in("question_id", questionIds);
  }

  await service.from("notifications").delete().in("user_id", studentIds);
  await service.from("questions").delete().in("student_id", studentIds);
  await service.from("invite_codes").delete().in("student_id", studentIds);
  await service.from("students").delete().in("id", studentIds);
  await service.from("users").delete().in("id", studentIds);

  for (const id of studentIds) {
    await service.auth.admin.deleteUser(id).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
