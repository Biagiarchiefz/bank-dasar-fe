"use client";

import { Loader2, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { applyFieldErrors } from "@/hooks/use-api-mutation";
import { todayWIB } from "@/lib/format";
import { zodResolver } from "@/lib/zod-resolver";
import type { Donor } from "@/types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter.`)
    .transform((v) => (v === "" ? null : v));

export const donorSchema = z.object({
  full_name: z.string().trim().min(3, "Nama minimal 3 karakter.").max(150),
  nik: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{16}$/.test(v), "NIK harus 16 digit angka.")
    .transform((v) => (v === "" ? null : v)),
  gender: z.enum(["M", "F"], { message: "Pilih jenis kelamin." }),
  birth_date: z
    .string()
    .min(1, "Tanggal lahir wajib diisi.")
    .refine((v) => v < todayWIB(), "Tanggal lahir harus sebelum hari ini."),
  phone: optionalText(20),
  address: optionalText(255),
});

export type DonorFormInput = z.input<typeof donorSchema>;
export type DonorFormOutput = z.output<typeof donorSchema>;

export function donorDefaults(d?: Donor): DonorFormInput {
  return {
    full_name: d?.full_name ?? "",
    nik: d?.nik ?? "",
    gender: d?.gender ?? ("" as "M"),
    birth_date: d?.birth_date ?? "",
    phone: d?.phone ?? "",
    address: d?.address ?? "",
  };
}

/** Registration/edit form for a donor (shared by "new" and "edit"). */
export function DonorForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Donor;
  submitLabel: string;
  onSubmit: (values: DonorFormOutput) => Promise<unknown>;
}) {
  const form = useForm<DonorFormInput, unknown, DonorFormOutput>({
    resolver: zodResolver(donorSchema),
    defaultValues: donorDefaults(initial),
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={form.handleSubmit(async (v) => {
        try {
          await onSubmit(v);
        } catch (err) {
          applyFieldErrors(err, form.setError);
        }
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nama lengkap" htmlFor="full_name" required error={errors.full_name?.message} className="md:col-span-2">
          <Input id="full_name" autoFocus {...form.register("full_name")} />
        </Field>
        <Field label="NIK" htmlFor="nik" error={errors.nik?.message} hint="16 digit, opsional (data contoh)">
          <Input id="nik" inputMode="numeric" maxLength={16} {...form.register("nik")} />
        </Field>
        <Field label="Tanggal lahir" htmlFor="birth_date" required error={errors.birth_date?.message}>
          <Input id="birth_date" type="date" max={todayWIB()} {...form.register("birth_date")} />
        </Field>
        <Field label="Jenis kelamin" required error={errors.gender?.message}>
          <Controller
            control={form.control}
            name="gender"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6 pt-1">
                {[
                  ["M", "Laki-laki"],
                  ["F", "Perempuan"],
                ].map(([v, l]) => (
                  <Label key={v} className="flex items-center gap-2 font-normal">
                    <RadioGroupItem value={v} />
                    {l}
                  </Label>
                ))}
              </RadioGroup>
            )}
          />
        </Field>
        <Field label="Nomor telepon" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" inputMode="tel" {...form.register("phone")} />
        </Field>
        <Field label="Alamat" htmlFor="address" error={errors.address?.message} className="md:col-span-2">
          <Textarea id="address" rows={2} {...form.register("address")} />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
