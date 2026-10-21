// Copy for the public landing page. Kept apart from the markup so the wording
// is easy to review and stays consistent with the app's own labels.

import type { Role } from "@/lib/types";

export const sections = [
  { href: "#fitur", label: "Fitur" },
  { href: "#alur", label: "Alur kantong" },
  { href: "#peran", label: "Untuk tim" },
];

export type Stat = { value: string; unit: string; label: string; tone: "blue" | "amber" | "teal" | "orange" };

// Facts about how the system works, not usage metrics: this is a prototype.
export const stats: Stat[] = [
  { value: "1", unit: "identitas", label: "untuk setiap kantong, dari lengan pendonor sampai pasien", tone: "blue" },
  { value: "6", unit: "tahap", label: "layanan tercatat dalam satu jejak audit yang utuh", tone: "amber" },
  { value: "8", unit: "golongan", label: "darah ABO/Rh dipantau stoknya per komponen secara real-time", tone: "teal" },
  { value: "6", unit: "peran", label: "pengguna, masing-masing dengan menu dan hak akses sendiri", tone: "orange" },
];

export const journey = [
  { title: "Seleksi donor", body: "Registrasi pendonor, kuesioner, dan pemeriksaan kelayakan." },
  { title: "Pengambilan", body: "Darah diambil dan kantong mendapat nomor unik ber-barcode." },
  { title: "Uji saring", body: "Laboratorium mencatat golongan darah dan hasil IMLTD." },
  { title: "Pengolahan & pelulusan", body: "Darah dipisah menjadi komponen lalu diluluskan ke stok." },
  { title: "Distribusi", body: "Kantong dikirim dari UTD ke BDRS rumah sakit." },
  { title: "Transfusi", body: "Kantong diberikan ke pasien dan dipantau sampai selesai." },
];

export type RoleStory = { role: Role; title: string; headline: string; body: string; points: string[] };

export const roleStories: RoleStory[] = [
  {
    role: "PETUGAS_UTD",
    title: "Petugas UTD",
    headline: "Dari registrasi sampai kantong terisi.",
    body: "Daftarkan pendonor, catat hasil seleksi, dan cetak label kantong tanpa menulis ulang data.",
    points: ["Riwayat donor dan interval donor otomatis", "Worklist seleksi dan pengambilan", "Label barcode siap cetak"],
  },
  {
    role: "LAB_UTD",
    title: "Laboratorium",
    headline: "Hasil uji yang langsung menentukan stok.",
    body: "Input hasil uji saring, olah komponen per batch, dan luluskan kantong yang memenuhi syarat.",
    points: ["Worklist per donasi", "Pengolahan komponen per batch", "Keputusan pelulusan tercatat beserta alasan"],
  },
  {
    role: "PETUGAS_BDRS",
    title: "Bank Darah RS",
    headline: "Stok rumah sakit yang selalu terpantau.",
    body: "Terima kiriman dari UTD, layani permintaan darah, dan lakukan uji silang serasi.",
    points: ["Penerimaan distribusi", "Crossmatch dan pengeluaran kantong", "Prioritas kantong yang segera kedaluwarsa"],
  },
  {
    role: "PERAWAT",
    title: "Perawat",
    headline: "Transfusi aman di samping pasien.",
    body: "Ajukan permintaan darah dan jalankan transfusi dengan verifikasi ganda identitas pasien dan kantong.",
    points: ["Permintaan dari ruangan", "Checklist verifikasi sebelum transfusi", "Pencatatan tanda vital dan reaksi"],
  },
  {
    role: "PIMPINAN",
    title: "Pimpinan",
    headline: "Gambaran utuh untuk keputusan cepat.",
    body: "Pantau stok semua fasilitas, tren donasi dan transfusi, serta kejadian yang perlu perhatian.",
    points: ["Dashboard lintas fasilitas", "Tren 14 hari donasi vs transfusi", "Pelacakan kantong untuk audit"],
  },
];
