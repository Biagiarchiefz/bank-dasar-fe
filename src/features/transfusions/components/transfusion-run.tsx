"use client";

import { Activity, CircleStop, Flag, Plus, Siren } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageSkeleton } from "@/components/feedback/loading";
import { Field, KeyValue } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fmtDateTime, fmtDuration, fmtTime, reactionSymptoms, severity, transfusionStatus } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Severity, TransfusionDetail } from "@/types";
import {
  useAddObservation,
  useFinishTransfusion,
  useReportReaction,
  useTransfusion,
} from "../hooks/use-transfusions";
import type { Vitals } from "../services/transfusions.service";

const labels = ["15 menit", "30 menit", "1 jam", "2 jam", "3 jam", "Selesai"];
type VitalsForm = { temperature_c: string; systolic: string; diastolic: string; pulse: string; resp_rate: string };
const emptyVitals: VitalsForm = { temperature_c: "", systolic: "", diastolic: "", pulse: "", resp_rate: "" };
const toNumbers = (v: VitalsForm) =>
  Object.fromEntries(Object.entries(v).map(([k, x]) => [k, Number(x.replace(",", "."))])) as Vitals;

/** Re-renders every 30 s so the running timer stays current. */
function useTick(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [active]);
}

export function TransfusionRun() {
  const { id } = useParams<{ id: string }>();
  const tid = Number(id);
  const { data: t, isLoading, error } = useTransfusion(tid);
  const running = t?.status === "IN_PROGRESS";
  useTick(running);
  const [dialog, setDialog] = useState<"obs" | "finish" | "reaction" | null>(null);

  if (isLoading) return <PageSkeleton />;
  if (!t) return <ErrorAlert error={error} />;

  return (
    <>
      <PageHeader
        title={t.patient_name}
        description={`${t.patient_mrn} · ${t.ward} · permintaan ${t.request_no}`}
        back={{ href: "/transfusions", label: "Transfusi" }}
        actions={<StatusBadge map={transfusionStatus} value={t.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className={cn(running && "border-sky-300")}>
            <CardContent className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">{running ? "Lama transfusi" : "Durasi"}</p>
                <p className="text-4xl font-bold tabular-nums">{fmtDuration(t.started_at, t.ended_at)}</p>
                <p className="text-sm text-muted-foreground">Mulai {fmtDateTime(t.started_at)}</p>
              </div>
              {running && (
                <div className="ml-auto flex flex-wrap gap-3">
                  <Button size="lg" variant="outline" className="h-14 text-base" onClick={() => setDialog("obs")}>
                    <Plus />
                    Observasi
                  </Button>
                  <Button size="lg" className="h-14 bg-red-700 text-base hover:bg-red-800" onClick={() => setDialog("reaction")}>
                    <Siren />
                    Lapor reaksi
                  </Button>
                  <Button size="lg" variant="secondary" className="h-14 text-base" onClick={() => setDialog("finish")}>
                    <Flag />
                    Selesai / Hentikan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {t.reactions.length > 0 && (
            <Card className="border-red-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-800">
                  <Siren className="size-4" /> Reaksi transfusi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.reactions.map((r) => (
                  <div key={r.id} className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge map={severity} value={r.severity} />
                      <span className="font-medium">{r.symptoms.join(", ")}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {fmtDateTime(r.reported_at)} · {r.reported_by_name}
                      </span>
                    </div>
                    {r.action_taken && <p className="mt-1">Tindakan: {r.action_taken}</p>}
                    {r.outcome && <p>Hasil: {r.outcome}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="size-4" /> Observasi tanda vital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Suhu</TableHead>
                    <TableHead>TD</TableHead>
                    <TableHead>Nadi</TableHead>
                    <TableHead>Napas</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {t.observations.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="tabular-nums">{fmtTime(o.observed_at)}</TableCell>
                      <TableCell className="font-medium">{o.label}</TableCell>
                      <TableCell className={cn(o.temperature_c !== null && o.temperature_c >= 38 && "font-bold text-red-700")}>
                        {o.temperature_c ?? "—"} °C
                      </TableCell>
                      <TableCell>
                        {o.systolic}/{o.diastolic}
                      </TableCell>
                      <TableCell>{o.pulse}</TableCell>
                      <TableCell>{o.resp_rate}</TableCell>
                      <TableCell className="text-muted-foreground">{o.notes ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kantong & pasien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <BloodGroupChip abo={t.product_abo} rh={t.product_rh} size="lg" />
                <div>
                  <p className="font-mono font-semibold">{t.product_no}</p>
                  <p className="text-sm text-muted-foreground">{t.component_name}</p>
                </div>
              </div>
              <KeyValue
                items={[
                  ["Golongan pasien", <BloodGroupChip key="p" abo={t.patient_abo} rh={t.patient_rh} size="sm" />],
                  ["Verifikator 2", t.second_verifier_name],
                  ["Dimulai oleh", t.started_by_name ?? "—"],
                  ["Selesai", t.ended_at ? fmtDateTime(t.ended_at) : "—"],
                  ["Volume diberikan", t.volume_given_ml !== null ? `${t.volume_given_ml} mL` : "—"],
                  ...(t.stop_reason ? ([["Alasan berhenti", t.stop_reason]] as [string, string][]) : []),
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checklist bedside</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {t.bedside_check.map((b) => (
                  <li key={b.key} className="flex gap-2">
                    <span className={b.checked ? "text-emerald-600" : "text-red-600"}>{b.checked ? "✓" : "✗"}</span>
                    {b.label}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {dialog === "obs" && <ObservationDialog id={tid} onClose={() => setDialog(null)} />}
      {dialog === "finish" && <FinishDialog t={t} onClose={() => setDialog(null)} />}
      {dialog === "reaction" && <ReactionDialog t={t} onClose={() => setDialog(null)} />}
    </>
  );
}

function VitalsFields({ value, onChange }: { value: VitalsForm; onChange: (v: VitalsForm) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {(
        [
          ["temperature_c", "Suhu °C"],
          ["systolic", "Sistolik"],
          ["diastolic", "Diastolik"],
          ["pulse", "Nadi"],
          ["resp_rate", "Napas"],
        ] as const
      ).map(([k, l]) => (
        <Field key={k} label={l} required>
          <Input inputMode="decimal" className="h-11" value={value[k]} onChange={(e) => onChange({ ...value, [k]: e.target.value })} />
        </Field>
      ))}
    </div>
  );
}

function ObservationDialog({ id, onClose }: { id: number; onClose: () => void }) {
  const [label, setLabel] = useState(labels[0]);
  const [vitals, setVitals] = useState<VitalsForm>(emptyVitals);
  const [notes, setNotes] = useState("");
  const save = useAddObservation(id, onClose);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah observasi</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {labels.map((l) => (
            <Button key={l} type="button" variant={label === l ? "default" : "outline"} onClick={() => setLabel(l)}>
              {l}
            </Button>
          ))}
        </div>
        <VitalsFields value={vitals} onChange={setVitals} />
        <Field label="Catatan / keluhan">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {save.error && <ErrorAlert error={save.error} />}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={Object.values(vitals).some((v) => !v.trim()) || save.isPending} onClick={() => save.mutate({ label, ...toNumbers(vitals), notes: notes || null })}>
            Simpan observasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FinishDialog({ t, onClose }: { t: TransfusionDetail; onClose: () => void }) {
  const [status, setStatus] = useState<"COMPLETED" | "STOPPED">("COMPLETED");
  const [volume, setVolume] = useState(String(t.product_volume_ml ?? ""));
  const [reason, setReason] = useState("");
  const finish = useFinishTransfusion(t.id, onClose);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Akhiri transfusi</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" className="h-12" variant={status === "COMPLETED" ? "default" : "outline"} onClick={() => setStatus("COMPLETED")}>
            <Flag /> Selesai
          </Button>
          <Button type="button" className="h-12" variant={status === "STOPPED" ? "destructive" : "outline"} onClick={() => setStatus("STOPPED")}>
            <CircleStop /> Hentikan
          </Button>
        </div>
        <Field label="Volume yang diberikan (mL)" required>
          <Input inputMode="numeric" className="h-11" value={volume} onChange={(e) => setVolume(e.target.value)} />
        </Field>
        {status === "STOPPED" && (
          <Field label="Alasan penghentian" required>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        )}
        {finish.error && <ErrorAlert error={finish.error} />}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={volume.trim() === "" || (status === "STOPPED" && reason.trim().length < 3) || finish.isPending}
            onClick={() =>
              finish.mutate({ status, volume_given_ml: Number(volume), stop_reason: status === "STOPPED" ? reason : null })
            }
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReactionDialog({ t, onClose }: { t: TransfusionDetail; onClose: () => void }) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sev, setSev] = useState<Severity>("MILD");
  const [action, setAction] = useState("");
  const [outcome, setOutcome] = useState("");
  const [stop, setStop] = useState(false);
  const [volume, setVolume] = useState("");
  const report = useReportReaction(t.id, onClose);

  function submit() {
    report.mutate({
      symptoms,
      severity: sev,
      action_taken: action || null,
      outcome: outcome || null,
      stop_transfusion: stop,
      volume_given_ml: stop && volume ? Number(volume) : null,
    });
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-800">
            <Siren className="size-5" /> Laporkan dugaan reaksi transfusi
          </DialogTitle>
        </DialogHeader>
        <Field label="Gejala (pilih semua yang sesuai)" required>
          <div className="grid gap-2 sm:grid-cols-3">
            {reactionSymptoms.map((s) => (
              <Label key={s} className="flex min-h-11 items-center gap-2 rounded-md border px-3 font-normal">
                <Checkbox
                  checked={symptoms.includes(s)}
                  onCheckedChange={(c) => setSymptoms((prev) => (c === true ? [...prev, s] : prev.filter((x) => x !== s)))}
                />
                {s}
              </Label>
            ))}
          </div>
        </Field>
        <Field label="Tingkat keparahan" required>
          <div className="grid grid-cols-3 gap-2">
            {(["MILD", "MODERATE", "SEVERE"] as const).map((s) => (
              <Button key={s} type="button" className="h-11" variant={sev === s ? (s === "MILD" ? "default" : "destructive") : "outline"} onClick={() => setSev(s)}>
                {severity[s].label}
              </Button>
            ))}
          </div>
        </Field>
        <Field label="Tindakan yang dilakukan">
          <Textarea rows={2} value={action} onChange={(e) => setAction(e.target.value)} />
        </Field>
        <Field label="Hasil / kondisi pasien">
          <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} />
        </Field>
        {t.status === "IN_PROGRESS" && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <Label className="flex items-center gap-2 font-semibold text-red-800">
              <Checkbox checked={stop} onCheckedChange={(c) => setStop(c === true)} />
              Hentikan transfusi sekarang
            </Label>
            {stop && (
              <Field label="Volume yang sudah diberikan (mL)" className="mt-2">
                <Input inputMode="numeric" value={volume} onChange={(e) => setVolume(e.target.value)} />
              </Field>
            )}
          </div>
        )}
        {report.error && <ErrorAlert error={report.error} />}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button className="bg-red-700 hover:bg-red-800" disabled={symptoms.length === 0 || report.isPending} onClick={submit}>
            Laporkan reaksi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
