import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { LGS_MATEMATIK_KONULARI } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // sadece giriş yapmış kullanıcılar AI çağrısı yapabilir (maliyet kontrolü)
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const { imageBase64, mediaType } = await request.json();
  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Fotoğraf verisi eksik." }, { status: 400 });
  }

  try {
    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Bu bir 8. sınıf LGS matematik sorusunun fotoğrafıdır. Aşağıdaki 12 konudan sorunun ait olduğu EN UYGUN olanı seç:

${LGS_MATEMATIK_KONULARI.map((k, i) => `${i + 1}. ${k}`).join("\n")}

Sadece şu JSON formatında cevap ver, başka hiçbir şey yazma:
{"konu": "<listeden birebir aynı konu adı>", "guven": "yüksek" | "orta" | "düşük"}

Eğer fotoğraf net değilse veya matematik sorusu değilse "konu": null döndür.`,
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const matchedTopic = LGS_MATEMATIK_KONULARI.find((k) => k === parsed.konu) ?? null;

    return NextResponse.json({ topic: matchedTopic, confidence: parsed.guven ?? null });
  } catch (err) {
    console.error("konu-tespit hatası:", err);
    return NextResponse.json({ topic: null, confidence: null });
  }
}
