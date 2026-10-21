import { ArrowRight, FlaskConical, HeartPulse, Layers, type LucideIcon, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Bento-style feature section: three cards, then a large image card beside
// four small ones, then a full-width call to action.

const HEART = "M0 30 C-60 -10 -50 -60 -18 -60 C-6 -60 0 -50 0 -42 C0 -50 6 -60 18 -60 C50 -60 60 -10 0 30 Z";

const card = "relative flex flex-col overflow-hidden rounded-3xl shadow-lg shadow-stone-200/50";

type MiniFeature = { icon: LucideIcon; title: string; body: string; tint: string };

const minis: MiniFeature[] = [
  { icon: FlaskConical, title: "Uji saring & pelulusan", body: "Kantong baru bisa dipakai setelah lulus uji.", tint: "bg-amber-100 text-amber-700" },
  { icon: Truck, title: "Distribusi antar fasilitas", body: "Kirim ke BDRS dengan bukti serah terima.", tint: "bg-sky-100 text-sky-700" },
  { icon: Layers, title: "Pengolahan komponen", body: "PRC, TC, dan FFP diolah per batch.", tint: "bg-emerald-100 text-emerald-700" },
  { icon: HeartPulse, title: "Reaksi transfusi", body: "Dilaporkan dan bisa ditelusuri ke kantongnya.", tint: "bg-rose-100 text-rose-700" },
];

export function FeaturesBento({ cta }: { cta: ReactNode }) {
  return (
    <section id="fitur" className="scroll-mt-20 bg-[#FDFBF7]">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Fitur</p>
          <h2 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-6xl">
            Semua yang dibutuhkan, dalam <span className="font-serif font-normal tracking-normal italic">satu</span>{" "}
            sistem.
          </h2>
          <p className="mt-5 text-lg text-slate-600">Modul yang saling terhubung. Dan banyak sekali.</p>
        </header>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <article className={cn(card, "min-h-[28rem] bg-white p-8")}>
            <h3 className="max-w-xs text-2xl font-extrabold tracking-[-0.02em] text-slate-900">
              Lacak kantong dalam satu pindai
            </h3>
            <p className="mt-3 max-w-xs text-slate-600">Pindai barcode, lihat seluruh riwayatnya. Selesai.</p>
            <ScannerArt className="mt-auto ml-auto w-56 text-slate-900" />
            <TextLink href="/trace">Coba lacak kantong</TextLink>
          </article>

          <article className={cn(card, "min-h-[28rem] bg-rose-100 p-8 text-rose-950")}>
            <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-rose-300/50 blur-3xl" />
            <h3 className="relative max-w-xs text-2xl font-extrabold tracking-[-0.02em]">
              Stok yang <span className="font-serif font-normal tracking-normal text-primary italic">benar-benar</span> terpantau
            </h3>
            <p className="relative mt-3 max-w-xs text-rose-900/80">
              Matriks stok per golongan darah, peringatan stok minimum, dan prioritas FEFO.
            </p>
            <StockMock className="relative my-8" />
            <Link
              href="/inventory"
              className="relative mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rose-950 shadow-sm ring-1 ring-rose-200 transition-colors hover:bg-rose-50"
            >
              Lihat stok darah
              <ArrowRight className="size-4" />
            </Link>
          </article>

          <article className={cn(card, "min-h-[28rem] bg-indigo-100 p-8")}>
            <h3 className="max-w-xs text-2xl font-extrabold tracking-[-0.02em] text-indigo-950">
              Permintaan sampai crossmatch
            </h3>
            <p className="mt-3 max-w-xs text-indigo-900/80">
              Dari ruangan ke BDRS: minta, uji silang, keluarkan. Kapan pun dibutuhkan.
            </p>
            <RequestArt className="mt-auto w-60 self-center text-indigo-950" />
            <TextLink href="#alur" className="text-indigo-950">
              Pelajari alurnya
            </TextLink>
          </article>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className={cn(card, "min-h-[34rem] justify-end bg-teal-800 p-8 text-white sm:p-10")}>
            <div className="absolute inset-x-0 top-0 h-[58%]">
              <Image
                src="/hero/care.svg"
                alt="Ilustrasi kantong darah pada tiang infus di samping pasien"
                fill
                unoptimized
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-teal-800 to-transparent" />
            </div>
            <div className="relative max-w-md">
              <p className="text-sm font-semibold text-emerald-200">Untuk perawat</p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Transfusi di samping pasien</h3>
              <p className="mt-3 text-teal-50">
                Verifikasi identitas pasien dan kantong sebelum mulai, lalu pantau tanda vital sampai selesai.
              </p>
              <Link
                href="#peran"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-white/90"
              >
                Pelajari lebih lanjut
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>

          <ul className="grid grid-cols-2 gap-4 sm:gap-5">
            {minis.map((m) => (
              <li key={m.title} className={cn(card, "gap-6 bg-white p-5 sm:p-7")}>
                <span className={cn("flex size-10 items-center justify-center rounded-full sm:size-12", m.tint)}>
                  <m.icon className="size-5 sm:size-6" />
                </span>
                <div className="mt-auto">
                  <h3 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">{m.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 sm:text-base">{m.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-col items-start justify-between gap-6 rounded-3xl bg-blue-600 p-8 text-white shadow-lg shadow-stone-200/50 sm:flex-row sm:items-center md:p-10">
          <p className="max-w-xl text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] md:text-4xl">
            Coba alurnya sesuai peran Anda.
          </p>
          {cta}
        </div>
      </div>
    </section>
  );
}

function TextLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("group mt-6 inline-flex w-fit items-center gap-3 font-semibold text-slate-900", className)}
    >
      {children}
      <span className="flex size-8 items-center justify-center rounded-full border border-current transition-transform group-hover:translate-x-1">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

/** Mini stock matrix: sample cells, decorative only. */
function StockMock({ className }: { className?: string }) {
  const groups = ["A+", "B+", "O+", "AB+", "A−", "B−", "O−", "AB−"];
  const counts = [14, 9, 18, 6, 3, 1, 2, 0];
  return (
    <div className={cn("rounded-2xl bg-white/60 p-4 ring-1 ring-rose-200/70 backdrop-blur-sm", className)} aria-hidden>
      <div className="grid grid-cols-4 gap-2">
        {groups.map((g, i) => {
          const low = counts[i] < 5;
          return (
            <div
              key={g}
              className={cn(
                "rounded-xl px-2 py-2.5 text-center",
                low ? "bg-red-50 text-red-800 ring-1 ring-red-200" : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
              )}
            >
              <p className="text-lg leading-none font-extrabold tabular-nums">{counts[i]}</p>
              <p className={cn("mt-1 text-[11px] font-bold", low ? "text-red-600" : "text-emerald-600")}>{g}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Line art: handheld scanner reading a bag barcode. */
function ScannerArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 170" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="40" width="110" height="120" rx="24" className="fill-white" />
        <rect x="42" y="64" width="62" height="26" rx="8" className="fill-red-50" />
        <path d="M52 108 v28 M60 108 v28 M66 108 v28 M76 108 v28 M82 108 v28 M92 108 v28 M98 108 v28" />
        <path d="M58 40 v-14 a8 8 0 0 1 8 -8 h14 a8 8 0 0 1 8 8 v14" />
        <path d="M150 70 l52 -30 a10 10 0 0 1 14 4 l6 11 a10 10 0 0 1 -4 14 l-40 23" className="fill-white" />
        <path d="M176 92 l14 34 a8 8 0 0 1 -5 10 l-6 2 a8 8 0 0 1 -10 -5 l-12 -30" className="fill-white" />
        <path d="M150 70 L112 116" className="stroke-primary" strokeDasharray="4 6" />
        <path d="M150 78 L118 128" className="stroke-primary" strokeDasharray="4 6" />
        <circle cx="210" cy="24" r="3" />
        <path d="M20 22 v10 M15 27 h10" />
      </g>
    </svg>
  );
}

/** Line art: request form with a check mark and a chat bubble. */
function RequestArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 170" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="40" y="26" width="104" height="134" rx="18" className="fill-white" />
        <rect x="70" y="16" width="44" height="20" rx="8" className="fill-indigo-100" />
        <path d="M62 64 h60 M62 84 h44 M62 104 h52" />
        <path d="M62 128 l10 10 l20 -22" className="stroke-emerald-600" />
        <path
          d="M166 44 h62 a14 14 0 0 1 14 14 v30 a14 14 0 0 1 -14 14 h-34 l-16 14 v-14 h-12 a14 14 0 0 1 -14 -14 v-30 a14 14 0 0 1 14 -14 z"
          className="fill-white"
        />
        <path d={HEART} transform="translate(200 82) scale(0.3)" className="fill-primary stroke-primary" />
        <path d="M170 140 h60" strokeDasharray="2 8" />
        <circle cx="24" cy="54" r="3" />
        <path d="M240 140 v10 M235 145 h10" />
      </g>
    </svg>
  );
}
