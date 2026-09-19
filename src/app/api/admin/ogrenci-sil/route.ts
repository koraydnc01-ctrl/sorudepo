import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// question-images bucket'ının public URL'inden bucket içindeki gerçek dosya
// yolunu çıkarır (örn. ".../question-images/USER_ID/171234.jpg" -> "USER_ID/171234.jpg").
// URL beklenen formatta değilse null döner, o durumda o dosya atlanır.
function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = "/question-images/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(url.slice(idx + marker.length));
  } catch {
    return null;
  }
}

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
    .select("id, image_url")
    .eq("student_id", studentId);
  const questionIds = (questionRows ?? []).map((q) => q.id);

  // Öğrenciye ait fotoğrafları Storage'dan sil, aksi halde veritabanı kaydı
  // silinse bile dosyalar öksüz kalıp yer kaplamaya devam eder.
  const storagePaths = (questionRows ?? [])
    .map((q) => extractStoragePath(q.image_url))
    .filter((p): p is string => Boolean(p));

  if (storagePaths.length > 0) {
    await service.storage.from("question-images").remove(storagePaths).catch(() => {});
  }

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
