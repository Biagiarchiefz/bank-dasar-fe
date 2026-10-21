"use client";

import { Droplet, Printer, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { ProductStatus } from "@/components/data-display/status-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { RowsSkeleton } from "@/components/feedback/loading";
import { BarcodeInput } from "@/components/forms/barcode-input";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductLabel } from "@/features/inventory";
import { componentLabel, fmtCountdown, fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Batch, Product } from "@/types";
import { useCreateBatch, useProcessingQueue } from "../hooks/use-processing";

const OUTPUTS = ["PRC", "FFP", "TC"] as const;
type Output = (typeof OUTPUTS)[number];
type Plan = Record<Output, { on: boolean; volume: string }>;

const defaultPlan = (): Plan => ({
  PRC: { on: true, volume: "" },
  FFP: { on: true, volume: "" },
  TC: { on: false, volume: "" },
});

export function ProcessingBoard() {
  const queue = useProcessingQueue();
  const [plans, setPlans] = useState<Record<number, Plan>>({});
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Batch | null>(null);

  const selected = (queue.data ?? []).filter((p) => plans[p.id]);
  const totalOutputs = selected.reduce((n, p) => n + OUTPUTS.filter((o) => plans[p.id][o].on).length, 0);

  function toggle(p: Product, on: boolean) {
    setPlans((prev) => {
      const next = { ...prev };
      if (on) next[p.id] = prev[p.id] ?? defaultPlan();
      else delete next[p.id];
      return next;
    });
  }

  function setOutput(id: number, o: Output, patch: Partial<Plan[Output]>) {
    setPlans((prev) => ({ ...prev, [id]: { ...prev[id], [o]: { ...prev[id][o], ...patch } } }));
  }

  const process = useCreateBatch((b) => {
    setResult(b);
    setPlans({});
    setNotes("");
  });

  function submit() {
    process.mutate({
      notes: notes.trim() || null,
      items: selected.map((p) => ({
        source_product_id: p.id,
        outputs: OUTPUTS.filter((o) => plans[p.id][o].on).map((o) => ({
          component_code: o,
          volume_ml: plans[p.id][o].volume ? Number(plans[p.id][o].volume) : null,
        })),
      })),
    });
  }

  if (result) {
    return (
      <>
        <PageHeader
          title={`Batch ${result.batch_no}`}
          description={`Diolah ${fmtDateTime(result.processed_at)} oleh ${result.processed_by_name ?? "—"}. Semua komponen berstatus karantina sampai diluluskan.`}
          actions={
            <>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer />
                Cetak semua label
              </Button>
              <Button variant="outline" onClick={() => setResult(null)}>
                <RotateCcw />
                Olah lagi
              </Button>
              <Button asChild>
                <Link href="/utd/release">Ke pelulusan</Link>
              </Button>
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2">
          {result.outputs.map((p) => (
            <ProductLabel
              key={p.id}
              productNo={p.product_no}
              componentCode={p.component_code}
              abo={p.abo}
              rh={p.rh}
              collectedAt={p.collected_at}
              expiresAt={p.expires_at}
              facility={p.facility_name}
              volumeML={p.volume_ml}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Pengolahan komponen"
        description="Pisahkan whole blood (WB) menjadi PRC, FFP, dan TC. Pindai kantong atau centang dari antrean."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <BarcodeInput
            buttonLabel="Pilih"
            placeholder="Pindai nomor kantong WB…"
            onScan={(code) => {
              const p = queue.data?.find((q) => q.product_no === code);
              if (!p) {
                toast.warning(`${code} tidak ada di antrean pengolahan.`);
                return;
              }
              toggle(p, true);
              toast.success(`${p.product_no} dipilih.`);
            }}
          />
          <Card className="py-0">
            <CardContent className="p-0">
              {queue.isLoading && <RowsSkeleton />}
              {queue.data?.length === 0 && (
                <EmptyState icon={Droplet} title="Antrean kosong" description="Tidak ada WB yang menunggu pengolahan." />
              )}
              <ul className="divide-y">
                {queue.data?.map((p) => {
                  const plan = plans[p.id];
                  return (
                    <li key={p.id} className={cn("p-4", plan && "bg-primary/5")}>
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox checked={!!plan} onCheckedChange={(c) => toggle(p, c === true)} />
                        <span className="flex-1">
                          <span className="block font-mono font-semibold">{p.product_no}</span>
                          <span className="block text-xs text-muted-foreground">
                            Diambil {fmtDateTime(p.collected_at)} · {p.volume_ml ?? "—"} mL · kedaluwarsa dalam {fmtCountdown(p.expires_at)}
                          </span>
                        </span>
                        <BloodGroupChip abo={p.abo} rh={p.rh} size="sm" />
                        <ProductStatus quality={p.quality_status} inventory={p.inventory_status} expired={p.is_expired} />
                      </label>
                      {plan && (
                        <div className="mt-3 grid gap-2 pl-7 sm:grid-cols-3">
                          {OUTPUTS.map((o) => (
                            <div
                              key={o}
                              className={cn("rounded-md border p-2", plan[o].on ? "border-primary/40 bg-background" : "opacity-60")}
                            >
                              <label className="flex items-center gap-2 text-sm font-medium">
                                <Checkbox checked={plan[o].on} onCheckedChange={(c) => setOutput(p.id, o, { on: c === true })} />
                                {o}
                                <span className="text-xs font-normal text-muted-foreground">{componentLabel[o]}</span>
                              </label>
                              {plan[o].on && (
                                <Input
                                  className="mt-2 h-8"
                                  inputMode="numeric"
                                  placeholder="Volume mL (opsional)"
                                  value={plan[o].volume}
                                  onChange={(e) => setOutput(p.id, o, { volume: e.target.value })}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-20">
          <CardHeader>
            <CardTitle className="text-base">Ringkasan batch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-md bg-muted p-3">
                <p className="text-2xl font-bold tabular-nums">{selected.length}</p>
                <p className="text-xs text-muted-foreground">kantong WB</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="text-2xl font-bold tabular-nums">{totalOutputs}</p>
                <p className="text-xs text-muted-foreground">komponen dihasilkan</p>
              </div>
            </div>
            <Textarea placeholder="Catatan batch (opsional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            {process.error && <ErrorAlert error={process.error} />}
            <ConfirmDialog
              title={`Proses ${selected.length} kantong WB?`}
              description={`${totalOutputs} kantong komponen akan dibuat dengan status karantina. Kantong WB sumber menjadi "Diolah".`}
              confirmLabel="Proses"
              onConfirm={submit}
              trigger={
                <Button className="w-full" size="lg" disabled={selected.length === 0 || totalOutputs === 0 || process.isPending}>
                  Proses
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
