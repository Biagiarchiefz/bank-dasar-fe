"use client";

import { CheckCircle2, Printer, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Barcode } from "@/components/data-display/barcode";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageSkeleton } from "@/components/feedback/loading";
import { Field, KeyValue } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductLabel } from "@/features/inventory";
import { donationStatus, fmtDateTime, fmtDuration, labStatus } from "@/lib/format";
import { useCompleteDonation, useDonation, useFailDonation } from "../hooks/use-collection";

export function DonationView() {
  const { donationId } = useParams<{ donationId: string }>();
  const id = Number(donationId);
  const { data: d, isLoading, error } = useDonation(id);
  const [dialog, setDialog] = useState<"complete" | "fail" | null>(null);
  const [volume, setVolume] = useState("450");
  const [reason, setReason] = useState("");

  const complete = useCompleteDonation(id, () => setDialog(null));
  const fail = useFailDonation(id, () => setDialog(null));

  if (isLoading) return <PageSkeleton />;
  if (!d) return <ErrorAlert error={error} />;

  return (
    <>
      <PageHeader
        title="Donasi darah"
        back={{ href: "/utd/collection", label: "Pengambilan" }}
        actions={
          <>
            <StatusBadge map={donationStatus} value={d.status} />
            {d.lab_status && <StatusBadge map={labStatus} value={d.lab_status} />}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6 print:hidden">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Nomor donasi</p>
              <p className="font-mono text-4xl font-extrabold tracking-wider md:text-5xl">{d.donation_no}</p>
              <Barcode value={d.donation_no} height={56} width={2} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <KeyValue
                items={[
                  ["Pendonor", `${d.donor_name} (${d.donor_no})`],
                  ["Golongan", <BloodGroupChip key="g" abo={d.donor_abo} rh={d.donor_rh} />],
                  ["Kunjungan", <span key="v" className="font-mono">{d.visit_no}</span>],
                  ["Jenis kantong", d.bag_type ?? "—"],
                  ["Mulai", fmtDateTime(d.started_at)],
                  ["Selesai", d.ended_at ? `${fmtDateTime(d.ended_at)} (${fmtDuration(d.started_at, d.ended_at)})` : "—"],
                  ["Volume", d.volume_ml ? `${d.volume_ml} mL` : "—"],
                  ["Petugas", d.collector_name ?? "—"],
                  ...(d.failure_reason ? ([["Alasan gagal", d.failure_reason]] as [string, string][]) : []),
                ]}
              />
            </CardContent>
          </Card>
          {d.status === "IN_PROGRESS" && (
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setDialog("complete")}>
                <CheckCircle2 />
                Selesai
              </Button>
              <Button size="lg" variant="outline" className="text-destructive" onClick={() => setDialog("fail")}>
                <XCircle />
                Gagal
              </Button>
            </div>
          )}
          {d.status === "COMPLETED" && d.product_id && (
            <p className="text-sm text-muted-foreground">
              Kantong WB menunggu hasil laboratorium dan pengolahan.{" "}
              <Link href={`/inventory/${d.product_id}`} className="font-medium text-primary hover:underline">
                Lihat kantong
              </Link>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-sm font-semibold text-muted-foreground">Pratinjau label</h2>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer />
              Cetak label
            </Button>
          </div>
          <ProductLabel
            productNo={d.product_no ?? d.donation_no}
            componentCode="WB"
            abo={null}
            rh={null}
            collectedAt={d.ended_at ?? d.started_at}
            expiresAt={d.product_expires_at}
            facility={d.facility_name}
            volumeML={d.volume_ml}
          />
          <p className="text-xs text-muted-foreground print:hidden">
            Golongan darah dicetak ulang setelah hasil laboratorium divalidasi.
          </p>
        </div>
      </div>

      <Dialog open={dialog === "complete"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan pengambilan</DialogTitle>
          </DialogHeader>
          <Field label="Volume darah (mL)" htmlFor="volume" required hint="Antara 100–600 mL">
            <Input id="volume" inputMode="numeric" value={volume} onChange={(e) => setVolume(e.target.value)} autoFocus />
          </Field>
          {complete.error && <ErrorAlert error={complete.error} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Batal
            </Button>
            <Button disabled={complete.isPending || !volume} onClick={() => complete.mutate(Number(volume))}>
              Simpan & buat kantong
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={dialog === "fail"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat pengambilan gagal</DialogTitle>
          </DialogHeader>
          <Field label="Alasan" htmlFor="reason" required>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Batal
            </Button>
            <Button variant="destructive" disabled={fail.isPending || reason.trim().length < 3} onClick={() => fail.mutate(reason)}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
