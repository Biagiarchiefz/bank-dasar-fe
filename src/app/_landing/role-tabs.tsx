"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { roleStories } from "./content";
import bdrsPhoto from "./photos/bdrs.jpg";
import labPhoto from "./photos/lab.jpg";
import perawatPhoto from "./photos/perawat.jpg";
import pimpinanPhoto from "./photos/pimpinan.jpg";
import utdPhoto from "./photos/utd.jpg";

// Photo and caption per role. Photos are free under the Unsplash License:
// LuAnn Hunt (X20g2GQsVdA), Julia Koblitz (RlOAwXt2fEA), Navy Medicine
// (rWtt6GNkrPI), Aman Chaturvedi (0ZZo5o00o80), Luis Melendez (Pd4lRfKo16U).
type Photo = { src: StaticImageData; alt: string; position: string; caption: string };

const photos: Partial<Record<Role, Photo>> = {
  PETUGAS_UTD: {
    src: utdPhoto,
    alt: "Lengan pendonor saat pengambilan darah",
    position: "object-[60%_50%]",
    caption: "Setiap donasi langsung tercatat, dari seleksi sampai kantong berlabel.",
  },
  LAB_UTD: {
    src: labPhoto,
    alt: "Petugas laboratorium memipet sampel ke tabung uji",
    position: "object-center",
    caption: "Hasil uji saring menentukan kantong mana yang boleh dipakai.",
  },
  PETUGAS_BDRS: {
    src: bdrsPhoto,
    alt: "Petugas menyiapkan selang kantong darah",
    position: "object-[40%_40%]",
    caption: "Kantong yang tepat, untuk pasien yang tepat, tepat waktu.",
  },
  PERAWAT: {
    src: perawatPhoto,
    alt: "Kantong darah dengan ruang tetes saat transfusi",
    position: "object-[30%_40%]",
    caption: "Verifikasi ganda sebelum setiap kantong mulai mengalir.",
  },
  PIMPINAN: {
    src: pimpinanPhoto,
    alt: "Tim medis berjalan di lorong rumah sakit",
    position: "object-center",
    caption: "Satu gambaran utuh dari semua fasilitas.",
  },
};

/** "Untuk tim" section: one pill tab per role, with a photo panel for each. */
export function RolesSection() {
  const [role, setRole] = useState<Role>(roleStories[0].role);
  const reduce = useReducedMotion();

  return (
    <section id="peran" className="scroll-mt-20 bg-[#FDFBF7]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Untuk tim</p>
          <h2 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-6xl">
            Di mana pun Anda <span className="font-serif font-normal tracking-normal italic">bertugas</span>, alurnya
            sudah siap.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Setiap peran hanya melihat menu yang relevan, jadi pekerjaan harian tetap ringkas.
          </p>
        </header>

        <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="mt-9 gap-7">
          {/* py-3/-my-3 leaves room for the shadow and focus ring inside the scrollable row */}
          <TabsList className="-mx-4 -my-3 h-auto w-auto group-data-[orientation=horizontal]/tabs:h-auto max-w-none justify-start gap-2 overflow-x-auto rounded-none bg-transparent px-4 py-3 [scrollbar-width:none] sm:mx-0 sm:w-full sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {roleStories.map((r) => (
              <TabsTrigger
                key={r.role}
                value={r.role}
                className="relative h-11 flex-none rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-none transition-[color,background-color,border-color,transform] duration-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:hover:bg-transparent"
              >
                {role === r.role && (
                  <motion.span
                    layoutId="role-pill"
                    className="absolute -inset-px rounded-full bg-primary shadow-md shadow-primary/25"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{r.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {roleStories.map((r) => {
            const photo = photos[r.role];
            return (
              <TabsContent
                key={r.role}
                value={r.role}
                className="data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="flex flex-col justify-center rounded-3xl bg-white p-8 shadow-lg shadow-stone-200/50 sm:p-10">
                    <p className="text-sm font-semibold text-primary">{r.title}</p>
                    <h3 className="mt-2 text-3xl leading-[1.1] font-extrabold tracking-[-0.02em] text-slate-900 sm:text-4xl">
                      {r.headline}
                    </h3>
                    <p className="mt-3 max-w-lg text-lg text-slate-600">{r.body}</p>
                    <ul className="mt-6 space-y-3">
                      {r.points.map((p) => (
                        <li key={p} className="flex items-center gap-3">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                          <span className="font-medium text-slate-800">{p}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/login"
                      className="group mt-8 inline-flex w-fit items-center gap-2 font-semibold text-slate-900"
                    >
                      Masuk sebagai {r.title}
                      <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-slate-200 p-8 shadow-lg shadow-stone-200/50 sm:p-10">
                    {photo && (
                      <>
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          placeholder="blur"
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className={cn(
                            "object-cover duration-[1400ms] ease-out animate-in zoom-in-110 motion-reduce:animate-none",
                            photo.position,
                          )}
                        />
                        {/* bottom fade only behind the caption, so the photo stays bright */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-900/70 via-slate-900/25 to-transparent" />
                        <p className="relative max-w-md text-2xl leading-snug font-bold tracking-[-0.02em] text-white sm:text-3xl">
                          {photo.caption}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
