"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2, Syringe, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Field, KeyValue } from "@/components/shared/field";
import { PageSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import { fmtCivilDate, fmtDateTime, genderLabel, todayWIB, visitStatus } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { ScreeningConfig, ScreeningRanges, Visit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { applyFieldErrors, useApiMutation } from "@/lib/use-api-mutation";
import { zodResolver } from "@/lib/zod-resolver";

const num = (msg: string) =>
  z
    .string()
    .trim()
    .min(1, msg)
    .refine((v) => !Number.isNaN(Number(v.replace(",", "."))), "Harus berupa angka.")
    .transform((v) => Number(v.replace(",", ".")));

const schema = z
  .object({
    answers: z.record(z.string(), z.enum(["yes", "no"]).optional()),
    weight_kg: num("Berat badan wajib diisi."),
    systolic: num("Sistolik wajib diisi."),
    diastolic: num("Diastolik wajib diisi."),
    pulse: num("Nadi wajib diisi."),
    temperature_c: num("Suhu wajib diisi."),
    hb_g_dl: num("Hb wajib diisi."),
    decision: z.enum(["ELIGIBLE", "DEFERRED"], { message: "Pilih keputusan." }),
    decision_note: z.string().trim().max(255),
    deferral_type: z.enum(["TEMPORARY", "PERMANENT"]).optional(),
    deferral_reason: z.string().trim().max(255),
    deferral_until: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.decision !== "DEFERRED") return;
    if (!v.deferral_type) ctx.addIssue({ code: "custom", path: ["deferral_type"], message: "Pilih jenis penundaan." });
    if (v.deferral_reason.length < 3)
      ctx.addIssue({ code: "custom", path: ["deferral_reason"], message: "Alasan penundaan wajib diisi." });
    if (v.deferral_type === "TEMPORARY" && (!v.deferral_until || v.deferral_until <= todayWIB()))
      ctx.addIssue({ code: "custom", path: ["deferral_until"], message: "Tanggal harus setelah hari ini." });
  });

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

export function ScreeningForm() {
  const { visitId } = useParams<{ visitId: string }>();
  const id = Number(visitId);
  const visit = useQuery({ queryKey: qk.visit(id), queryFn: () => apiGet<Visit>(`/api/v1/visits/${id}`) });
  const config = useQuery({
    queryKey: qk.screeningConfig,
    queryFn: () => apiGet<ScreeningConfig>("/api/v1/config/screening"),
    staleTime: Infinity,
  });

  if (visit.isLoading || config.isLoading) return <PageSkeleton />;
  if (!visit.data || !config.data) return <ErrorAlert error={visit.error ?? config.error} />;
  const v = visit.data;

  return (
    <>
      <PageHeader
        title={`Skrining ${v.donor_name}`}
        description={
          <span>
            <span className="font-mono">{v.visit_no}</span> · {fmtDateTime(v.visit_at)}
          </span>
        }
        back={{ href: "/utd/screening", label: "Seleksi" }}
        actions={<StatusBadge map={visitStatus} value={v.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {v.status === "REGISTERED" ? <Form visit={v} config={config.data} /> : <ScreeningSummary visit={v} />}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Pendonor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <BloodGroupChip abo={v.donor_abo} rh={v.donor_rh} size="lg" />
            <KeyValue
              items={[
                ["Nama", v.donor_name],
                ["No. pendonor", <span key="no" className="font-mono">{v.donor_no}</span>],
                ["Jenis kelamin", genderLabel[v.donor_gender]],
              ]}
            />
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href={`/utd/donors/${v.donor_id}`}>Lihat profil & riwayat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function rangeWarning(key: string, value: number | undefined, r: ScreeningRanges): string | null {
  if (value === undefined || Number.isNaN(value)) return null;
  switch (key) {
    case "hb_g_dl":
      return value < r.hb_min || value > r.hb_max ? `Di luar rentang acuan ${r.hb_min}–${r.hb_max} g/dL` : null;
    case "weight_kg":
      return value < r.weight_min ? `Di bawah batas ${r.weight_min} kg` : null;
    case "systolic":
      return value < r.systolic_min || value > r.systolic_max ? `Di luar ${r.systolic_min}–${r.systolic_max} mmHg` : null;
    case "diastolic":
      return value < r.diastolic_min || value > r.diastolic_max ? `Di luar ${r.diastolic_min}–${r.diastolic_max} mmHg` : null;
    case "temperature_c":
      return value >= 37.5 ? "Suhu tubuh tinggi (≥ 37,5 °C)" : null;
  }
  return null;
}

const vitals: { key: keyof Input & string; label: string; unit: string }[] = [
  { key: "weight_kg", label: "Berat badan", unit: "kg" },
  { key: "systolic", label: "Tekanan sistolik", unit: "mmHg" },
  { key: "diastolic", label: "Tekanan diastolik", unit: "mmHg" },
  { key: "pulse", label: "Nadi", unit: "x/menit" },
  { key: "temperature_c", label: "Suhu", unit: "°C" },
  { key: "hb_g_dl", label: "Hemoglobin (Hb)", unit: "g/dL" },
];

function Form({ visit, config }: { visit: Visit; config: ScreeningConfig }) {
  const router = useRouter();
  const form = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: {
      answers: {},
      weight_kg: "",
      systolic: "",
      diastolic: "",
      pulse: "",
      temperature_c: "",
      hb_g_dl: "",
      decision: undefined,
      decision_note: "",
      deferral_type: undefined,
      deferral_reason: "",
      deferral_until: "",
    },
  });
  const values = useWatch({ control: form.control });
  const { errors } = form.formState;

  const submit = useApiMutation({
    mutationFn: (body: object) => apiPost<Visit>(`/api/v1/visits/${visit.id}/screening`, body),
    success: (v) => (v.status === "ELIGIBLE" ? "Pendonor dinyatakan layak donor." : "Pendonor ditunda."),
    invalidate: [["visits"], ["donors"]],
  });

  const warnings = vitals
    .map((f) => {
      const raw = values[f.key];
      const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw.replace(",", ".")) : undefined;
      const w = rangeWarning(f.key, n, config.ranges);
      return w ? `${f.label}: ${w}` : null;
    })
    .filter((w): w is string => w !== null);
  const riskyAnswers = config.questions.filter(
    (q) => (q.defer_if_yes && values.answers?.[q.code] === "yes") || (!q.defer_if_yes && values.answers?.[q.code] === "no"),
  );
  const unanswered = config.questions.filter((q) => !values.answers?.[q.code]).length;
  // "answers" is a record, so its own error message sits on the object itself.
  const answersError = (errors.answers as { message?: string } | undefined)?.message;

  async function onSubmit(v: Output) {
    if (unanswered > 0) {
      form.setError("answers", { message: `${unanswered} pertanyaan belum dijawab.` });
      return;
    }
    const body = {
      questionnaire: config.questions.map((q) => ({ code: q.code, answer: v.answers[q.code] === "yes" })),
      weight_kg: v.weight_kg,
      systolic: v.systolic,
      diastolic: v.diastolic,
      pulse: v.pulse,
      temperature_c: v.temperature_c,
      hb_g_dl: v.hb_g_dl,
      decision: v.decision,
      decision_note: v.decision_note || null,
      ...(v.decision === "DEFERRED"
        ? {
            deferral_type: v.deferral_type,
            deferral_reason: v.deferral_reason,
            deferral_until: v.deferral_type === "TEMPORARY" ? v.deferral_until : null,
          }
        : {}),
    };
    try {
      const res = await submit.mutateAsync(body);
      router.push(res.status === "ELIGIBLE" ? "/utd/collection" : "/utd/screening");
    } catch (err) {
      applyFieldErrors(err, form.setError);
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Kuesioner kesehatan</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {config.questions.map((q, i) => {
            const answer = values.answers?.[q.code];
            const risky = (q.defer_if_yes && answer === "yes") || (!q.defer_if_yes && answer === "no");
            return (
              <div key={q.code} className={cn("flex items-center gap-4 py-2.5", risky && "bg-amber-50/60")}>
                <span className="w-6 text-sm text-muted-foreground tabular-nums">{i + 1}.</span>
                <p className="flex-1 text-sm">{q.question}</p>
                <Controller
                  control={form.control}
                  name={`answers.${q.code}`}
                  render={({ field }) => (
                    <div className="flex gap-1">
                      {(["yes", "no"] as const).map((opt) => (
                        <Button
                          key={opt}
                          type="button"
                          size="sm"
                          variant={field.value === opt ? "default" : "outline"}
                          className={cn("w-16", field.value === opt && opt === "no" && "bg-slate-700 hover:bg-slate-700/90")}
                          onClick={() => {
                            field.onChange(opt);
                            form.clearErrors("answers");
                          }}
                        >
                          {opt === "yes" ? "Ya" : "Tidak"}
                        </Button>
                      ))}
                    </div>
                  )}
                />
              </div>
            );
          })}
          {answersError && <p className="pt-2 text-xs font-medium text-destructive">{answersError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Pemeriksaan fisik & Hb</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vitals.map((f) => {
              const raw = values[f.key];
              const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw.replace(",", ".")) : undefined;
              const warn = rangeWarning(f.key, n, config.ranges);
              const err = (errors as Record<string, { message?: string } | undefined>)[f.key]?.message;
              return (
                <Field key={f.key} label={`${f.label} (${f.unit})`} htmlFor={f.key} required error={err}>
                  <Input
                    id={f.key}
                    inputMode="decimal"
                    className={cn(warn && "border-amber-400 bg-amber-50")}
                    {...form.register(f.key as "weight_kg")}
                  />
                  {warn && !err && (
                    <p className="flex items-center gap-1 text-xs font-medium text-amber-700">
                      <AlertTriangle className="size-3" />
                      {warn}
                    </p>
                  )}
                </Field>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Rentang acuan adalah nilai contoh dari konfigurasi dan hanya sebagai peringatan; keputusan tetap oleh petugas.
          </p>
        </CardContent>
      </Card>

      {(warnings.length > 0 || riskyAnswers.length > 0) && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertTriangle />
          <AlertTitle>Perhatian sebelum memutuskan</AlertTitle>
          <AlertDescription className="text-amber-800">
            <ul className="list-disc pl-4">
              {riskyAnswers.map((q) => (
                <li key={q.code}>Kuesioner: {q.question}</li>
              ))}
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">3. Keputusan petugas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            control={form.control}
            name="decision"
            render={({ field }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["ELIGIBLE", "Layak donor", CheckCircle2, "border-emerald-500 bg-emerald-50 text-emerald-900"],
                    ["DEFERRED", "Tunda", XCircle, "border-amber-500 bg-amber-50 text-amber-900"],
                  ] as const
                ).map(([value, label, Icon, active]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                      field.value === value ? active : "border-border hover:border-foreground/30",
                    )}
                  >
                    <Icon className="size-6" />
                    <span className="font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.decision && <p className="text-xs font-medium text-destructive">{errors.decision.message}</p>}

          {values.decision === "DEFERRED" && (
            <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
              <Field label="Jenis penundaan" required error={errors.deferral_type?.message}>
                <Controller
                  control={form.control}
                  name="deferral_type"
                  render={({ field }) => (
                    <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6 pt-1">
                      <Label className="flex items-center gap-2 font-normal">
                        <RadioGroupItem value="TEMPORARY" /> Sementara
                      </Label>
                      <Label className="flex items-center gap-2 font-normal">
                        <RadioGroupItem value="PERMANENT" /> Permanen
                      </Label>
                    </RadioGroup>
                  )}
                />
              </Field>
              {values.deferral_type === "TEMPORARY" && (
                <Field label="Ditunda sampai" htmlFor="deferral_until" required error={errors.deferral_until?.message}>
                  <Input id="deferral_until" type="date" min={todayWIB()} {...form.register("deferral_until")} />
                </Field>
              )}
              <Field label="Alasan penundaan" htmlFor="deferral_reason" required error={errors.deferral_reason?.message} className="sm:col-span-2">
                <Input id="deferral_reason" placeholder="mis. Hb di bawah batas" {...form.register("deferral_reason")} />
              </Field>
            </div>
          )}
          <Field label="Catatan" htmlFor="decision_note" error={errors.decision_note?.message}>
            <Textarea id="decision_note" rows={2} {...form.register("decision_note")} />
          </Field>
          {submit.error && <ErrorAlert error={submit.error} />}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={submit.isPending}>
              {submit.isPending && <Loader2 className="animate-spin" />}
              Simpan keputusan
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function ScreeningSummary({ visit: v }: { visit: Visit }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hasil skrining</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <KeyValue
            items={[
              ["Keputusan", <StatusBadge key="s" map={visitStatus} value={v.status} />],
              ["Diskrining", `${fmtDateTime(v.screened_at)} oleh ${v.screened_by_name ?? "—"}`],
              ["Tanda vital", v.hb_g_dl !== null ? `BB ${v.weight_kg} kg · TD ${v.systolic}/${v.diastolic} · Nadi ${v.pulse} · Suhu ${v.temperature_c} °C` : "—"],
              ["Hb", v.hb_g_dl !== null ? `${v.hb_g_dl} g/dL` : "—"],
              ...(v.deferral_reason
                ? ([
                    ["Penundaan", v.deferral_type === "PERMANENT" ? "Permanen" : `Sementara s.d. ${fmtCivilDate(v.deferral_until)}`],
                    ["Alasan", v.deferral_reason],
                  ] as [string, string][])
                : []),
              ["Catatan", v.decision_note ?? "—"],
            ]}
          />
          {v.questionnaire && (
            <ul className="divide-y rounded-md border text-sm">
              {v.questionnaire.map((a) => (
                <li key={a.code} className="flex justify-between gap-4 px-3 py-1.5">
                  <span>{a.question}</span>
                  <span className="font-medium">{a.answer ? "Ya" : "Tidak"}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      {v.status === "ELIGIBLE" && (
        <Button asChild size="lg">
          <Link href="/utd/collection">
            <Syringe />
            Lanjut ke pengambilan darah
          </Link>
        </Button>
      )}
    </div>
  );
}
