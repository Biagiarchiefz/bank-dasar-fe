"use client";

import { CheckCircle2, CircleDashed, PackageCheck, Printer, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { ProductStatus, StatusBadge } from "@/components/data-display/status-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageSkeleton } from "@/components/feedback/loading";
import { BarcodeInput } from "@/components/forms/barcode-input";
import { Field, KeyValue } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDateTime, receiveStatus, transferStatus } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSession } from "@/store/session";
import { useReceiveTransfer, useTransfer } from "../hooks/use-transfers";

type Decision = { scanned: boolean; accepted: boolean | null; reason: string };
const emptyDecision: Decision = { scanned: false, accepted: null, reason: "" };

export function TransferView() {
  const { id } = useParams<{ id: string }>();
  const transferId = Number(id);
  const { me } = useSession();
  const { data: t, isLoading, error } = useTransfer(transferId);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [arrivalTemp, setArrivalTemp] = useState("");

  const receive = useReceiveTransfer(transferId);

  if (isLoading) return <PageSkeleton />;
  if (!t) return <ErrorAlert error={error} />;

  const canReceive = t.status === "IN_TRANSIT" && (me.role === "ADMIN" || me.role === "PETUGAS_BDRS");
  const decided = t.items.filter((it) => {
    const d = decisions[it.product_id];
    return d && (d.accepted === true || (d.accepted === false && d.reason.trim().length >= 3));
  }).length;

  function setDecision(productId: number, patch: Partial<Decision>) {
    setDecisions((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] ?? emptyDecision), ...patch },
    }));
  }

  function onScan(code: string) {
    const item = t!.items.find((it) => it.product.product_no === code);
    if (!item) {
      toast.warning(`Kantong ${code} tidak ada dalam kiriman ini!`, { duration: 6000 });
      return;
    }
    setDecision(item.product_id, { scanned: true, accepted: decisions[item.product_id]?.accepted ?? true });
    toast.success(`${code} cocok.`);
  }

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{t.transfer_no}</span>}
        description={`${t.from_facility_name} → ${t.to_facility_name}`}
        back={{ href: "/transfers", label: "Distribusi" }}
        actions={
          <>
            <StatusBadge map={transferStatus} value={t.status} />
            <Button variant="outline" onClick={() => window.print()}>
              <Printer />
              Cetak surat jalan
            </Button>
          </>
        }
      />

      {/* Printable delivery note */}
      <div className="mb-6 hidden print:block">
        <h1 className="text-xl font-bold">Surat Jalan Darah — {t.transfer_no}</h1>
        <p className="text-sm">
          {t.from_facility_name} → {t.to_facility_name} · dikirim {fmtDateTime(t.sent_at)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {canReceive && <BarcodeInput onScan={onScan} buttonLabel="Cocokkan" placeholder="Pindai setiap kantong yang tiba…" />}
          <Card className="py-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canReceive && <TableHead className="w-10" />}
                    <TableHead>Kantong</TableHead>
                    <TableHead>Golongan</TableHead>
                    <TableHead>Status kantong</TableHead>
                    <TableHead>{canReceive ? "Keputusan" : "Penerimaan"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {t.items.map((it) => {
                    const d = decisions[it.product_id];
                    return (
                      <TableRow key={it.id} className={cn(d?.scanned && "bg-emerald-50/60")}>
                        {canReceive && (
                          <TableCell>
                            {d?.scanned ? (
                              <CheckCircle2 className="size-5 text-emerald-600" />
                            ) : (
                              <CircleDashed className="size-5 text-muted-foreground" />
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <p className="font-mono font-semibold">{it.product.product_no}</p>
                          <p className="text-xs text-muted-foreground">{it.product.component_name}</p>
                        </TableCell>
                        <TableCell>
                          <BloodGroupChip abo={it.product.abo} rh={it.product.rh} size="sm" />
                        </TableCell>
                        <TableCell>
                          <ProductStatus
                            quality={it.product.quality_status}
                            inventory={it.product.inventory_status}
                            expired={it.product.is_expired}
                          />
                        </TableCell>
                        <TableCell>
                          {canReceive ? (
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                <Button
                                  size="xs"
                                  variant={d?.accepted === true ? "default" : "outline"}
                                  className={cn(d?.accepted === true && "bg-emerald-600 hover:bg-emerald-600/90")}
                                  onClick={() => setDecision(it.product_id, { accepted: true })}
                                >
                                  Terima
                                </Button>
                                <Button
                                  size="xs"
                                  variant={d?.accepted === false ? "destructive" : "outline"}
                                  onClick={() => setDecision(it.product_id, { accepted: false })}
                                >
                                  Tolak
                                </Button>
                              </div>
                              {d?.accepted === false && (
                                <Input
                                  className="h-8"
                                  placeholder="Alasan (mis. kantong bocor)"
                                  value={d.reason}
                                  onChange={(e) => setDecision(it.product_id, { reason: e.target.value })}
                                />
                              )}
                            </div>
                          ) : (
                            <div>
                              <StatusBadge map={receiveStatus} value={it.receive_status} />
                              {it.reject_reason && <p className="mt-1 text-xs text-red-700">{it.reject_reason}</p>}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data kiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <KeyValue
                items={[
                  ["Dikirim", `${fmtDateTime(t.sent_at)} · ${t.sent_by_name ?? "—"}`],
                  ["Kurir", t.courier_name ?? "—"],
                  ["Suhu kemas", t.packing_temp_c !== null ? `${t.packing_temp_c} °C` : "—"],
                  ["Diterima", t.received_at ? `${fmtDateTime(t.received_at)} · ${t.received_by_name}` : "—"],
                  ["Suhu tiba", t.arrival_temp_c !== null ? `${t.arrival_temp_c} °C` : "—"],
                  ["Jumlah", `${t.item_count} kantong`],
                  ["Catatan", t.notes ?? "—"],
                ]}
              />
            </CardContent>
          </Card>
          {canReceive && (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-base">Penerimaan di BDRS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Sudah diputuskan</span>
                  <span className="font-bold tabular-nums">
                    {decided} / {t.items.length}
                  </span>
                </div>
                <Field label="Suhu saat tiba (°C)" htmlFor="arrival" required>
                  <Input id="arrival" inputMode="decimal" value={arrivalTemp} onChange={(e) => setArrivalTemp(e.target.value)} />
                </Field>
                {receive.error && <ErrorAlert error={receive.error} />}
                <ConfirmDialog
                  title={`Terima kiriman ${t.transfer_no}?`}
                  description={`${t.items.filter((it) => decisions[it.product_id]?.accepted === true).length} kantong diterima ke stok BDRS, ${
                    t.items.filter((it) => decisions[it.product_id]?.accepted === false).length
                  } ditolak (ditahan/karantina).`}
                  confirmLabel="Simpan penerimaan"
                  onConfirm={() =>
                    receive.mutate({
                      arrival_temp_c: Number(arrivalTemp.replace(",", ".")),
                      items: t.items.map((it) => ({
                        product_id: it.product_id,
                        accepted: decisions[it.product_id]?.accepted === true,
                        reject_reason: decisions[it.product_id]?.accepted === false ? decisions[it.product_id].reason : null,
                      })),
                    })
                  }
                  trigger={
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={decided !== t.items.length || arrivalTemp.trim() === "" || receive.isPending}
                    >
                      <PackageCheck />
                      Simpan penerimaan
                    </Button>
                  }
                />
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <XCircle className="mt-0.5 size-3 shrink-0" />
                  Kantong yang ditolak tetap pindah ke BDRS tetapi berstatus karantina beserta alasannya.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
