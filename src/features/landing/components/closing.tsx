import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { sections } from "../content";
import closingPhoto from "../photos/closing.jpg";
import { Logo } from "./site-header";

const appName = site.name;

/** Closing call to action on a photo (IV stand by Marcelo Leal, Unsplash License). */
export function ClosingBanner({ cta }: { cta: ReactNode }) {
  return (
    <section className="bg-[#FDFBF7]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl shadow-lg shadow-stone-200/50">
          <Image
            src={closingPhoto}
            alt=""
            fill
            placeholder="blur"
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="-z-10 object-cover object-[75%_50%]"
          />
          {/* darkens only the text side; the photo stays clear on the right */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-900/70 via-slate-900/35 to-transparent" />

          <div className="max-w-xl px-8 py-16 sm:px-12 lg:py-24">
            <p className="inline-flex rounded-full bg-white px-3.5 py-1 text-xs font-bold tracking-[0.12em] text-primary uppercase">
              Siap mencoba?
            </p>
            <h2 className="mt-5 text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
              Anda selangkah lagi dari stok darah yang selalu{" "}
              <span className="font-serif font-normal tracking-normal italic">terpantau</span>.
            </h2>
            <p className="mt-4 text-lg text-white/85">
              Masuk dengan akun petugas Anda, atau pilih salah satu akun demo di halaman login untuk mencoba alurnya
              sesuai peran.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              {cta}
              <span className="text-sm text-white/75">Prototipe demo · seluruh data adalah data contoh.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const appLinks = [
  { href: "/login", label: "Masuk" },
  { href: "/app", label: "Buka aplikasi" },
  { href: "/trace", label: "Lacak kantong" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-6">
          <Logo />
          <p className="mt-5 max-w-sm text-2xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900">
            Darah aman, dari pendonor sampai{" "}
            <span className="font-serif font-normal tracking-normal italic">pasien</span>.
          </p>
          <p className="mt-3 max-w-sm text-sm text-slate-600">
            Sistem Informasi Unit Transfusi Darah & Bank Darah Rumah Sakit.
          </p>
        </div>
        <FooterColumn title="Jelajahi" className="md:col-span-3">
          {sections.map((s) => (
            <a key={s.href} href={s.href} className="transition-colors hover:text-primary">
              {s.label}
            </a>
          ))}
        </FooterColumn>
        <FooterColumn title="Aplikasi" className="md:col-span-3">
          {appLinks.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </FooterColumn>
      </div>
      <div className="border-t border-stone-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 {appName}</p>
          <p>Prototipe demo · seluruh data adalah data contoh</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, className, children }: { title: string; className?: string; children: ReactNode[] }) {
  return (
    <nav aria-label={title} className={className}>
      <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">{title}</p>
      <ul className="mt-4 space-y-3 text-sm font-medium text-slate-700">
        {children.map((child, i) => (
          <li key={i}>{child}</li>
        ))}
      </ul>
    </nav>
  );
}
