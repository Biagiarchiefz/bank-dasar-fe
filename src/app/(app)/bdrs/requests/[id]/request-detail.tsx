"use client";

import { useQuery } from "@tanstack/react-query";
import { Ban, BadgeCheck, Check } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Field, KeyValue } from "@/components/shared/field";
import { PageSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import { ageFrom, fmtDateTime, genderLabel, priority, requestStatus } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/lib/session";
import type { RequestDetail } from "@/lib/types";
import { useApiMutation } from "@/lib/use-api-mutation";
import { cn } from "@/lib/utils";
import { IssueTab } from "./issue-tab";
import { requestInvalidations } from "./invalidations";
import { MatchingTab } from "./matching-tab";
import { SamplesTab } from "./samples-tab";

const steps = [
  { key: "verify", label: "Verifikasi" },
  { key: "sample", label: "Sampel" },
  { key: "match", label: "Crossmatch / Alokasi" },
  { key: "issue", label: "Serah terima" },
];

function currentStep(r: RequestDetail): number {
  switch (r.status) {
    case "NEW":
      return 0;
    case "VERIFIED":
      return 1;
    case "IN_PROGRESS":
      return r.recipient_group ? 2 : 1;
    case "READY":
      return 3;
    default:
      return 4;
  }
}

export function RequestDetailView() {
  const { id } = useParams<{ id: string }>();
  const requestId = Number(id);
  const { me } = useSession();
  const canProcess = me.role === "ADMIN" || me.role === "PETUGAS_BDRS";
  const [reason, setReason] = useState("");
  const { data: r, isLoading, error } = useQuery({
    queryKey: qk.request(requestId),
    queryFn: () => apiGet<RequestDetail>(`/api/v1/bdrs/requests/${requestId}`),
  });
  const [tab, setTab] = useState<string | null>(null);

  const verify = useApiMutation({
    mutationFn: () => apiPost<RequestDetail>(`/api/v1/bdrs/requests/${requestId}/verify`),
    success: "Permintaan diverifikasi. Lanjutkan dengan penerimaan sampel.",
    invalidate: requestInvalidations,
    onSuccess: () => setTab("sample"),
  });
  const cancel = useApiMutation({
    mutationFn: () => apiPost<RequestDetail>(`/api/v1/bdrs/requests/${requestId}/cancel`, { reason }),
    success: "Permintaan dibatalkan. Kantong yang dialokasikan kembali ke stok.",
    invalidate: requestInvalidations,
  });

  if (isLoading) return <PageSkeleton />;
  if (!r) return <ErrorAlert error={error} />;

  const step = currentStep(r);
  const activeTab = tab ?? (step >= 3 ? "issue" : step === 2 ? "match" : "sample");
  const cancellable = ["NEW", "VERIFIED", "IN_PROGRESS", "READY"].includes(r.status);

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{r.request_no}</span>}
        description={`Dibuat ${fmtDateTime(r.created_at)} oleh ${r.created_by_name ?? "—"}`}
        back={{ href: "/bdrs/requests", label: "Permintaan darah" }}
        actions={
          <>
            <StatusBadge map={priority} value={r.priority} />
            <StatusBadge map={requestStatus} value={r.status} />
            {canProcess && cancellable && (
              <ConfirmDialog
                title={`Batalkan ${r.request_no}?`}
                description="Alokasi aktif akan dibatalkan dan kantong kembali ke stok."
                confirmLabel="Batalkan permintaan"
                destructive
                disabled={reason.trim().length < 3}
                onConfirm={() => cancel.mutate()}
                trigger={
                  <Button variant="outline" className="text-destructive">
                    <Ban />
                    Batalkan
                  </Button>
                }
              >
                <Field label="Alasan pembatalan" required>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
                </Field>
              </ConfirmDialog>
            )}
          </>
        }
      />

      <Card className="mb-6">
        <CardContent className="grid gap-6 md:grid-cols-[auto_1fr_1fr]">
          <BloodGroupChip abo={r.patient.abo} rh={r.patient.rh} size="xl" />
          <KeyValue
            items={[
              ["Pasien", <span key="p" className="font-semibold">{r.patient.full_name}</span>],
              ["No. RM", <span key="m" className="font-mono">{r.patient.mrn}</span>],
              ["Umur / JK", `${ageFrom(r.patient.birth_date)} th · ${genderLabel[r.patient.gender]}`],
              ["Ruangan", r.ward],
            ]}
          />
          <KeyValue
            items={[
              ["DPJP", r.doctor_name],
              ["Diagnosis", r.diagnosis ?? "—"],
              ["Indikasi", r.indication ?? "—"],
              ["Dibutuhkan", r.needed_at ? fmtDateTime(r.needed_at) : "—"],
            ]}
          />
        </CardContent>
      </Card>

      {r.status === "CANCELLED" ? (
        <ErrorAlert error={new Error(`Permintaan dibatalkan: ${r.cancel_reason ?? "—"}`)} />
      ) : (
        <ol className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.key}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                i < step ? "border-emerald-200 bg-emerald-50 text-emerald-900" : i === step ? "border-primary/40 bg-primary/5 font-semibold" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                  i < step ? "bg-emerald-600 text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              {s.label}
            </li>
          ))}
        </ol>
      )}

      {r.status === "NEW" && (
        <Card className="mb-6 border-primary/30">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Verifikasi permintaan</p>
              <p className="text-sm text-muted-foreground">
                Periksa identitas pasien, instruksi dokter, dan komponen yang diminta.
              </p>
            </div>
            {canProcess ? (
              <ConfirmDialog
                title={`Verifikasi ${r.request_no}?`}
                description={`${r.patient.full_name} (${r.patient.mrn}) — ${r.items_summary}.`}
                confirmLabel="Verifikasi"
                onConfirm={() => verify.mutate()}
                trigger={
                  <Button disabled={verify.isPending}>
                    <BadgeCheck />
                    Verifikasi
                  </Button>
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">Menunggu verifikasi petugas BDRS.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="sample">Sampel ({r.samples.length})</TabsTrigger>
          <TabsTrigger value="match">Crossmatch & alokasi</TabsTrigger>
          <TabsTrigger value="issue">Serah terima ({r.issues.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="sample" className="mt-4">
          <SamplesTab request={r} canProcess={canProcess} />
        </TabsContent>
        <TabsContent value="match" className="mt-4">
          <MatchingTab request={r} canProcess={canProcess} />
        </TabsContent>
        <TabsContent value="issue" className="mt-4">
          <IssueTab request={r} canProcess={canProcess} />
        </TabsContent>
      </Tabs>
    </>
  );
}
