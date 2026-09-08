"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Result = { name: string; email: string; password: string; sinif?: string | null; okul_no?: string | null };

export function BulkAddStudentsCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [namesText, setNamesText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setErrors([]);

    const rows = namesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+[-–—]\s+/).map((p) => p.trim());
        return {
          name: parts[0] ?? "",
          sinif: parts[1] || null,
          okul_no: parts[2] || null,
        };
      })
      .filter((r) => r.name);

    const res = await fetch("/api/ogrenci-toplu-ekle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();

    setResults(data.results ?? []);
    setErrors(data.errors ?? []);
    setLoading(false);
    setNamesText("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="notebook-card w-full px-4 py-3.5 text-left text-brand font-medium border-dashed hover:border-brand/50"
      >
        + Kalabalık öğrenci ekle
      </button>
    );
  }

  return (
    <div className="notebook-card p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-sm text-ink font-medium">
          Öğrenci bilgileri (her satıra bir öğrenci)
        </label>
        <textarea
          required
          value={namesText}
          onChange={(e) => setNamesText(e.target.value)}
          rows={6}
          placeholder={"Ahmet Yılmaz - 8A - 12\nAyşe Kaya - 8B\nMehmet Demir"}
          className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white focus:border-brand outline-none text-sm"
        />
        <p className="text-xs text-muted">
          Format: İsim - Sınıf - Numara (sınıf ve numara opsiyonel, sadece isim de yazabilirsin).
        </p>
        <Button type="submit" loading={loading}>
          Hesapları oluştur
        </Button>
      </form>

      {errors.length > 0 && (
        <div className="mt-3 px-3.5 py-2.5 rounded-lg bg-status-bekleiyorBg text-status-bekliyor text-sm">
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="py-1.5 pr-3">İsim</th>
                <th className="py-1.5 pr-3">Sınıf</th>
                <th className="py-1.5 pr-3">No</th>
                <th className="py-1.5 pr-3">Email</th>
                <th className="py-1.5">Şifre</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  <td className="py-1.5 pr-3">{r.name}</td>
                  <td className="py-1.5 pr-3">{r.sinif ?? "—"}</td>
                  <td className="py-1.5 pr-3">{r.okul_no ?? "—"}</td>
                  <td className="py-1.5 pr-3 font-mono text-xs">{r.email}</td>
                  <td className="py-1.5 font-mono text-xs">{r.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted mt-2">
            Bu bilgileri kaydet ve öğrencilere ilet — bir daha gösterilmeyecek.
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen(false)}
        className="text-xs text-muted mt-3"
        type="button"
      >
        Kapat
      </button>
    </div>
  );
}
