"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LGS_MATEMATIK_KONULARI } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function SoruEklePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ders] = useState("Matematik");
  const [konu, setKonu] = useState("");
  const [not, setNot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOneri, setAiOneri] = useState<{ topic: string; confidence: string | null } | null>(
    null
  );
  const [aiLoading, setAiLoading] = useState(false);

  function fileToBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setAiOneri(null);
    setKonu("");

    // fotoğraf seçilir seçilmez AI konu tahmini iste
    setAiLoading(true);
    try {
      const base64 = await fileToBase64(selected);
      const res = await fetch("/api/konu-tespit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType: selected.type || "image/jpeg",
        }),
      });
      const result = await res.json();
      if (result.topic) {
        setAiOneri({ topic: result.topic, confidence: result.confidence });
      }
    } catch {
      // AI tahmini başarısız olursa öğrenci konuyu manuel seçer, akış bozulmaz
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!file || !konu) {
      setError("Fotoğraf ve konu seçimi zorunludur.");
      return;
    }
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: studentRow } = await supabase
      .from("students")
      .select("teacher_id")
      .eq("id", user.id)
      .single();

    if (!studentRow?.teacher_id) {
      setError("Henüz bir öğretmene bağlı değilsin.");
      setLoading(false);
      return;
    }

    const { data: subject } = await supabase
      .from("subjects")
      .select("id")
      .eq("name", ders)
      .single();

    const { data: topic } = await supabase
      .from("topics")
      .select("id")
      .eq("name", konu)
      .single();

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("question-images")
      .upload(filePath, file);

    if (uploadError) {
      setError("Fotoğraf yüklenemedi, tekrar dene.");
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("question-images")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("questions").insert({
      student_id: user.id,
      teacher_id: studentRow.teacher_id,
      subject_id: subject?.id,
      topic_id: topic?.id,
      image_url: publicUrlData.publicUrl,
      student_note: not.trim() || null,
      status: "BEKLIYOR",
    });

    if (insertError) {
      setError("Soru gönderilemedi, tekrar dene.");
      setLoading(false);
      return;
    }

    router.push("/sorularim");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex items-center justify-between">
        <Link href="/anasayfa" className="text-sm text-muted">
          Vazgeç
        </Link>
        <h1 className="font-display text-lg text-ink">Soru ekle</h1>
        <span className="w-10" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="notebook-card overflow-hidden aspect-[4/3] relative"
        >
          <img src={previewUrl} alt="Seçilen soru" className="w-full h-full object-cover" />
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            Değiştir
          </span>
        </button>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="notebook-card border-dashed aspect-[4/3] flex flex-col items-center justify-center gap-2 text-brand"
        >
          <span className="text-2xl">📷</span>
          <span className="text-sm font-medium">Fotoğraf çek veya seç</span>
        </button>
      )}

      <div>
        <div className="text-sm font-medium text-ink mb-2">Ders</div>
        <div className="notebook-card px-3.5 py-2.5 text-sm text-ink bg-brand-light border-brand/20">
          {ders}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-ink mb-2">Konu</div>

        {aiLoading && (
          <div className="text-xs text-muted mb-2 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            Yapay zeka konuyu tahmin ediyor...
          </div>
        )}

        {aiOneri && konu !== aiOneri.topic && (
          <button
            onClick={() => setKonu(aiOneri.topic)}
            className="w-full text-left mb-2.5 px-3.5 py-2.5 rounded-lg border border-brand/30 bg-brand-light text-sm"
          >
            <span className="text-brand font-medium">✨ Öneri: {aiOneri.topic}</span>
            <span className="text-muted text-xs block mt-0.5">
              Yapay zeka fotoğrafa bakarak bunu önerdi, dokunarak seçebilirsin.
            </span>
          </button>
        )}

        <div className="flex flex-wrap gap-1.5">
          {LGS_MATEMATIK_KONULARI.map((k) => (
            <button
              key={k}
              onClick={() => setKonu(k)}
              className={cn(
                "text-xs px-3 py-2 rounded-full border text-left",
                konu === k
                  ? "border-brand text-brand bg-brand-light"
                  : "border-line text-muted"
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-ink mb-2">
          Açıklama <span className="text-muted font-normal">(isteğe bağlı)</span>
        </div>
        <textarea
          value={not}
          onChange={(e) => setNot(e.target.value)}
          rows={3}
          placeholder="Bu soruda nereden başlayacağımı anlamadım."
          className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-sm outline-none focus:border-brand resize-none"
        />
      </div>

      {error && <p className="text-sm text-status-bekliyor">{error}</p>}

      <Button size="lg" onClick={handleSubmit} loading={loading}>
        Öğretmenime gönder
      </Button>
    </div>
  );
}
