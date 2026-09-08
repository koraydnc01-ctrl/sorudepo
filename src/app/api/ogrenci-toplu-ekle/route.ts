import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateStudentEmail, generateStudentPassword } from "@/lib/utils";
import { NextResponse } from "next/server";

type Row = { name: string; sinif?: string | null; okul_no?: string | null };

export async function POST(request: Request) {
  const { rows } = await request.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Öğrenci listesi boş olamaz." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const service = createServiceClient();
  const results: { name: string; email: string; password: string; sinif: string | null; okul_no: string | null }[] = [];
  const errors: string[] = [];

  for (const row of rows as Row[]) {
    const name = row.name?.trim();
    if (!name) continue;
    const sinif = row.sinif?.trim() || null;
    const okulNo = row.okul_no?.trim() || null;

    const email = generateStudentEmail(name);
    const password = generateStudentPassword();

    const { data: created, error: createError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !created.user) {
      errors.push(`${name}: hesap oluşturulamadı (${createError?.message ?? "bilinmeyen hata"})`);
      continue;
    }

    const newUserId = created.user.id;

    const { error: userError } = await service.from("users").upsert({
      id: newUserId,
      role: "student",
      full_name: name,
      email,
    });

    const { error: studentError } = await service.from("students").upsert({
      id: newUserId,
      teacher_id: user.id,
      sinif,
      okul_no: okulNo,
    });

    if (userError || studentError) {
      errors.push(`${name}: kayıt oluşturulurken sorun oluştu.`);
      continue;
    }

    results.push({ name, email, password, sinif, okul_no: okulNo });
  }

  return NextResponse.json({ results, errors });
}
