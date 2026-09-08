import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Davet kodu zorunludur." }, { status: 400 });
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

  // İsim, öğretmenin davet kodu oluştururken girdiği isimden alınır —
  // tek doğru kaynak bu olsun diye öğrenciye tekrar sorulmuyor.
  const { error: userError } = await service.from("users").upsert({
    id: user.id,
    role: "student",
    full_name: invite.student_name,
    email: user.email,
  });

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const { error: studentError } = await service.from("students").upsert({
    id: user.id,
    teacher_id: invite.teacher_id,
    sinif: invite.sinif ?? null,
    okul_no: invite.okul_no ?? null,
  });

  if (studentError) {
    return NextResponse.json({ error: studentError.message }, { status: 500 });
  }

  await service
    .from("invite_codes")
    .update({ used: true, used_at: new Date().toISOString(), student_id: user.id })
    .eq("id", invite.id);

  return NextResponse.json({ success: true });
}
