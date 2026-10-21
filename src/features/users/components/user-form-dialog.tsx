"use client";

import { Info, Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Field } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applyFieldErrors } from "@/hooks/use-api-mutation";
import { roleLabel } from "@/lib/format";
import { zodResolver } from "@/lib/zod-resolver";
import { useSession } from "@/store/session";
import type { Account, Facility, Role } from "@/types";
import type { AccountInput } from "../services/users.service";
import { facilityOptions, facilityTypeFor, roles } from "../utils";

const NONE = "none";

// Same rules as POST/PATCH /admin/users; the API stays the source of truth.
const schema = z
  .object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9._]{3,32}$/, "3–32 karakter: huruf kecil, angka, titik atau garis bawah."),
    full_name: z.string().trim().min(3, "Nama minimal 3 karakter.").max(150, "Maksimal 150 karakter."),
    email: z.union([z.literal(""), z.email("Format email tidak valid.").max(254)]),
    role: z.enum(roles, { message: "Pilih peran." }),
    facility_id: z.string(),
  })
  .superRefine((v, ctx) => {
    const type = facilityTypeFor(v.role);
    if (type && v.facility_id === NONE)
      ctx.addIssue({ code: "custom", path: ["facility_id"], message: `Peran ini wajib terikat ke fasilitas ${type}.` });
  });
type Values = z.infer<typeof schema>;

function defaults(a: Account | null, facilities: Facility[]): Values {
  if (a) {
    return {
      username: a.username,
      full_name: a.full_name,
      email: a.email ?? "",
      role: a.role,
      facility_id: a.facility_id === null ? NONE : String(a.facility_id),
    };
  }
  const first = facilityOptions("PETUGAS_UTD", facilities)[0];
  return { username: "", full_name: "", email: "", role: "PETUGAS_UTD", facility_id: first ? String(first.id) : NONE };
}

/** Create (account = null) or edit an account. */
export function UserFormDialog({
  open,
  account,
  isSelf,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  account: Account | null;
  isSelf: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AccountInput) => Promise<unknown>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {/* Keyed so the form resets to the chosen account each time it opens. */}
        {open && (
          <AccountForm
            key={account?.id ?? "new"}
            account={account}
            isSelf={isSelf}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AccountForm({
  account,
  isSelf,
  onCancel,
  onSubmit,
}: {
  account: Account | null;
  isSelf: boolean;
  onCancel: () => void;
  onSubmit: (payload: AccountInput) => Promise<unknown>;
}) {
  const { facilities } = useSession();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults(account, facilities) });
  const { errors, isSubmitting } = form.formState;
  const [role, facilityId] = useWatch({ control: form.control, name: ["role", "facility_id"] });
  const options = facilityOptions(role, facilities);
  const required = facilityTypeFor(role) !== null;
  const editing = account !== null;
  const scopeChanged =
    editing && (role !== account.role || facilityId !== (account.facility_id === null ? NONE : String(account.facility_id)));

  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={form.handleSubmit(async (v) => {
        try {
          await onSubmit({
            username: v.username,
            full_name: v.full_name,
            email: v.email === "" ? null : v.email,
            role: v.role,
            facility_id: v.facility_id === NONE ? null : Number(v.facility_id),
          });
        } catch (err) {
          applyFieldErrors(err, form.setError);
        }
      })}
    >
      <DialogHeader>
        <DialogTitle>{editing ? "Ubah akun" : "Tambah pengguna"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Username tidak bisa diubah. Password dikelola lewat menu Reset password."
            : "Password sementara dibuat otomatis dan ditampilkan sekali setelah akun disimpan."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lengkap" htmlFor="full_name" required error={errors.full_name?.message} className="sm:col-span-2">
          <Input id="full_name" autoFocus placeholder="mis. Ners Dewi Lestari" {...form.register("full_name")} />
        </Field>
        <Field
          label="Username"
          htmlFor="username"
          required={!editing}
          error={errors.username?.message}
          hint={editing ? undefined : "Huruf kecil, angka, titik, garis bawah"}
        >
          <Input
            id="username"
            autoComplete="off"
            spellCheck={false}
            disabled={editing}
            placeholder="mis. ners.dewi"
            className="font-mono"
            {...form.register("username")}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message} hint="Opsional">
          <Input id="email" type="email" autoComplete="off" placeholder="nama@rs-demo.id" {...form.register("email")} />
        </Field>
        <Field
          label="Peran"
          required
          error={errors.role?.message}
          hint={isSelf ? "Anda tidak dapat mengubah peran akun sendiri." : undefined}
        >
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Select
                value={field.value}
                disabled={isSelf}
                onValueChange={(v) => {
                  const next = v as Role;
                  field.onChange(next);
                  // Keep the facility valid for the new role.
                  const allowed = facilityOptions(next, facilities);
                  const current = form.getValues("facility_id");
                  if (facilityTypeFor(next) && !allowed.some((f) => String(f.id) === current)) {
                    form.setValue("facility_id", allowed[0] ? String(allowed[0].id) : NONE, { shouldValidate: true });
                  }
                }}
              >
                <SelectTrigger className="w-full" aria-label="Peran">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Fasilitas"
          required={required}
          error={errors.facility_id?.message}
          hint={required ? `Hanya fasilitas ${facilityTypeFor(role)}` : "Kosongkan agar bisa melihat semua fasilitas"}
        >
          <Controller
            control={form.control}
            name="facility_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-label="Fasilitas">
                  <SelectValue placeholder="Pilih fasilitas" />
                </SelectTrigger>
                <SelectContent>
                  {!required && <SelectItem value={NONE}>Tanpa fasilitas (semua)</SelectItem>}
                  {options.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      {scopeChanged && (
        <p className="flex gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <Info className="mt-0.5 size-4 shrink-0" />
          Mengubah peran atau fasilitas akan mengeluarkan pengguna ini dari semua sesinya. Pengguna perlu masuk lagi.
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {editing ? "Simpan perubahan" : "Buat akun"}
        </Button>
      </DialogFooter>
    </form>
  );
}
