import type { QuestionStatus, QuestionTag } from "./types";

export const STATUS_LABELS: Record<QuestionStatus, string> = {
  BEKLIYOR: "Bekliyor",
  DERSTE_ELE_ALINDI: "Derste Ele Alındı",
  TEKRAR_COZULECEK: "Tekrar Çözülecek",
  OGRENCI_COZDU: "Öğrenci Çözdü",
  TAMAMLANDI: "Tamamlandı",
};

export const STATUS_COLORS: Record<
  QuestionStatus,
  { text: string; bg: string; dot: string }
> = {
  BEKLIYOR: { text: "#C4453A", bg: "#FBEAE8", dot: "#C4453A" },
  DERSTE_ELE_ALINDI: { text: "#B4680E", bg: "#FBF0E2", dot: "#D98A3D" },
  TEKRAR_COZULECEK: { text: "#5F4696", bg: "#F0ECF9", dot: "#7A5FB0" },
  OGRENCI_COZDU: { text: "#2C567E", bg: "#E7EFF6", dot: "#3C6E9E" },
  TAMAMLANDI: { text: "#397550", bg: "#E9F4EC", dot: "#4E9668" },
};

export const STATUS_ORDER: QuestionStatus[] = [
  "BEKLIYOR",
  "DERSTE_ELE_ALINDI",
  "TEKRAR_COZULECEK",
  "OGRENCI_COZDU",
  "TAMAMLANDI",
];

export const TAG_LABELS: Record<QuestionTag, string> = {
  bilgi_eksikligi: "Bilgi eksikliği",
  islem_hatasi: "İşlem hatası",
  dikkat_hatasi: "Dikkat hatası",
  soruyu_anlayamama: "Soruyu anlayamama",
  strateji_eksikligi: "Strateji eksikliği",
  kavram_yanilgisi: "Kavram yanılgısı",
};

export const TAG_LIST = Object.keys(TAG_LABELS) as QuestionTag[];

export const LGS_MATEMATIK_KONULARI = [
  "Çarpanlar ve Katlar",
  "Üslü İfadeler",
  "Kareköklü İfadeler",
  "Veri Analizi",
  "Basit Olayların Olma Olasılığı",
  "Cebirsel İfadeler ve Özdeşlikler",
  "Doğrusal Denklemler",
  "Eşitsizlikler",
  "Üçgenler",
  "Eşlik ve Benzerlik",
  "Dönüşüm Geometrisi",
  "Geometrik Cisimler",
];
