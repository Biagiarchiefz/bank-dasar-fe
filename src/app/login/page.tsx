import type { Metadata } from "next";
import { Suspense } from "react";
import { Droplet } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-red-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-lg bg-white/15 p-2">
            <Droplet className="size-5" />
          </span>
          {process.env.NEXT_PUBLIC_APP_NAME ?? "SI UTD & BDRS"}
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Satu kantong, satu identitas — dari pendonor sampai pasien.
          </h1>
          <p className="max-w-md text-red-100">
            Sistem informasi terpadu Unit Transfusi Darah dan Bank Darah Rumah Sakit: seleksi donor, uji saring,
            pengolahan komponen, distribusi, pelayanan pasien, dan pelacakan kantong penuh.
          </p>
        </div>
        <p className="text-xs text-red-200">Prototipe demo · seluruh data adalah data contoh (dummy).</p>
        <Droplet className="absolute -right-24 -bottom-24 size-[420px] text-white/5" />
      </section>
      <section className="flex items-center justify-center bg-muted/30 p-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
