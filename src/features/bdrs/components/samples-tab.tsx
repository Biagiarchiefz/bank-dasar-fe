"use client";

import { BadgeCheck, FlaskConical, TestTubeDiagonal } from "lucide-react";
import { useState } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Field } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { antibodyLabel, bloodGroup, fmtDateTime, sampleResult, sampleStatus } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ABO, RequestDetail, Rh } from "@/types";
import { useAddSample, useValidateSample } from "../hooks/use-bdrs";

function localNow(offsetMinutes = 0): string {
  const d = new Date(Date.now() - offsetMinutes * 60_000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function SamplesTab({ request: r, canProcess }: { request: RequestDetail; canProcess: boolean }) {
  const canReceive = canProcess && ["VERIFIED", "IN_PROGRESS", "READY"].includes(r.status);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        {r.samples.length === 0 && (
          <Card>
            <EmptyState icon={TestTubeDiagonal} title="Belum ada sampel" description="Terima sampel darah pasien dari ruangan." />
          </Card>
        )}
        {r.samples.map((s) => (
          <SampleCard key={s.id} request={r} sampleId={s.id} canProcess={canProcess} />
        ))}
      </div>
      {canReceive && <ReceiveSampleForm request={r} />}
    </div>
  );
}

function SampleCard({ request: r, sampleId, canProcess }: { request: RequestDetail; sampleId: number; canProcess: boolean }) {
  const s = r.samples.find((x) => x.id === sampleId)!;
  const validate = useValidateSample(s.id);
  const differs = r.patient.abo && s.abo && (r.patient.abo !== s.abo || r.patient.rh !== s.rh);

  return (
    <Card className={cn(s.status === "REJECTED" && "opacity-80")}>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-semibold">{s.sample_no}</span>
          <StatusBadge map={sampleStatus} value={s.status} />
          {s.status === "ACCEPTED" && <StatusBadge map={sampleResult} value={s.result_status} />}
          <span className="ml-auto text-xs text-muted-foreground">Diterima {fmtDateTime(s.received_at)}</span>
        </div>
        {s.status === "ACCEPTED" ? (
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <BloodGroupChip abo={s.abo} rh={s.rh} size="lg" />
            <div>
              <p className="text-muted-foreground">Skrining antibodi</p>
              <p className="font-medium">{antibodyLabel[s.antibody_screen]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Diambil</p>
              <p className="font-medium">{fmtDateTime(s.collected_at)}</p>
            </div>
            {s.validated_at && (
              <div>
                <p className="text-muted-foreground">Divalidasi</p>
                <p className="font-medium">
                  {fmtDateTime(s.validated_at)} · {s.validated_by_name}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-700">Ditolak: {s.reject_reason}</p>
        )}
        {differs && s.result_status === "PENDING" && (
          <p className="text-sm font-medium text-red-700">
            Perhatian: berbeda dengan riwayat golongan pasien ({bloodGroup(r.patient.abo, r.patient.rh)}).
          </p>
        )}
        {validate.error && (
          <ErrorAlert
            error={validate.error}
            title={validate.error.code === "BLOOD_GROUP_DISCREPANCY" ? "Golongan darah tidak konsisten" : undefined}
          />
        )}
        {canProcess && s.status === "ACCEPTED" && s.result_status === "PENDING" && (
          <ConfirmDialog
            title={`Validasi golongan ${bloodGroup(s.abo, s.rh)} untuk ${r.patient.full_name}?`}
            description="Golongan darah tervalidasi digunakan untuk memilih kantong yang kompatibel."
            confirmLabel="Validasi"
            onConfirm={() => validate.mutate()}
            trigger={
              <Button size="sm" disabled={validate.isPending}>
                <BadgeCheck />
                Validasi hasil
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

function ReceiveSampleForm({ request: r }: { request: RequestDetail }) {
  const [status, setStatus] = useState<"ACCEPTED" | "REJECTED">("ACCEPTED");
  const [collectedAt, setCollectedAt] = useState(localNow(15));
  const [abo, setAbo] = useState<ABO | "">("");
  const [rh, setRh] = useState<Rh | "">("");
  const [antibody, setAntibody] = useState("NEGATIVE");
  const [rejectReason, setRejectReason] = useState("");

  const add = useAddSample(r.id, () => {
    setAbo("");
    setRh("");
    setRejectReason("");
  });

  function submit() {
    add.mutate({
      collected_at: new Date(collectedAt).toISOString(),
      status,
      ...(status === "ACCEPTED" ? { abo: abo || undefined, rh: rh || undefined, antibody_screen: antibody } : { reject_reason: rejectReason }),
    });
  }

  const valid = status === "ACCEPTED" ? abo !== "" && rh !== "" : rejectReason.trim().length >= 3;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="size-4" />
          Terima sampel pasien
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(["ACCEPTED", "REJECTED"] as const).map((v) => (
            <Button key={v} type="button" variant={status === v ? (v === "REJECTED" ? "destructive" : "default") : "outline"} onClick={() => setStatus(v)}>
              {v === "ACCEPTED" ? "Diterima" : "Ditolak"}
            </Button>
          ))}
        </div>
        <Field label="Waktu pengambilan sampel" required>
          <Input type="datetime-local" value={collectedAt} max={localNow()} onChange={(e) => setCollectedAt(e.target.value)} />
        </Field>
        {status === "ACCEPTED" ? (
          <>
            <Field label="Golongan ABO" required>
              <div className="flex gap-1">
                {(["A", "B", "AB", "O"] as const).map((v) => (
                  <Button key={v} type="button" size="sm" className="flex-1" variant={abo === v ? "default" : "outline"} onClick={() => setAbo(v)}>
                    {v}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Rhesus" required>
              <div className="flex gap-1">
                {(["POS", "NEG"] as const).map((v) => (
                  <Button key={v} type="button" size="sm" className="flex-1" variant={rh === v ? "default" : "outline"} onClick={() => setRh(v)}>
                    {v === "POS" ? "Positif (+)" : "Negatif (−)"}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Skrining antibodi" required>
              <Select value={antibody} onValueChange={setAntibody}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEGATIVE">Negatif</SelectItem>
                  <SelectItem value="POSITIVE">Positif</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </>
        ) : (
          <Field label="Alasan penolakan" required>
            <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="mis. Sampel hemolisis" />
          </Field>
        )}
        {add.error && <ErrorAlert error={add.error} />}
        <Button className="w-full" disabled={!valid || add.isPending} onClick={submit}>
          Simpan sampel
        </Button>
      </CardContent>
    </Card>
  );
}
