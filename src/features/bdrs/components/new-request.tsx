"use client";

import { Loader2, Plus, Search, Send, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Field } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyFieldErrors } from "@/hooks/use-api-mutation";
import { useDebounced } from "@/hooks/use-debounced";
import { ageFrom, componentLabel, genderLabel, wards } from "@/lib/format";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import type { Patient } from "@/types";
import { useCreateRequest, usePatients } from "../hooks/use-bdrs";

const schema = z
  .object({
    patient_id: z.number({ message: "Pilih pasien." }).int().positive("Pilih pasien."),
    doctor_name: z.string().trim().min(3, "Nama dokter wajib diisi.").max(150),
    ward: z.string().min(2, "Pilih ruangan."),
    diagnosis: z.string().trim().max(255),
    indication: z.string().trim().max(255),
    priority: z.enum(["ROUTINE", "URGENT", "EMERGENCY"]),
    needed_at: z.string(),
    items: z
      .array(
        z.object({
          component_code: z.enum(["PRC", "WB", "TC", "FFP"]),
          quantity: z.coerce.number<string | number>().int().min(1, "Minimal 1.").max(10, "Maksimal 10."),
        }),
      )
      .min(1, "Tambahkan minimal satu komponen."),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<string>();
    v.items.forEach((it, i) => {
      if (seen.has(it.component_code))
        ctx.addIssue({ code: "custom", path: ["items", i, "component_code"], message: "Komponen sudah dipilih." });
      seen.add(it.component_code);
    });
  });

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

const priorities = [
  { value: "ROUTINE", label: "Rutin", cls: "border-slate-400 bg-slate-50" },
  { value: "URGENT", label: "Segera", cls: "border-amber-500 bg-amber-50" },
  { value: "EMERGENCY", label: "Darurat", cls: "border-red-600 bg-red-50 text-red-800" },
] as const;

export function NewRequest() {
  const router = useRouter();
  const [patientQuery, setPatientQuery] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const q = useDebounced(patientQuery);
  const patients = usePatients(q, { enabled: !patient });

  const form = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: 0,
      doctor_name: "",
      ward: "",
      diagnosis: "",
      indication: "",
      priority: "ROUTINE",
      needed_at: "",
      items: [{ component_code: "PRC", quantity: 1 }],
    },
  });
  const items = useFieldArray({ control: form.control, name: "items" });
  const { errors } = form.formState;

  const create = useCreateRequest((r) => router.push(`/bdrs/requests/${r.id}`));

  function choose(p: Patient) {
    setPatient(p);
    form.setValue("patient_id", p.id, { shouldValidate: true });
    if (p.ward) form.setValue("ward", p.ward, { shouldValidate: true });
  }

  return (
    <>
      <PageHeader
        title="Permintaan darah baru"
        description="Data pasien diambil dari SIMRS (contoh). Isi dokter, ruangan, dan komponen yang diminta."
        back={{ href: "/bdrs/requests", label: "Permintaan darah" }}
      />
      <form
        noValidate
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
        onSubmit={form.handleSubmit(async (v) => {
          try {
            await create.mutateAsync({
              ...v,
              diagnosis: v.diagnosis || null,
              indication: v.indication || null,
              needed_at: v.needed_at ? new Date(v.needed_at).toISOString() : null,
            });
          } catch (err) {
            applyFieldErrors(err, form.setError);
          }
        })}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Pasien</CardTitle>
            </CardHeader>
            <CardContent>
              {patient ? (
                <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
                  <span className="rounded-full bg-primary/10 p-2 text-primary">
                    <UserRound className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{patient.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono">{patient.mrn}</span> · {genderLabel[patient.gender]} · {ageFrom(patient.birth_date)} th
                      {patient.ward ? ` · ${patient.ward}` : ""}
                    </p>
                  </div>
                  <BloodGroupChip abo={patient.abo} rh={patient.rh} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPatient(null);
                      form.setValue("patient_id", 0);
                    }}
                  >
                    Ganti
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={patientQuery}
                      onChange={(e) => setPatientQuery(e.target.value)}
                      placeholder="Cari nama atau nomor RM pasien…"
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <ul className="divide-y rounded-md border">
                    {patients.data?.data.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => choose(p)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50"
                        >
                          <span className="w-24 font-mono text-xs">{p.mrn}</span>
                          <span className="flex-1 font-medium">{p.full_name}</span>
                          <span className="text-xs text-muted-foreground">{p.ward}</span>
                          <BloodGroupChip abo={p.abo} rh={p.rh} size="sm" />
                        </button>
                      </li>
                    ))}
                    {patients.data?.data.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">Pasien tidak ditemukan.</li>}
                  </ul>
                  {errors.patient_id && <p className="text-xs font-medium text-destructive">{errors.patient_id.message}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Data klinis</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Dokter penanggung jawab (DPJP)" htmlFor="doctor_name" required error={errors.doctor_name?.message}>
                <Input id="doctor_name" {...form.register("doctor_name")} />
              </Field>
              <Field label="Ruangan" required error={errors.ward?.message}>
                <Controller
                  control={form.control}
                  name="ward"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih ruangan" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Diagnosis" htmlFor="diagnosis" className="md:col-span-2">
                <Input id="diagnosis" {...form.register("diagnosis")} />
              </Field>
              <Field label="Indikasi transfusi" htmlFor="indication" className="md:col-span-2">
                <Textarea id="indication" rows={2} {...form.register("indication")} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. Komponen yang diminta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.fields.map((f, i) => (
                <div key={f.id} className="flex items-start gap-3">
                  <Controller
                    control={form.control}
                    name={`items.${i}.component_code`}
                    render={({ field }) => (
                      <Field label="Komponen" className="flex-1" error={errors.items?.[i]?.component_code?.message}>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["PRC", "WB", "TC", "FFP"] as const).map((c) => (
                              <SelectItem key={c} value={c}>
                                {c} — {componentLabel[c]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <Field label="Jumlah kantong" className="w-36" error={errors.items?.[i]?.quantity?.message}>
                    <Input type="number" min={1} max={10} {...form.register(`items.${i}.quantity`)} />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    disabled={items.fields.length === 1}
                    onClick={() => items.remove(i)}
                    aria-label="Hapus komponen"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              {items.fields.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => items.append({ component_code: "FFP", quantity: 1 })}
                >
                  <Plus />
                  Tambah komponen
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">Prioritas & kebutuhan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => field.onChange(p.value)}
                      className={cn(
                        "rounded-md border-2 px-2 py-2 text-sm font-semibold transition-colors",
                        field.value === p.value ? p.cls : "border-border text-muted-foreground hover:border-foreground/30",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            />
            <Field label="Dibutuhkan pada" htmlFor="needed_at" hint="Opsional">
              <Input id="needed_at" type="datetime-local" {...form.register("needed_at")} />
            </Field>
            {create.error && <ErrorAlert error={create.error} />}
            <Button type="submit" className="w-full" size="lg" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" /> : <Send />}
              Kirim permintaan
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
