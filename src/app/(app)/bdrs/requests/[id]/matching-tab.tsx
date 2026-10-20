"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BadgeCheck, FlaskRound, Link2, Undo2 } from "lucide-react";
import { useState } from "react";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Field } from "@/components/shared/field";
import { RowsSkeleton } from "@/components/shared/loading";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import {
  allocationStatus,
  bloodGroup,
  compatLevel,
  componentLabel,
  crossmatchResult,
  fmtCountdown,
  fmtDateTime,
} from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { Candidate, RequestDetail, RequestItem } from "@/lib/types";
import { useApiMutation } from "@/lib/use-api-mutation";
import { cn } from "@/lib/utils";
import { requestInvalidations } from "./invalidations";

export function MatchingTab({ request: r, canProcess }: { request: RequestDetail; canProcess: boolean }) {
  if (!r.recipient_group) {
    return (
      <Card>
        <EmptyState
          icon={FlaskRound}
          title="Golongan darah pasien belum tervalidasi"
          description="Terima dan validasi sampel pasien terlebih dahulu untuk melihat kantong yang kompatibel."
        />
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Golongan pasien tervalidasi: <b className="text-foreground">{bloodGroup(r.recipient_group.abo, r.recipient_group.rh)}</b> (sampel{" "}
        <span className="font-mono">{r.recipient_group.sample_no}</span>). Kandidat diurutkan: identik dulu, lalu yang paling cepat
        kedaluwarsa (FEFO). Kecocokan akhir sel darah merah ditentukan hasil crossmatch.
      </p>
      {r.items.map((it) => (
        <ItemCard key={it.id} request={r} item={it} canProcess={canProcess} />
      ))}
    </div>
  );
}

function ItemCard({ request: r, item, canProcess }: { request: RequestDetail; item: RequestItem; canProcess: boolean }) {
  const used = item.allocated + item.issued;
  const done = used >= item.quantity;
  const active = ["IN_PROGRESS", "READY"].includes(r.status);
  const allocations = r.allocations.filter((a) => a.request_item_id === item.id);
  const crossmatches = r.crossmatches.filter((x) => x.request_item_id === item.id);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">
            {item.component_code} — {componentLabel[item.component_code]}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {item.requires_crossmatch ? "Wajib crossmatch sebelum alokasi" : "Alokasi langsung dengan cek kompatibilitas"}
          </p>
        </div>
        <div className="w-48">
          <p className="text-right text-sm font-semibold tabular-nums">
            {used}/{item.quantity} kantong teralokasi
          </p>
          <Progress value={(used / item.quantity) * 100} className="mt-1 h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {allocations.length > 0 && <Allocations request={r} allocations={allocations} canProcess={canProcess} />}
        {crossmatches.some((x) => !x.validated_at) && (
          <PendingCrossmatches request={r} crossmatches={crossmatches.filter((x) => !x.validated_at)} canProcess={canProcess} />
        )}
        {canProcess && active && !done && <Candidates request={r} item={item} />}
        {done && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Jumlah kantong untuk komponen ini sudah terpenuhi.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Allocations({
  request: r,
  allocations,
  canProcess,
}: {
  request: RequestDetail;
  allocations: RequestDetail["allocations"];
  canProcess: boolean;
}) {
  const [reason, setReason] = useState("");
  const cancel = useApiMutation({
    mutationFn: (id: number) => apiPost<RequestDetail>(`/api/v1/bdrs/allocations/${id}/cancel`, { reason }),
    success: "Alokasi dibatalkan. Kantong kembali ke stok.",
    invalidate: requestInvalidations,
    onSuccess: () => setReason(""),
  });
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kantong teralokasi</p>
      <ul className="space-y-2">
        {allocations.map((a) => {
          const xm = r.crossmatches.find((x) => x.id === a.crossmatch_id);
          return (
            <li key={a.id} className={cn("flex flex-wrap items-center gap-3 rounded-md border p-2 text-sm", a.status === "CANCELLED" && "opacity-60")}>
              <span className="font-mono font-semibold">{a.product.product_no}</span>
              <BloodGroupChip abo={a.product.abo} rh={a.product.rh} size="sm" />
              <StatusBadge map={allocationStatus} value={a.status} />
              {xm && <StatusBadge map={crossmatchResult} value={xm.result} />}
              <span className="text-xs text-muted-foreground">
                {fmtDateTime(a.allocated_at)} · {a.allocated_by_name}
              </span>
              {a.cancel_reason && <span className="text-xs text-muted-foreground">({a.cancel_reason})</span>}
              {canProcess && a.status === "ACTIVE" && (
                <ConfirmDialog
                  title={`Batalkan alokasi ${a.product.product_no}?`}
                  description="Kantong akan kembali ke stok siap pakai."
                  confirmLabel="Batalkan alokasi"
                  destructive
                  disabled={reason.trim().length < 3}
                  onConfirm={() => cancel.mutate(a.id)}
                  trigger={
                    <Button size="xs" variant="ghost" className="ml-auto text-destructive">
                      <Undo2 />
                      Batalkan
                    </Button>
                  }
                >
                  <Field label="Alasan" required>
                    <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                  </Field>
                </ConfirmDialog>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PendingCrossmatches({
  crossmatches,
  canProcess,
}: {
  request: RequestDetail;
  crossmatches: RequestDetail["crossmatches"];
  canProcess: boolean;
}) {
  const validate = useApiMutation({
    mutationFn: (id: number) => apiPost<RequestDetail>(`/api/v1/bdrs/crossmatches/${id}/validate`),
    success: "Crossmatch divalidasi.",
    invalidate: requestInvalidations,
  });
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Crossmatch menunggu validasi</p>
      <ul className="space-y-2">
        {crossmatches.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center gap-3 rounded-md border border-amber-200 bg-amber-50/50 p-2 text-sm">
            <span className="font-mono font-semibold">{x.product_no}</span>
            <StatusBadge map={crossmatchResult} value={x.result} />
            <span className="text-xs text-muted-foreground">
              {x.method ?? "—"} · {fmtDateTime(x.tested_at)} · {x.tested_by_name}
            </span>
            {canProcess && (
              <Button size="xs" className="ml-auto" disabled={validate.isPending} onClick={() => validate.mutate(x.id)}>
                <BadgeCheck />
                Validasi
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Candidates({ request: r, item }: { request: RequestDetail; item: RequestItem }) {
  const { data, isLoading, error } = useQuery({
    queryKey: qk.candidates(item.id),
    queryFn: () => apiGet<Candidate[]>(`/api/v1/bdrs/request-items/${item.id}/candidates`),
  });
  const [testing, setTesting] = useState<Candidate | null>(null);

  const allocate = useApiMutation({
    mutationFn: (productId: number) =>
      apiPost<RequestDetail>("/api/v1/bdrs/allocations", { request_item_id: item.id, product_id: productId }),
    success: "Kantong dialokasikan untuk pasien.",
    invalidate: [...requestInvalidations, qk.candidates(item.id)],
  });

  if (isLoading) return <RowsSkeleton rows={3} />;
  if (error) return <ErrorAlert error={error} />;
  if (!data || data.length === 0) {
    return (
      <Alert className="border-amber-300 bg-amber-50 text-amber-900">
        <AlertTriangle />
        <AlertTitle>Tidak ada kantong kompatibel yang siap pakai di BDRS</AlertTitle>
        <AlertDescription className="text-amber-800">Hubungi UTD untuk pengiriman stok.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kandidat kantong ({data.length})</p>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kantong</TableHead>
              <TableHead>Golongan</TableHead>
              <TableHead>Kompatibilitas</TableHead>
              <TableHead>Kedaluwarsa</TableHead>
              <TableHead>Crossmatch</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.product.id}>
                <TableCell className="font-mono font-semibold">{c.product.product_no}</TableCell>
                <TableCell>
                  <BloodGroupChip abo={c.product.abo} rh={c.product.rh} size="sm" />
                </TableCell>
                <TableCell>
                  <StatusBadge map={compatLevel} value={c.level} />
                  {c.warnings.map((w) => (
                    <p key={w} className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                      <AlertTriangle className="size-3" />
                      {w}
                    </p>
                  ))}
                </TableCell>
                <TableCell className="text-sm">{fmtCountdown(c.product.expires_at)}</TableCell>
                <TableCell>{c.crossmatch ? <StatusBadge map={crossmatchResult} value={c.crossmatch.result} /> : "—"}</TableCell>
                <TableCell className="text-right">
                  {item.requires_crossmatch ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={c.crossmatch?.result === "INCOMPATIBLE"}
                      onClick={() => setTesting(c)}
                    >
                      Crossmatch
                    </Button>
                  ) : (
                    <ConfirmDialog
                      title={`Alokasikan ${c.product.product_no}?`}
                      description={`Untuk ${r.patient.full_name} (${r.patient.mrn}).`}
                      confirmLabel="Alokasikan"
                      onConfirm={() => allocate.mutate(c.product.id)}
                      trigger={
                        <Button size="sm" disabled={allocate.isPending}>
                          <Link2 />
                          Alokasikan
                        </Button>
                      }
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {testing && <CrossmatchDialog request={r} item={item} candidate={testing} onClose={() => setTesting(null)} />}
    </div>
  );
}

function CrossmatchDialog({
  request: r,
  item,
  candidate: c,
  onClose,
}: {
  request: RequestDetail;
  item: RequestItem;
  candidate: Candidate;
  onClose: () => void;
}) {
  const sample = [...r.samples].reverse().find((s) => s.status === "ACCEPTED" && s.result_status === "VALIDATED");
  const [result, setResult] = useState<"COMPATIBLE" | "INCOMPATIBLE" | null>(null);
  const [method, setMethod] = useState("Gel card (AHG)");
  const [notes, setNotes] = useState("");
  const [validateNow, setValidateNow] = useState(true);

  const save = useApiMutation({
    mutationFn: () =>
      apiPost<RequestDetail>("/api/v1/bdrs/crossmatches", {
        request_item_id: item.id,
        sample_id: sample?.id,
        product_id: c.product.id,
        method,
        result,
        notes: notes || null,
        validate_now: validateNow,
      }),
    success:
      result === "COMPATIBLE"
        ? validateNow
          ? "Crossmatch kompatibel — kantong dialokasikan."
          : "Crossmatch dicatat, menunggu validasi."
        : "Crossmatch TIDAK kompatibel — kantong tidak dialokasikan.",
    invalidate: [...requestInvalidations, qk.candidates(item.id)],
    onSuccess: onClose,
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hasil crossmatch</DialogTitle>
          <DialogDescription>
            Sampel <span className="font-mono">{sample?.sample_no}</span> × kantong{" "}
            <span className="font-mono">{c.product.product_no}</span> ({bloodGroup(c.product.abo, c.product.rh)}). Hasil dimasukkan
            oleh petugas sesuai pemeriksaan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={result === "COMPATIBLE" ? "default" : "outline"}
            className={cn("h-14", result === "COMPATIBLE" && "bg-emerald-600 hover:bg-emerald-600/90")}
            onClick={() => setResult("COMPATIBLE")}
          >
            Kompatibel
          </Button>
          <Button
            type="button"
            variant={result === "INCOMPATIBLE" ? "destructive" : "outline"}
            className="h-14"
            onClick={() => setResult("INCOMPATIBLE")}
          >
            Tidak kompatibel
          </Button>
        </div>
        <Field label="Metode">
          <Input value={method} onChange={(e) => setMethod(e.target.value)} />
        </Field>
        <Field label="Catatan">
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox checked={validateNow} onCheckedChange={(v) => setValidateNow(v === true)} />
          Validasi sekarang (kompatibel → langsung dialokasikan)
        </Label>
        {save.error && <ErrorAlert error={save.error} />}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={!result || !sample || save.isPending} onClick={() => save.mutate()}>
            Simpan hasil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
