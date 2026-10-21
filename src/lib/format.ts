// Display helpers: dates in WIB, blood groups and Indonesian status labels.
// Every label shown in the UI comes from here so wording stays consistent.

import type { ABO, Rh } from "./types";

const TZ = "Asia/Jakarta";

const dateFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: TZ,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

/** "17 Okt 2026" (instant shown in WIB). */
export function fmtDate(iso: string | null | undefined): string {
  return iso ? dateFmt.format(new Date(iso)) : "—";
}

/** "17 Okt 2026, 09.30" (WIB). */
export function fmtDateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFmt.format(new Date(iso)) : "—";
}

/** "09.30" (WIB). */
export function fmtTime(iso: string | null | undefined): string {
  return iso ? timeFmt.format(new Date(iso)) : "—";
}

/** A calendar date "YYYY-MM-DD" (no time zone) as "17 Mei 1990". */
export function fmtCivilDate(ymd: string | null | undefined): string {
  if (!ymd) return "—";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** Today's date in WIB as "YYYY-MM-DD". */
export function todayWIB(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** Age in whole years from a "YYYY-MM-DD" birth date. */
export function ageFrom(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

/** Human countdown to an instant: "2 hari 4 jam", "3 jam", "lewat 1 hari". */
export function fmtCountdown(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const text = days > 0 ? `${days} hari${hours ? ` ${hours} jam` : ""}` : hours > 0 ? `${hours} jam` : `${minutes} menit`;
  return diffMs < 0 ? `lewat ${text}` : text;
}

/** Greeting for the WIB time of an instant: "Selamat pagi" / "siang" / "sore" / "malam". */
export function greetingAt(iso: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(new Date(iso)));
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/** Duration between two instants: "1 jam 25 menit". */
export function fmtDuration(fromIso: string, toIso?: string | null): string {
  const ms = (toIso ? new Date(toIso).getTime() : Date.now()) - new Date(fromIso).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h} jam ${m} menit` : `${m} menit`;
}

/** "A+", "O−", or "" when unknown. */
export function bloodGroup(abo: ABO | null | undefined, rh: Rh | null | undefined): string {
  if (!abo || !rh) return "";
  return `${abo}${rh === "POS" ? "+" : "−"}`;
}

export function fmtNumber(n: number | null | undefined, suffix = ""): string {
  if (n === null || n === undefined) return "—";
  return `${new Intl.NumberFormat("id-ID").format(n)}${suffix}`;
}

export const genderLabel: Record<string, string> = { M: "Laki-laki", F: "Perempuan" };

// ---------------------------------------------------------------------------
// Status labels and badge tones (PROTOTYPE_PLAN §10.1)
// ---------------------------------------------------------------------------

export type Tone =
  | "amber"
  | "green"
  | "red"
  | "slate"
  | "purple"
  | "blue"
  | "indigo"
  | "darkgray"
  | "gray"
  | "redOutline";

type StatusDef = { label: string; tone: Tone };

export const qualityStatus: Record<string, StatusDef> = {
  HOLD: { label: "Karantina", tone: "amber" },
  RELEASED: { label: "Lulus", tone: "green" },
  REJECTED: { label: "Ditolak", tone: "red" },
};

export const inventoryStatus: Record<string, StatusDef> = {
  IN_STOCK: { label: "Di stok", tone: "slate" },
  RESERVED: { label: "Dipesan", tone: "purple" },
  IN_TRANSIT: { label: "Dalam pengiriman", tone: "blue" },
  ISSUED: { label: "Diserahkan", tone: "indigo" },
  TRANSFUSED: { label: "Ditransfusikan", tone: "darkgray" },
  PROCESSED: { label: "Diolah", tone: "gray" },
  DISCARDED: { label: "Dimusnahkan", tone: "gray" },
};

export const expiredStatus: StatusDef = { label: "Kedaluwarsa", tone: "redOutline" };

export const visitStatus: Record<string, StatusDef> = {
  REGISTERED: { label: "Terdaftar", tone: "blue" },
  ELIGIBLE: { label: "Layak", tone: "green" },
  DEFERRED: { label: "Ditunda", tone: "amber" },
  DONATED: { label: "Sudah donor", tone: "slate" },
  CANCELLED: { label: "Dibatalkan", tone: "gray" },
};

export const donationStatus: Record<string, StatusDef> = {
  IN_PROGRESS: { label: "Sedang diambil", tone: "blue" },
  COMPLETED: { label: "Selesai", tone: "green" },
  FAILED: { label: "Gagal", tone: "red" },
};

export const labStatus: Record<string, StatusDef> = {
  PENDING: { label: "Belum diperiksa", tone: "gray" },
  ENTERED: { label: "Menunggu validasi", tone: "amber" },
  VALIDATED: { label: "Tervalidasi", tone: "green" },
};

export const testValue: Record<string, StatusDef> = {
  PENDING: { label: "Belum", tone: "gray" },
  NON_REACTIVE: { label: "Non-reaktif", tone: "green" },
  REACTIVE: { label: "Reaktif", tone: "red" },
};

export const requestStatus: Record<string, StatusDef> = {
  NEW: { label: "Baru", tone: "blue" },
  VERIFIED: { label: "Terverifikasi", tone: "indigo" },
  IN_PROGRESS: { label: "Diproses", tone: "amber" },
  READY: { label: "Siap diserahkan", tone: "purple" },
  ISSUED: { label: "Diserahkan", tone: "indigo" },
  COMPLETED: { label: "Selesai", tone: "green" },
  CANCELLED: { label: "Dibatalkan", tone: "gray" },
};

export const priority: Record<string, StatusDef> = {
  ROUTINE: { label: "Rutin", tone: "slate" },
  URGENT: { label: "Segera", tone: "amber" },
  EMERGENCY: { label: "Darurat", tone: "red" },
};

export const transferStatus: Record<string, StatusDef> = {
  IN_TRANSIT: { label: "Dalam pengiriman", tone: "blue" },
  RECEIVED: { label: "Diterima", tone: "green" },
  PARTIAL: { label: "Diterima sebagian", tone: "amber" },
  CANCELLED: { label: "Dibatalkan", tone: "gray" },
};

export const receiveStatus: Record<string, StatusDef> = {
  PENDING: { label: "Belum diperiksa", tone: "gray" },
  ACCEPTED: { label: "Diterima", tone: "green" },
  REJECTED: { label: "Ditolak", tone: "red" },
};

export const allocationStatus: Record<string, StatusDef> = {
  ACTIVE: { label: "Teralokasi", tone: "purple" },
  ISSUED: { label: "Diserahkan", tone: "indigo" },
  CANCELLED: { label: "Dibatalkan", tone: "gray" },
};

export const transfusionStatus: Record<string, StatusDef> = {
  IN_PROGRESS: { label: "Berjalan", tone: "blue" },
  COMPLETED: { label: "Selesai", tone: "green" },
  STOPPED: { label: "Dihentikan", tone: "red" },
};

export const severity: Record<string, StatusDef> = {
  MILD: { label: "Ringan", tone: "amber" },
  MODERATE: { label: "Sedang", tone: "red" },
  SEVERE: { label: "Berat", tone: "red" },
};

export const sampleStatus: Record<string, StatusDef> = {
  ACCEPTED: { label: "Diterima", tone: "green" },
  REJECTED: { label: "Ditolak", tone: "red" },
};

export const sampleResult: Record<string, StatusDef> = {
  PENDING: { label: "Belum divalidasi", tone: "amber" },
  VALIDATED: { label: "Tervalidasi", tone: "green" },
};

export const antibodyLabel: Record<string, string> = {
  NOT_DONE: "Belum diperiksa",
  NEGATIVE: "Negatif",
  POSITIVE: "Positif",
};

export const crossmatchResult: Record<string, StatusDef> = {
  COMPATIBLE: { label: "Kompatibel", tone: "green" },
  INCOMPATIBLE: { label: "Tidak kompatibel", tone: "red" },
};

export const compatLevel: Record<string, StatusDef> = {
  IDENTICAL: { label: "Identik", tone: "green" },
  COMPATIBLE: { label: "Kompatibel", tone: "blue" },
  NON_IDENTICAL: { label: "Tidak identik", tone: "amber" },
};

export const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  PETUGAS_UTD: "Petugas UTD",
  LAB_UTD: "Laboratorium UTD",
  PETUGAS_BDRS: "Petugas BDRS",
  PERAWAT: "Perawat",
  PIMPINAN: "Pimpinan",
};

export const eventLabel: Record<string, string> = {
  CREATED: "Kantong dibuat",
  LAB_VALIDATED: "Hasil lab divalidasi",
  PROCESSED: "Diolah menjadi komponen",
  RELEASED: "Diluluskan",
  REJECTED: "Ditolak",
  HELD: "Ditahan (karantina)",
  TRANSFER_SENT: "Dikirim ke BDRS",
  TRANSFER_RECEIVED: "Diterima di BDRS",
  TRANSFER_REJECTED: "Ditolak saat penerimaan",
  RESERVED: "Dialokasikan untuk pasien",
  UNRESERVED: "Alokasi dibatalkan",
  ISSUED: "Diserahkan ke ruangan",
  TRANSFUSION_STARTED: "Transfusi dimulai",
  TRANSFUSED: "Transfusi selesai",
  REACTION_REPORTED: "Reaksi transfusi dilaporkan",
  DISCARDED: "Dimusnahkan",
  LOCATION_CHANGED: "Lokasi dipindahkan",
};

export const componentLabel: Record<string, string> = {
  WB: "Whole Blood",
  PRC: "Packed Red Cells",
  TC: "Trombosit (TC)",
  FFP: "Fresh Frozen Plasma",
  CRYO: "Cryoprecipitate",
};

export const wards = ["Bangsal Bedah", "ICU", "IGD", "Bangsal Anak", "Kebidanan"];

export const reactionSymptoms = [
  "Demam",
  "Menggigil",
  "Gatal / urtikaria",
  "Sesak napas",
  "Nyeri dada",
  "Nyeri pinggang",
  "Hipotensi",
  "Mual / muntah",
  "Urine kemerahan",
];
