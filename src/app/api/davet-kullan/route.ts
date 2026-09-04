import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code, fullName } = await request.json();

  if (!code || !fullName) {
    return NextResponse.json(
      { error: "Davet kodu ve isim zorunludur." },
      { status: 400 }
    );
  }

  // İsteği yapan kullanıcının kimliğini normal (RLS'li) client ile doğrula
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const service = createServiceClient();

  const { data: invite, error: inviteError } = await service
    .from("invite_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("used", false)
    .maybeSingle();

  if (inviteError || !invite) {
    return NextResponse.json(
      { error: "Davet kodu geçersiz veya daha önce kullanılmış." },
      { status: 400 }
    );
  }

  // users tablosuna kayıt (varsa dokunma)
  await service.from("users").upsert({
    id: user.id,
    role: "student",
    full_name: fullName,
    email: user.email,
  });

  const { error: studentError } = await service.from("students").upsert({
    id: user.id,
    teacher_id: invite.teacher_id,
  });

  if (studentError) {
    return NextResponse.json({ error: studentError.message }, { status: 500 });
  }

  await service
    .from("teacher_students")
    .upsert({ teacher_id: invite.teacher_id, student_id: user.id });

  await service
    .from("invite_codes")
    .update({ used: true, used_at: new Date().toISOString(), student_id: user.id })
    .eq("id", invite.id);

  return NextResponse.json({ success: true });
}
