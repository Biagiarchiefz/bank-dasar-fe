"use client";

import { Check, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageSkeleton } from "@/components/feedback/loading";
import { Field } from "@/components/forms/field";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { landingFor, safeNext } from "@/config/navigation";
import { applyFieldErrors } from "@/hooks/use-api-mutation";
import { PASSWORD_MIN_LENGTH as MIN } from "@/lib/constants";
import { roleLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import type { Me } from "@/types";
import { useChangePassword, useLogout, useMe } from "../hooks/use-auth";

// Same rules as the API (POST /auth/change-password), checked here first so
// the user sees them while typing.

function schemaFor(username: string) {
  return z
    .object({
      current_password: z.string().min(1, "Password saat ini wajib diisi."),
      new_password: z.string().min(MIN, `Minimal ${MIN} karakter.`).max(72, "Maksimal 72 karakter."),
      confirm: z.string(),
    })
    .superRefine((v, ctx) => {
      if (v.new_password.toLowerCase() === username.toLowerCase())
        ctx.addIssue({ code: "custom", path: ["new_password"], message: "Tidak boleh sama dengan username." });
      if (v.new_password && v.new_password === v.current_password)
        ctx.addIssue({ code: "custom", path: ["new_password"], message: "Tidak boleh sama dengan password saat ini." });
      if (v.confirm !== v.new_password)
        ctx.addIssue({ code: "custom", path: ["confirm"], message: "Konfirmasi password tidak cocok." });
    });
}
type Values = z.infer<ReturnType<typeof schemaFor>>;

export function ChangePasswordForm() {
  const { data: me } = useMe();
  if (!me) return <PageSkeleton />;
  return <PasswordForm me={me} />;
}

function PasswordForm({ me }: { me: Me }) {
  const router = useRouter();
  const params = useSearchParams();
  const logout = useLogout();
  const forced = me.must_change_password;
  const schema = useMemo(() => schemaFor(me.username), [me.username]);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: "", new_password: "", confirm: "" },
  });
  const { errors } = form.formState;
  const [current, next, confirm] = useWatch({ control: form.control, name: ["current_password", "new_password", "confirm"] });

  const destination = safeNext(params.get("next"), me.role) ?? landingFor(me.role);
  const change = useChangePassword(() => router.replace(destination));

  const rules = [
    { ok: next.length >= MIN, label: `Minimal ${MIN} karakter` },
    { ok: next.length > 0 && next.toLowerCase() !== me.username.toLowerCase(), label: "Berbeda dari username" },
    { ok: next.length > 0 && next !== current, label: "Berbeda dari password lama" },
    { ok: next.length > 0 && confirm === next, label: "Konfirmasi cocok" },
  ];
  // Field errors are shown next to each input; only other failures need the alert.
  const showAlert = change.error && !(change.error.code === "VALIDATION_ERROR" && change.error.fields);

  return (
    <div>
      <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-stone-200">
        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
          {me.full_name.charAt(0)}
        </span>
        {me.full_name} · {roleLabel[me.role]}
      </p>
      <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-5xl">
        {forced ? (
          <>
            Buat password <span className="font-serif font-normal tracking-normal italic">baru</span>.
          </>
        ) : (
          <>
            Ganti <span className="font-serif font-normal tracking-normal italic">password</span>.
          </>
        )}
      </h1>
      <p className="mt-3 text-base text-slate-600">
        {forced
          ? "Akun Anda masih memakai password sementara dari administrator. Ganti dulu sebelum mulai bekerja."
          : "Setelah diganti, sesi di perangkat lain akan keluar otomatis."}
      </p>

      <form
        className="mt-8 space-y-5"
        noValidate
        onSubmit={form.handleSubmit((v) =>
          change.mutate(
            { current_password: v.current_password, new_password: v.new_password },
            { onError: (err) => applyFieldErrors(err, form.setError) },
          ),
        )}
      >
        <Field
          label={forced ? "Password sementara" : "Password saat ini"}
          htmlFor="current_password"
          error={errors.current_password?.message}
        >
          <PasswordInput
            id="current_password"
            autoComplete="current-password"
            autoFocus
            className="h-12 border-slate-200 bg-white"
            {...form.register("current_password")}
          />
        </Field>
        <Field label="Password baru" htmlFor="new_password" error={errors.new_password?.message}>
          <PasswordInput
            id="new_password"
            autoComplete="new-password"
            className="h-12 border-slate-200 bg-white"
            {...form.register("new_password")}
          />
        </Field>
        <Field label="Ulangi password baru" htmlFor="confirm" error={errors.confirm?.message}>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            className="h-12 border-slate-200 bg-white"
            {...form.register("confirm")}
          />
        </Field>

        <ul className="grid grid-cols-1 gap-2 rounded-2xl bg-white p-4 text-sm ring-1 ring-stone-200 sm:grid-cols-2" aria-label="Syarat password">
          {rules.map((r) => (
            <li key={r.label} className={cn("flex items-center gap-2", r.ok ? "text-emerald-700" : "text-slate-500")}>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
                  r.ok ? "bg-emerald-100" : "bg-slate-100",
                )}
              >
                <Check className={cn("size-3.5 transition-opacity", r.ok ? "opacity-100" : "opacity-30")} />
              </span>
              {r.label}
              <span className="sr-only">{r.ok ? "(terpenuhi)" : "(belum)"}</span>
            </li>
          ))}
        </ul>

        {showAlert && <ErrorAlert error={change.error} />}
        <Button type="submit" size="lg" className="w-full" disabled={change.isPending}>
          {change.isPending && <Loader2 className="animate-spin" />}
          Simpan password
        </Button>
      </form>

      <div className="mt-6 text-center">
        {forced ? (
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
          >
            <LogOut className="size-4" />
            Keluar dan ganti nanti
          </button>
        ) : (
          <Link
            href={destination}
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
          >
            Batal
          </Link>
        )}
      </div>
    </div>
  );
}
