import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateStudentEmail, generateStudentPassword } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { names } = await request.json();
  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json({ error: "İsim listesi boş olamaz." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const service = createServiceClient();
  const results: { name: string; email: string; password: string }[] = [];
  const errors: string[] = [];

  for (const rawName of names) {
    const name = rawName.trim();
    if (!name) continue;

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
    });

    if (userError || studentError) {
      errors.push(`${name}: kayıt oluşturulurken sorun oluştu.`);
      continue;
    }

    results.push({ name, email, password });
  }

  return NextResponse.json({ results, errors });
}
