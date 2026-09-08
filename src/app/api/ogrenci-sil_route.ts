import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { studentId } = await request.json();
  if (!studentId) {
    return NextResponse.json({ error: "studentId zorunludur." }, { status: 400 });
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
    .eq("student_id", studentId);
  const questionIds = (questionRows ?? []).map((q) => q.id);

  if (questionIds.length > 0) {
    await service.from("question_tags").delete().in("question_id", questionIds);
    await service.from("teacher_notes").delete().in("question_id", questionIds);
  }

  await service.from("notifications").delete().eq("user_id", studentId);
  await service.from("questions").delete().eq("student_id", studentId);
  await service.from("invite_codes").delete().eq("student_id", studentId);
  await service.from("students").delete().eq("id", studentId);
  await service.from("users").delete().eq("id", studentId);

  await service.auth.admin.deleteUser(studentId).catch(() => {});

  return NextResponse.json({ success: true });
}
