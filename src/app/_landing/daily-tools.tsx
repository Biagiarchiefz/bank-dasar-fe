"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BagArt, LabelArt, MapArt, ScanArt } from "./line-art";
import { NavButton } from "./nav-button";

// Everyday tools for staff: a swipeable row of four cards below lg, a plain
// four-column grid from lg up. The arrow buttons scroll the row by one card.

type Tool = { title: string; body: string; link: string; href: string; tint: string; art: ReactNode };

const tools: Tool[] = [
  {
    title: "Cetak label kantong",
    body: "Label ber-barcode dengan golongan darah dan tanggal kedaluwarsa, siap ditempel saat pengambilan.",
    link: "Cetak label",
    href: "/utd/collection",
    tint: "bg-amber-100/70",
    art: <LabelArt />,
  },
  {
    title: "Pindai & lacak",
    body: "Arahkan pemindai ke barcode dan lihat riwayat kantong dari pendonor sampai pasien.",
    link: "Lacak kantong",
    href: "/trace",
    tint: "bg-orange-400",
    art: <ScanArt />,
  },
  {
    title: "Cek stok di fasilitas",
    body: "Lihat stok siap pakai per golongan darah di UTD dan setiap BDRS, lengkap dengan yang segera kedaluwarsa.",
    link: "Lihat stok",
    href: "/inventory",
    tint: "bg-indigo-200/70",
    art: <MapArt />,
  },
  {
    title: "Ajukan permintaan darah",
    body: "Minta darah dari ruangan dan pantau statusnya sampai kantong siap diserahkan.",
    link: "Buat permintaan",
    href: "/bdrs/requests/new",
    tint: "bg-teal-100/70",
    art: <BagArt />,
  },
];

export function DailyTools() {
  const rowRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ prev: false, next: false });

  const update = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setEdges({ prev: row.scrollLeft > 4, next: row.scrollLeft + row.clientWidth < row.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    update();
    row.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      row.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  function step(dir: 1 | -1) {
    const row = rowRef.current;
    const first = row?.firstElementChild as HTMLElement | null;
    if (!row || !first) return;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    row.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: "smooth" });
  }

  return (
    <section className="bg-[#FDFBF7]">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Untuk petugas</p>
          <h2 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-6xl">
            Pekerjaan harian, cukup <span className="font-serif font-normal tracking-normal italic">sekali</span> klik.
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Cetak label, lacak kantong, cek stok, dan ajukan permintaan. Semua yang dipakai setiap hari, selalu dekat.
          </p>
        </header>

        <ul
          ref={rowRef}
          className="-mx-4 mt-16 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {tools.map((t) => (
            <li
              key={t.title}
              className="flex w-[85%] shrink-0 snap-start flex-col rounded-3xl bg-white p-4 shadow-lg shadow-stone-200/50 sm:w-[calc(50%-12px)] lg:w-auto"
            >
              <div className={cn("mb-6 flex h-48 items-center justify-center rounded-2xl p-6", t.tint)}>{t.art}</div>
              <div className="flex flex-1 flex-col px-2 pb-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">{t.title}</h3>
                <p className="mt-2 text-slate-600">{t.body}</p>
                <Link
                  href={t.href}
                  className="group mt-auto inline-flex w-fit items-center gap-2 pt-6 font-semibold text-slate-900"
                >
                  {t.link}
                  <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-end gap-3 border-t border-stone-200 pt-6">
          <NavButton label="Sebelumnya" disabled={!edges.prev} onClick={() => step(-1)}>
            <ChevronLeft />
          </NavButton>
          <NavButton label="Berikutnya" disabled={!edges.next} onClick={() => step(1)}>
            <ChevronRight />
          </NavButton>
        </div>
      </div>
    </section>
  );
}
