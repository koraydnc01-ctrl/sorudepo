"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateInviteCode } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function AddStudentCard({ teacherId }: { teacherId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const code = generateInviteCode(name);

    const { error: insertError } = await supabase.from("invite_codes").insert({
      code,
      teacher_id: teacherId,
      student_name: name,
    });

    if (insertError) {
      setError("Bir sorun oluştu, tekrar dene.");
      setLoading(false);
      return;
    }

    setLastCode(code);
    setName("");
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="notebook-card w-full px-4 py-3.5 text-left text-brand font-medium border-dashed hover:border-brand/50"
      >
        + Öğrenci ekle
      </button>
    );
  }

  return (
    <div className="notebook-card p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Öğrencinin adı soyadı"
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-line bg-white focus:border-brand outline-none text-sm"
        />
        <Button type="submit" loading={loading}>
          Kod üret
        </Button>
      </form>

      {error && <p className="text-sm text-status-bekliyor mt-2">{error}</p>}

      {lastCode && (
        <div className="mt-3 px-3.5 py-2.5 rounded-lg bg-status-tamamBg text-status-tamam text-sm">
          Davet kodu oluşturuldu: <span className="font-semibold">{lastCode}</span>
          <div className="text-xs text-muted mt-1">
            Bu kodu öğrenciyle paylaş, kayıt olurken kullanacak.
          </div>
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
