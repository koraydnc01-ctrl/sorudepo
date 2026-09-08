export type UserRole = "teacher" | "student";

export type QuestionStatus =
  | "BEKLIYOR"
  | "DERSTE_ELE_ALINDI"
  | "TEKRAR_COZULECEK"
  | "OGRENCI_COZDU"
  | "TAMAMLANDI";

export type QuestionTag =
  | "bilgi_eksikligi"
  | "islem_hatasi"
  | "dikkat_hatasi"
  | "soruyu_anlayamama"
  | "strateji_eksikligi"
  | "kavram_yanilgisi";

export interface Question {
  id: string;
  student_id: string;
  teacher_id: string;
  subject_id: string;
  topic_id: string;
  image_url: string;
  student_note: string | null;
  status: QuestionStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  // join'lerle gelen alanlar (opsiyonel)
  topic?: { name: string };
  subject?: { name: string };
  student?: { full_name: string };
  teacher_notes?: { id: string; note: string; created_at: string }[];
  question_tags?: { tag: QuestionTag; created_at: string }[];
}

export interface StudentRow {
  id: string;
  full_name: string;
  invite_code: string | null;
  invite_used: boolean;
  bekleyen: number;
  cozulen: number;
  toplam: number;
  sinif?: string | null;
  okul_no?: string | null;
}

// Bu proje için minimal bir Database tipi; gerçek projede
// `supabase gen types typescript` ile otomatik üretilmesi önerilir.
export type Database = any;
