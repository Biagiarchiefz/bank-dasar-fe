"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";
import { roleLabel } from "@/lib/format";
import { canAccess, landingFor } from "@/lib/nav";
import { qk } from "@/lib/query-keys";
import type { Me, Role } from "@/lib/types";
import { useApiMutation } from "@/lib/use-api-mutation";
import { zodResolver } from "@/lib/zod-resolver";

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
  const qc = useQueryClient();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } });

  const login = useApiMutation({
    mutationFn: (v: Values) => apiPost<Me>("/api/v1/auth/login", v),
    silentCodes: ["UNAUTHENTICATED", "FORBIDDEN", "VALIDATION_ERROR"],
    onSuccess: (me) => {
      qc.clear();
      qc.setQueryData(qk.me, me);
      const next = params.get("next");
      router.replace(next && next.startsWith("/") && canAccess(me.role, next) ? next : landingFor(me.role));
    },
  });

  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <div className="w-full max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Masuk</CardTitle>
          <CardDescription>Gunakan akun petugas Anda untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => login.mutate(v))} noValidate>
            <Field label="Username" htmlFor="username" error={form.formState.errors.username?.message}>
              <Input id="username" autoComplete="username" autoFocus {...form.register("username")} />
            </Field>
            <Field label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
              <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
            </Field>
            {login.error && <ErrorAlert error={login.error} />}
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>

      {demo && (
        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Akun demo</CardTitle>
            <CardDescription>Klik untuk mengisi otomatis. Password semua akun: demo123</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 px-4">
            {demoAccounts.map((a) => (
              <button
                key={a.username}
                type="button"
                onClick={() => {
                  form.setValue("username", a.username);
                  form.setValue("password", "demo123");
                  form.clearErrors();
                }}
                className="rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="block font-semibold">{a.username}</span>
                <span className="block text-xs text-muted-foreground">{roleLabel[a.role]}</span>
                <span className="block text-[11px] text-muted-foreground">{a.scope}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
