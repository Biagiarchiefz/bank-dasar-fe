import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LabArt, MapArt, ScanArt, TransfusionArt } from "../_landing/line-art";
import { Logo } from "../_landing/site-header";

// Split layout for the login page (and later the first-login password change):
// the form on the left, what the app offers on the right (below on small screens).

const benefits = [
  { title: "Lacak kantong dalam detik", body: "Dari lengan pendonor sampai pasien", tint: "bg-orange-200/60", Art: ScanArt },
  { title: "Stok selalu terpantau", body: "Per golongan darah dan komponen", tint: "bg-indigo-100", Art: MapArt },
  { title: "Hasil lab terhubung", body: "Kantong lulus langsung masuk stok", tint: "bg-sky-100", Art: LabArt },
  { title: "Transfusi lebih tenang", body: "Verifikasi ganda di samping pasien", tint: "bg-teal-100", Art: TransfusionArt },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-12">
        <Logo className="text-base" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Beranda
        </Link>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-12 lg:min-h-[85vh] lg:grid-cols-2 lg:gap-20 lg:px-12">
        <div className="mx-auto w-full max-w-md lg:mx-0">{children}</div>

        <section aria-labelledby="auth-benefits">
          <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">SI UTD & BDRS</p>
          <h2
            id="auth-benefits"
            className="mt-3 max-w-md text-2xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900 sm:text-3xl"
          >
            Satu akun untuk seluruh <span className="font-serif font-normal tracking-normal italic">alur</span> darah.
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5">
            {benefits.map(({ title, body, tint, Art }) => (
              <li key={title} className={`flex flex-col rounded-2xl p-5 sm:p-6 ${tint}`}>
                <Art className="h-20 w-auto self-start text-slate-900 sm:h-24" />
                <p className="mt-4 text-base font-bold tracking-tight text-slate-900 sm:text-lg">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
