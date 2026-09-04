import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { TAG_LABELS } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const { studentId } = await request.json();
  if (!studentId) {
    return NextResponse.json({ error: "studentId zorunludur." }, { status: 400 });
  }

  // RLS: yalnızca bu öğrencinin öğretmeni olan kullanıcı (auth.uid()) veriyi görebilir
  const { data: studentUser } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", studentId)
    .single();

  const { data: questions } = await supabase
    .from("questions")
    .select(
      "created_at, status, topic:topics(name), question_tags(tag), teacher_notes(note)"
    )
    .eq("student_id", studentId)
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const list = questions ?? [];
  if (list.length === 0) {
    return NextResponse.json({
      summary: "Bu öğrenci için henüz özet oluşturacak yeterli soru verisi yok.",
    });
  }

  const satirlar = list.map((q: any) => {
    const konu = q.topic?.name ?? "Bilinmeyen konu";
    const etiketler = (q.question_tags ?? [])
      .map((t: any) => TAG_LABELS[t.tag as keyof typeof TAG_LABELS])
      .join(", ");
    const notlar = (q.teacher_notes ?? []).map((n: any) => n.note).join(" | ");
    return `- ${konu} | Durum: ${q.status} | Etiketler: ${etiketler || "yok"} | Öğretmen notu: ${notlar || "yok"}`;
  });

  try {
    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Sen bir LGS matematik özel ders öğretmenine yardımcı olan bir asistansın. Aşağıda ${studentUser?.full_name ?? "bir öğrencinin"} son sorularının listesi var:

${satirlar.join("\n")}

Bu veriye dayanarak öğretmene 3-4 cümlelik, Türkçe, doğrudan öğretmene hitap eden kısa bir analiz özeti yaz. Hangi konularda ve hangi tür hatalarda (bilgi eksikliği, işlem hatası, dikkat hatası, kavram yanılgısı vb.) yoğunlaşma olduğunu belirt, varsa somut bir örneğe değin, ve öğretmene bir sonraki derste neye odaklanabileceğine dair kısa bir öneri ver. Sadece özeti yaz, başlık veya madde işareti kullanma.`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const summary = textBlock && "text" in textBlock ? textBlock.text.trim() : "";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("analiz-ozet hatası:", err);
    return NextResponse.json(
      { error: "Özet oluşturulamadı, tekrar dene." },
      { status: 500 }
    );
  }
}
