import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ISIM_HARFLERI = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** "AHMET-4837" gibi bir davet kodu üretir */
export function generateInviteCode(fullName: string) {
  const ilkAd = fullName.trim().split(" ")[0]?.toUpperCase() || "OGRENCI";
  const normalized = ilkAd
    .replace(/İ/g, "I")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ş/g, "S")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/[^A-Z]/g, "");
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += ISIM_HARFLERI[Math.floor(Math.random() * ISIM_HARFLERI.length)];
  }
  return `${normalized}-${suffix}`;
}


const SIFRE_HARFLERI = "abcdefghjkmnpqrstuvwxyz23456789";

/** İsimden, toplu eklenen öğrenciler için sahte ama benzersiz bir email üretir */
export function generateStudentEmail(fullName: string) {
  const normalized = fullName
    .trim()
    .toLowerCase()
    .replace(/İ/gi, "i")
    .replace(/Ğ/gi, "g")
    .replace(/Ü/gi, "u")
    .replace(/Ş/gi, "s")
    .replace(/Ö/gi, "o")
    .replace(/Ç/gi, "c")
    .replace(/[^a-z\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${normalized || "ogrenci"}.${suffix}@ogrenci.sorudepo.app`;
}

/** Toplu eklenen öğrenciler için rastgele, okunabilir bir şifre üretir */
export function generateStudentPassword() {
  let sifre = "";
  for (let i = 0; i < 8; i++) {
    sifre += SIFRE_HARFLERI[Math.floor(Math.random() * SIFRE_HARFLERI.length)];
  }
  return sifre;
}
