"use client";

import { Check, CheckCircle2, OctagonAlert, Play, RotateCcw, ScanLine } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageSkeleton } from "@/components/feedback/loading";
import { BarcodeInput } from "@/components/forms/barcode-input";
import { Field } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { fmtCountdown, fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api-client";
import { useIssueItem, useStartTransfusion, useVerifyIdentity } from "../hooks/use-transfusions";
import type { Vitals as VitalNumbers } from "../services/transfusions.service";

const bedsideItems = [
  { key: "PATIENT_ID_MATCH", label: "Identitas pasien sesuai (nama, tanggal lahir, nomor RM)" },
  { key: "PRODUCT_LABEL_MATCH", label: "Label kantong sesuai dengan formulir serah terima" },
  { key: "BLOOD_GROUP_MATCH", label: "Golongan darah kantong sesuai dengan pasien" },
  { key: "NOT_EXPIRED", label: "Kantong belum kedaluwarsa" },
  { key: "BAG_INTACT", label: "Kantong utuh, tidak bocor, tidak ada gumpalan/perubahan warna" },
  { key: "CONSENT_SIGNED", label: "Persetujuan tindakan transfusi sudah ditandatangani" },
];

const steps = ["Pindai kantong", "Pindai gelang pasien", "Checklist bedside", "Verifikator & tanda vital"];

type Vitals = { temperature_c: string; systolic: string; diastolic: string; pulse: string; resp_rate: string };

export function StartWizard() {
  const { issueItemId } = useParams<{ issueItemId: string }>();
  const id = Number(issueItemId);
  const router = useRouter();
  const { data: entry, isLoading, error } = useIssueItem(id);

  const [step, setStep] = useState(0);
  const [bagNo, setBagNo] = useState("");
  const [mismatch, setMismatch] = useState<ApiError | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [verifier, setVerifier] = useState("");
  const [vitals, setVitals] = useState<Vitals>({ temperature_c: "", systolic: "", diastolic: "", pulse: "", resp_rate: "" });
  const [mrn, setMrn] = useState("");

  const verify = useVerifyIdentity(() => {
    setMismatch(null);
    setStep(2);
  });
  const start = useStartTransfusion((t) => router.replace(`/transfusions/${t.id}`));

  function startTransfusion() {
    start.mutate({
      issue_item_id: id,
      scanned_product_no: bagNo,
      scanned_patient_mrn: mrn,
      bedside_check: checks,
      second_verifier_name: verifier,
      pre_vitals: Object.fromEntries(
        Object.entries(vitals).map(([k, v]) => [k, Number(v.replace(",", "."))]),
      ) as VitalNumbers,
    });
  }

  if (isLoading) return <PageSkeleton />;
  if (!entry) return <ErrorAlert error={error} />;

  function scanBag(code: string) {
    setBagNo(code);
    setMismatch(null);
    setStep(1);
  }

  async function scanPatient(code: string) {
    setMrn(code);
    try {
      await verify.mutateAsync({ issue_item_id: id, scanned_product_no: bagNo, scanned_patient_mrn: code });
    } catch (err) {
      if (err instanceof ApiError && err.code === "IDENTITY_MISMATCH") setMismatch(err);
    }
  }

  function restart() {
    setBagNo("");
    setMrn("");
    setMismatch(null);
    setStep(0);
  }

  const allChecked = bedsideItems.every((b) => checks[b.key]);
  const vitalsFilled = Object.values(vitals).every((v) => v.trim() !== "");

  return (
    <>
      <PageHeader
        title="Mulai transfusi"
        description="Verifikasi di samping tempat tidur pasien. Semua langkah wajib dilakukan berurutan."
        back={{ href: "/transfusions", label: "Transfusi" }}
      />

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <BloodGroupChip abo={entry.patient_abo} rh={entry.patient_rh} size="xl" />
            <div>
              <p className="text-xl font-bold">{entry.patient_name}</p>
              <p className="font-mono text-muted-foreground">{entry.patient_mrn}</p>
              <p className="text-sm text-muted-foreground">{entry.ward}</p>
            </div>
          </div>
          <div className="ml-auto text-right text-sm">
            <p className="text-muted-foreground">Kantong yang diserahkan</p>
            <p className="font-mono text-lg font-semibold">{entry.product_no}</p>
            <p className="text-muted-foreground">
              {entry.component_code} · diserahkan {fmtDateTime(entry.issued_at)} · kedaluwarsa {fmtCountdown(entry.expires_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      <ol className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-3 text-sm",
              i < step ? "border-emerald-200 bg-emerald-50" : i === step ? "border-primary/40 bg-primary/5 font-semibold" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-sm font-bold",
                i < step ? "bg-emerald-600 text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      {mismatch && (
        <div
          role="alert"
          className="mb-6 animate-in fade-in zoom-in-95 rounded-xl border-4 border-red-600 bg-red-600 p-6 text-white shadow-lg"
        >
          <div className="flex items-start gap-4">
            <OctagonAlert className="size-14 shrink-0" />
            <div className="space-y-2">
              <p className="text-2xl font-extrabold tracking-tight">{mismatch.message}</p>
              <ul className="list-disc space-y-1 pl-5 text-lg">
                {mismatch.details?.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="text-red-100">Kejadian ini tercatat di log audit. Periksa kembali kantong dan identitas pasien.</p>
              <Button size="lg" variant="secondary" className="mt-2 h-12 text-base" onClick={restart}>
                <RotateCcw />
                Pindai ulang
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="py-6">
          {step === 0 && (
            <ScanStep
              title="Pindai barcode pada kantong darah"
              hint="Gunakan pemindai atau ketik nomor kantong lalu tekan Enter."
              onScan={scanBag}
            />
          )}
          {step === 1 && !mismatch && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="size-5" /> Kantong dipindai: <span className="font-mono font-semibold">{bagNo}</span>
              </p>
              <ScanStep
                title="Pindai gelang identitas pasien (nomor RM)"
                hint="Sistem mencocokkan kantong dan pasien dengan data serah terima."
                placeholder="Pindai atau ketik nomor RM…"
                onScan={scanPatient}
                busy={verify.isPending}
              />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 font-medium text-emerald-700">
                <CheckCircle2 className="size-5" /> Identitas kantong dan pasien cocok.
              </p>
              <h3 className="text-lg font-semibold">Checklist bedside</h3>
              <div className="space-y-2">
                {bedsideItems.map((b) => (
                  <label
                    key={b.key}
                    className={cn(
                      "flex min-h-14 cursor-pointer items-center gap-4 rounded-lg border-2 px-4 py-3 text-base transition-colors",
                      checks[b.key] ? "border-emerald-500 bg-emerald-50" : "hover:border-foreground/30",
                    )}
                  >
                    <Checkbox
                      className="size-6"
                      checked={!!checks[b.key]}
                      onCheckedChange={(c) => setChecks((prev) => ({ ...prev, [b.key]: c === true }))}
                    />
                    {b.label}
                  </label>
                ))}
              </div>
              <Button size="lg" className="h-12 w-full text-base" disabled={!allChecked} onClick={() => setStep(3)}>
                Lanjut
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <Field label="Nama petugas verifikator kedua" required>
                <Input className="h-12 text-base" value={verifier} onChange={(e) => setVerifier(e.target.value)} autoFocus />
              </Field>
              <div>
                <h3 className="mb-2 font-semibold">Tanda vital pra-transfusi</h3>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {(
                    [
                      ["temperature_c", "Suhu (°C)"],
                      ["systolic", "Sistolik"],
                      ["diastolic", "Diastolik"],
                      ["pulse", "Nadi"],
                      ["resp_rate", "Napas (x/mnt)"],
                    ] as const
                  ).map(([k, l]) => (
                    <Field key={k} label={l} required>
                      <Input
                        className="h-12 text-base"
                        inputMode="decimal"
                        value={vitals[k]}
                        onChange={(e) => setVitals((v) => ({ ...v, [k]: e.target.value }))}
                      />
                    </Field>
                  ))}
                </div>
              </div>
              {start.error && start.error.code !== "IDENTITY_MISMATCH" && <ErrorAlert error={start.error} />}
              <Button
                size="lg"
                className="h-14 w-full text-lg"
                disabled={verifier.trim().length < 3 || !vitalsFilled || start.isPending}
                onClick={startTransfusion}
              >
                <Play />
                Mulai transfusi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function ScanStep({
  title,
  hint,
  placeholder,
  onScan,
  busy,
}: {
  title: string;
  hint: string;
  placeholder?: string;
  onScan: (v: string) => void;
  busy?: boolean;
}) {
  return (
    <Card className="border-dashed shadow-none">
      <CardHeader className="text-center">
        <ScanLine className="mx-auto size-10 text-primary" />
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardHeader>
      <CardContent>
        <BarcodeInput size="lg" onScan={onScan} placeholder={placeholder} buttonLabel="Cocokkan" disabled={busy} />
      </CardContent>
    </Card>
  );
}
