"use client";

import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Info, Loader2, Save, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Field, KeyValue } from "@/components/shared/field";
import { PageSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { ProductStatus, StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { bloodGroup, fmtDateTime, labStatus, testValue } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { LabDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApiMutation } from "@/lib/use-api-mutation";
import { zodResolver } from "@/lib/zod-resolver";

const test = z.enum(["NON_REACTIVE", "REACTIVE"], { message: "Pilih hasil." });
const schema = z.object({
  hiv: test,
  hbv: test,
  hcv: test,
  syphilis: test,
  abo: z.enum(["A", "B", "AB", "O"], { message: "Pilih golongan ABO." }),
  rh: z.enum(["POS", "NEG"], { message: "Pilih rhesus." }),
  method_note: z.string().trim().max(255),
  notes: z.string().trim().max(255),
});
type Values = z.infer<typeof schema>;

const tests: { key: "hiv" | "hbv" | "hcv" | "syphilis"; label: string }[] = [
  { key: "hiv", label: "HIV" },
  { key: "hbv", label: "HBV (Hepatitis B)" },
  { key: "hcv", label: "HCV (Hepatitis C)" },
  { key: "syphilis", label: "Sifilis" },
];

function Toggle<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string; activeClass?: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1">
      {options.map((o) => (
        <Button
          key={o.value}
          type="button"
          size="sm"
          disabled={disabled}
          variant={value === o.value ? "default" : "outline"}
          className={cn("min-w-14", value === o.value && o.activeClass)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

export function LabResultForm() {
  const { donationId } = useParams<{ donationId: string }>();
  const id = Number(donationId);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.labResult(id),
    queryFn: () => apiGet<LabDetail>(`/api/v1/lab/results/${id}`),
  });

  const form = useForm<Values>({ resolver: zodResolver(schema) });
  const values = useWatch({ control: form.control });
  useEffect(() => {
    if (!data) return;
    form.reset({
      hiv: data.hiv === "PENDING" ? (undefined as unknown as Values["hiv"]) : data.hiv,
      hbv: data.hbv === "PENDING" ? (undefined as unknown as Values["hbv"]) : data.hbv,
      hcv: data.hcv === "PENDING" ? (undefined as unknown as Values["hcv"]) : data.hcv,
      syphilis: data.syphilis === "PENDING" ? (undefined as unknown as Values["syphilis"]) : data.syphilis,
      abo: data.abo ?? (undefined as unknown as Values["abo"]),
      rh: data.rh ?? (undefined as unknown as Values["rh"]),
      method_note: data.method_note ?? "ChLIA (uji saring), gel card (golongan darah)",
      notes: data.notes ?? "",
    });
  }, [data, form]);

  const save = useApiMutation({
    mutationFn: (v: Values) =>
      apiPut<LabDetail>(`/api/v1/lab/results/${id}`, { ...v, method_note: v.method_note || null, notes: v.notes || null }),
    success: "Hasil disimpan. Menunggu validasi.",
    invalidate: [["lab"]],
  });
  const validate = useApiMutation({
    mutationFn: () => apiPost<LabDetail>(`/api/v1/lab/results/${id}/validate`),
    success: (r) => (r.is_reactive ? "Hasil divalidasi. Semua kantong donasi ini DITOLAK." : "Hasil divalidasi."),
    invalidate: [["lab"], ["products"], ["release"], ["processing"], ["donations"]],
    silentCodes: ["BLOOD_GROUP_DISCREPANCY"],
  });

  if (isLoading) return <PageSkeleton />;
  if (!data) return <ErrorAlert error={error} />;

  const locked = data.status === "VALIDATED";
  const reactiveNow = tests.some((t) => values[t.key] === "REACTIVE");
  const { errors } = form.formState;
  const dirty = form.formState.isDirty;

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{data.donation_no}</span>}
        description={`${data.donor_name} (${data.donor_no}) · diambil ${fmtDateTime(data.collected_at)}`}
        back={{ href: "/utd/lab", label: "Laboratorium" }}
        actions={<StatusBadge map={labStatus} value={data.status} />}
      />

      {(reactiveNow || (locked && data.is_reactive)) && (
        <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50">
          <ShieldAlert />
          <AlertTitle>Hasil uji saring REAKTIF</AlertTitle>
          <AlertDescription>
            {locked
              ? "Semua kantong dari donasi ini sudah ditolak dan tidak dapat digunakan. Informasi ini bersifat rahasia."
              : "Saat divalidasi, semua kantong dari donasi ini akan otomatis DITOLAK. Informasi ini bersifat rahasia."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form
          noValidate
          className="space-y-6"
          onSubmit={form.handleSubmit((v) => save.mutate(v))}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uji saring IMLTD</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {tests.map((t) => (
                <div key={t.key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{t.label}</p>
                    {errors[t.key] && <p className="text-xs text-destructive">{errors[t.key]?.message}</p>}
                  </div>
                  {locked ? (
                    <StatusBadge map={testValue} value={data[t.key]} />
                  ) : (
                    <Controller
                      control={form.control}
                      name={t.key}
                      render={({ field }) => (
                        <Toggle
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: "NON_REACTIVE", label: "Non-reaktif", activeClass: "bg-emerald-600 hover:bg-emerald-600/90" },
                            { value: "REACTIVE", label: "Reaktif", activeClass: "bg-red-700 hover:bg-red-700/90" },
                          ]}
                        />
                      )}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Golongan darah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {locked ? (
                <BloodGroupChip abo={data.abo} rh={data.rh} size="xl" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="ABO" required error={errors.abo?.message}>
                    <Controller
                      control={form.control}
                      name="abo"
                      render={({ field }) => (
                        <Toggle
                          value={field.value}
                          onChange={field.onChange}
                          options={(["A", "B", "AB", "O"] as const).map((v) => ({ value: v, label: v }))}
                        />
                      )}
                    />
                  </Field>
                  <Field label="Rhesus" required error={errors.rh?.message}>
                    <Controller
                      control={form.control}
                      name="rh"
                      render={({ field }) => (
                        <Toggle
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: "POS", label: "Positif (+)" },
                            { value: "NEG", label: "Negatif (−)" },
                          ]}
                        />
                      )}
                    />
                  </Field>
                </div>
              )}
              {data.donor_group_confirmed && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Info className="size-4" />
                  Golongan terkonfirmasi pendonor sebelumnya: <b>{bloodGroup(data.donor_abo, data.donor_rh)}</b>
                </p>
              )}
              {!locked && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Metode" htmlFor="method_note">
                    <Input id="method_note" {...form.register("method_note")} />
                  </Field>
                  <Field label="Catatan" htmlFor="notes">
                    <Input id="notes" {...form.register("notes")} />
                  </Field>
                </div>
              )}
            </CardContent>
          </Card>

          {save.error && <ErrorAlert error={save.error} />}
          {validate.error && (
            <ErrorAlert
              error={validate.error}
              title={validate.error.code === "BLOOD_GROUP_DISCREPANCY" ? "Golongan darah tidak konsisten" : undefined}
            />
          )}

          {!locked && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="submit" variant="outline" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                Simpan hasil
              </Button>
              <ConfirmDialog
                title="Validasi hasil laboratorium?"
                description={
                  reactiveNow
                    ? "Ada hasil REAKTIF. Semua kantong dari donasi ini akan ditolak. Hasil yang sudah divalidasi tidak dapat diubah."
                    : `Golongan ${bloodGroup(values.abo, values.rh) || "—"} akan dicatat pada semua kantong dan pendonor. Hasil yang sudah divalidasi tidak dapat diubah.`
                }
                confirmLabel="Validasi"
                destructive={reactiveNow}
                onConfirm={() => validate.mutate()}
                trigger={
                  <Button type="button" disabled={data.status !== "ENTERED" || dirty || validate.isPending}>
                    <BadgeCheck />
                    Validasi
                  </Button>
                }
              />
            </div>
          )}
          {!locked && data.status === "ENTERED" && dirty && (
            <p className="text-right text-xs text-muted-foreground">Simpan perubahan terlebih dahulu sebelum validasi.</p>
          )}
        </form>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Jejak pemeriksaan</CardTitle>
            </CardHeader>
            <CardContent>
              <KeyValue
                items={[
                  ["Diinput", data.entered_at ? `${fmtDateTime(data.entered_at)} · ${data.entered_by_name}` : "—"],
                  ["Divalidasi", data.validated_at ? `${fmtDateTime(data.validated_at)} · ${data.validated_by_name}` : "—"],
                ]}
              />
              <p className="mt-3 rounded-md bg-muted p-2 text-xs text-muted-foreground">
                Idealnya hasil divalidasi oleh petugas yang berbeda dari penginput.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kantong dari donasi ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/inventory/${p.id}`}
                  className="block rounded-md border p-2 text-sm transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">{p.product_no}</span>
                    <BloodGroupChip abo={p.abo} rh={p.rh} size="sm" />
                  </div>
                  <div className="mt-1">
                    <ProductStatus quality={p.quality_status} inventory={p.inventory_status} expired={p.is_expired} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
