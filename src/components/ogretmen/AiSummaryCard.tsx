"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AiSummaryCard({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analiz-ozet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Özet oluşturulamadı.");
      } else {
        setSummary(result.summary);
      }
    } catch {
      setError("Bir sorun oluştu, tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="notebook-card p-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium text-ink">✨ Yapay zeka özeti</h2>
        {!summary && (
          <Button size="sm" variant="secondary" onClick={generate} loading={loading}>
            Oluştur
          </Button>
        )}
      </div>

      {!summary && !loading && (
        <p className="text-xs text-muted">
          Öğrencinin soru geçmişine bakıp kısa bir değerlendirme çıkarsın.
        </p>
      )}

      {error && <p className="text-sm text-status-bekliyor mt-2">{error}</p>}

      {summary && (
        <>
          <p className="text-sm text-ink leading-relaxed mt-2">{summary}</p>
          <button
            onClick={() => {
              setSummary(null);
              generate();
            }}
            className="text-xs text-brand font-medium mt-3"
          >
            Yeniden oluştur
          </button>
        </>
      )}
    </div>
  );
}
