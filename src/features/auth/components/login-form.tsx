"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Field } from "@/components/forms/field";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/config/env";
import { landingFor, safeNext } from "@/config/navigation";
import { routes } from "@/config/site";
import { roleLabel } from "@/lib/format";
import { zodResolver } from "@/lib/zod-resolver";
import type { Role } from "@/types";
import { useLogin } from "../hooks/use-auth";

const schema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});
type Values = z.infer<typeof schema>;

const demoAccounts: { username: string; role: Role; scope: string }[] = [
  { username: "pimpinan", role: "PIMPINAN", scope: "Dashboard & laporan" },
  { username: "utd", role: "PETUGAS_UTD", scope: "Pendonor, seleksi, pengambilan" },
  { username: "lab", role: "LAB_UTD", scope: "Lab, pengolahan, pelulusan" },
  { username: "bdrs", role: "PETUGAS_BDRS", scope: "Stok BDRS & permintaan" },
  { username: "perawat", role: "PERAWAT", scope: "Permintaan & transfusi" },
  { username: "admin", role: "ADMIN", scope: "Semua menu" },
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } });

  const login = useLogin((me) => {
    const next = safeNext(params.get("next"), me.role);
    if (me.must_change_password) {
      router.replace(next ? `${routes.changePassword}?next=${encodeURIComponent(next)}` : routes.changePassword);
      return;
    }
    router.replace(next ?? landingFor(me.role));
  });

  return (
    <div>
      <h1 className="text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-5xl">
        Selamat datang <span className="font-serif font-normal tracking-normal italic">kembali</span>.
      </h1>
      <p className="mt-3 text-base text-slate-600">
        Belum punya akun? Hubungi administrator unit Anda untuk dibuatkan akun beserta perannya.
      </p>

      <form className="mt-8 space-y-5" onSubmit={form.handleSubmit((v) => login.mutate(v))} noValidate>
        <Field label="Username" htmlFor="username" error={form.formState.errors.username?.message}>
          <Input
            id="username"
            autoComplete="username"
            autoFocus
            placeholder="Masukkan username"
            className="h-12 border-slate-200 bg-white"
            {...form.register("username")}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Masukkan password"
            className="h-12 border-slate-200 bg-white"
            {...form.register("password")}
          />
        </Field>
        {login.error && <ErrorAlert error={login.error} />}
        <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
          {login.isPending && <Loader2 className="animate-spin" />}
          Masuk
        </Button>
      </form>

      {env.demoMode && (
        <div className="mt-10 border-t border-stone-200 pt-6">
          <p className="text-sm font-semibold text-slate-900">Akun demo</p>
          <p className="text-sm text-slate-600">Klik untuk mengisi otomatis. Password semua akun: demo123</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {demoAccounts.map((a) => (
              <button
                key={a.username}
                type="button"
                onClick={() => {
                  form.setValue("username", a.username);
                  form.setValue("password", "demo123");
                  form.clearErrors();
                }}
                className="rounded-2xl bg-white px-4 py-3 text-left text-sm ring-1 ring-stone-200 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-200/60 hover:ring-primary/30 active:scale-[0.98]"
              >
                <span className="block font-bold text-slate-900">{a.username}</span>
                <span className="block text-xs font-medium text-primary">{roleLabel[a.role]}</span>
                <span className="mt-1 block text-xs text-slate-500">{a.scope}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
