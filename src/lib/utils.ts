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
