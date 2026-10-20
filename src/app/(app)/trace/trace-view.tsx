"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Droplet,
  FlaskConical,
  HeartPulse,
  type LucideIcon,
  Package,
  ScanSearch,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { KeyValue } from "@/components/shared/field";
import { PageSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Pill, ProductStatus, StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import {
  componentLabel,
  fmtDateTime,
  labStatus,
  receiveStatus,
  severity,
  testValue,
  transfusionStatus,
} from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { Trace, TraceProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

type NodeKey = "donor" | "donation" | "lab" | "components" | "distribution" | "patient" | "transfusion";

export function TraceView() {
  const router = useRouter();
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toUpperCase();
  const { data, isLoading, error } = useQuery({
    queryKey: qk.trace(q),
    queryFn: () => apiGet<Trace>("/api/v1/trace", { q }),
    enabled: q !== "",
  });

  return (
    <>
      <PageHeader
        title="Lacak kantong"
        description="Telusuri satu kantong dari pendonor sampai pasien. Pindai atau ketik nomor kantong / nomor donasi."
      />
      <Card className="mb-6">
        <CardContent className="py-6">
          <BarcodeInput
            size="lg"
            buttonLabel="Lacak"
            placeholder="mis. UTD0126000001-PRC atau UTD0126000001"
            onScan={(v) => router.push(`/trace?q=${encodeURIComponent(v)}`)}
          />
        </CardContent>
      </Card>
      {q === "" && <EmptyState icon={ScanSearch} title="Masukkan nomor kantong untuk mulai melacak" />}
      {isLoading && <PageSkeleton />}
      {error && <ErrorAlert error={error} />}
      {data && <TraceResult key={data.query} trace={data} />}
    </>
  );
}

function TraceResult({ trace: t }: { trace: Trace }) {
  const focus =
    t.products.find((p) => p.id === t.matched_product_id) ??
    t.products.find((p) => p.transfusion) ??
    t.products.find((p) => p.component_code === "PRC") ??
    t.products[0];
  const [productId, setProductId] = useState(focus?.id);
  const [node, setNode] = useState<NodeKey>(focus?.transfusion ? "transfusion" : "components");
  const p = t.products.find((x) => x.id === productId) ?? focus;

  const nodes: { key: NodeKey; label: string; icon: LucideIcon; title: string; sub: string; done: boolean; alert?: boolean }[] = [
    {
      key: "donor",
      label: "Pendonor",
      icon: UserRound,
      title: t.donor.display_name,
      sub: t.donor.donor_no,
      done: true,
    },
    {
      key: "donation",
      label: "Donasi",
      icon: Droplet,
      title: t.donation.donation_no,
      sub: fmtDateTime(t.donation.collected_at ?? t.donation.started_at),
      done: t.donation.status === "COMPLETED",
    },
    {
      key: "lab",
      label: "Laboratorium",
      icon: FlaskConical,
      title: t.lab ? (t.lab.imltd === "REACTIVE" ? "Reaktif" : t.lab.status === "VALIDATED" ? "Non-reaktif" : "Belum selesai") : "—",
      sub: t.lab?.validated_at ? `Divalidasi ${fmtDateTime(t.lab.validated_at)}` : "Menunggu validasi",
      done: t.lab?.status === "VALIDATED",
      alert: t.lab?.imltd === "REACTIVE",
    },
    {
      key: "components",
      label: "Komponen",
      icon: Package,
      title: `${t.products.length} kantong`,
      sub: t.products.map((x) => x.component_code).join(" · "),
      done: t.products.length > 1,
    },
    {
      key: "distribution",
      label: "Distribusi",
      icon: Truck,
      title: p?.transfers.length ? p.transfers[p.transfers.length - 1].transfer_no : "Belum dikirim",
      sub: p?.facility_name ?? "",
      done: (p?.transfers.length ?? 0) > 0,
    },
    {
      key: "patient",
      label: "Pasien",
      icon: UserRound,
      title: p?.transfusion?.patient_name ?? p?.allocation?.request_no ?? "—",
      sub: p?.transfusion ? `${p.transfusion.patient_mrn} · ${p.transfusion.ward}` : p?.issue?.ward ?? "Belum dialokasikan",
      done: !!p?.allocation && p.allocation.status !== "CANCELLED",
    },
    {
      key: "transfusion",
      label: "Transfusi",
      icon: HeartPulse,
      title: p?.transfusion ? transfusionStatus[p.transfusion.status]?.label ?? p.transfusion.status : "—",
      sub: p?.transfusion ? fmtDateTime(p.transfusion.ended_at ?? p.transfusion.started_at) : "",
      done: p?.transfusion?.status === "COMPLETED",
      alert: (p?.transfusion?.reactions.length ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Product picker: the whole family of bags from this donation */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Kantong:</span>
        {t.products.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setProductId(x.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 font-mono text-sm transition-colors",
              x.id === p?.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50",
            )}
          >
            {x.product_no}
          </button>
        ))}
      </div>

      {/* Horizontal flow: Donor -> ... -> Transfusion */}
      <div className="overflow-x-auto pb-2">
        <ol className="flex min-w-max items-stretch gap-1">
          {nodes.map((n, i) => (
            <li key={n.key} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setNode(n.key)}
                className={cn(
                  "flex w-44 flex-col gap-1 rounded-xl border-2 bg-card p-3 text-left transition-all",
                  node === n.key ? "border-primary shadow-md" : "border-border hover:border-primary/40",
                  n.alert && "border-red-400 bg-red-50",
                  !n.done && !n.alert && "opacity-70",
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <n.icon className={cn("size-4", n.done ? "text-emerald-600" : n.alert ? "text-red-600" : "")} />
                  {n.label}
                </span>
                <span className="truncate font-semibold">{n.title}</span>
                <span className="truncate text-xs text-muted-foreground">{n.sub}</span>
              </button>
              {i < nodes.length - 1 && <ChevronRight className="size-5 shrink-0 text-muted-foreground" />}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{nodes.find((n) => n.key === node)?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <NodeDetail node={node} trace={t} product={p} onPick={setProductId} />
          </CardContent>
        </Card>
        {p && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span>
                  Riwayat <span className="font-mono">{p.product_no}</span>
                </span>
                <Link href={`/inventory/${p.id}`} className="text-sm font-normal text-primary hover:underline">
                  Detail
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={p.events} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NodeDetail({
  node,
  trace: t,
  product: p,
  onPick,
}: {
  node: NodeKey;
  trace: Trace;
  product: TraceProduct | undefined;
  onPick: (id: number) => void;
}) {
  switch (node) {
    case "donor":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BloodGroupChip abo={t.donor.abo} rh={t.donor.rh} size="lg" />
            <div>
              <p className="text-lg font-semibold">{t.donor.display_name}</p>
              <p className="font-mono text-sm text-muted-foreground">{t.donor.donor_no}</p>
            </div>
          </div>
          {t.donor.masked && (
            <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
              Identitas pendonor disamarkan untuk menjaga kerahasiaan. Hanya petugas UTD yang dapat melihat identitas lengkap.
            </p>
          )}
          {t.visit && (
            <KeyValue
              items={[
                ["Kunjungan", <span key="v" className="font-mono">{t.visit.visit_no}</span>],
                ["Diskrining", t.visit.screened_at ? `${fmtDateTime(t.visit.screened_at)} · ${t.visit.screened_by_name}` : "—"],
                ["Hb saat seleksi", t.visit.hb_g_dl !== null ? `${t.visit.hb_g_dl} g/dL` : "—"],
              ]}
            />
          )}
        </div>
      );
    case "donation":
      return (
        <KeyValue
          items={[
            ["Nomor donasi", <span key="d" className="font-mono">{t.donation.donation_no}</span>],
            ["Fasilitas", t.donation.facility],
            ["Diambil", fmtDateTime(t.donation.collected_at ?? t.donation.started_at)],
            ["Volume", t.donation.volume_ml ? `${t.donation.volume_ml} mL` : "—"],
            ["Kantong", t.donation.bag_type ?? "—"],
            ["Petugas", t.donation.collector_name ?? "—"],
          ]}
        />
      );
    case "lab":
      if (!t.lab) return <p className="text-sm text-muted-foreground">Belum ada hasil laboratorium.</p>;
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <BloodGroupChip abo={t.lab.abo} rh={t.lab.rh} size="lg" />
            <StatusBadge map={labStatus} value={t.lab.status} />
            <StatusBadge map={testValue} value={t.lab.imltd} />
          </div>
          {t.lab.tests ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(t.lab.tests).map(([k, v]) => (
                <div key={k} className="rounded-md border p-2 text-center">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <StatusBadge map={testValue} value={v} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Rincian per pemeriksaan hanya untuk petugas laboratorium.</p>
          )}
          <KeyValue
            items={[
              ["Diinput", t.lab.entered_at ? `${fmtDateTime(t.lab.entered_at)} · ${t.lab.entered_by_name}` : "—"],
              ["Divalidasi", t.lab.validated_at ? `${fmtDateTime(t.lab.validated_at)} · ${t.lab.validated_by_name}` : "—"],
            ]}
          />
        </div>
      );
    case "components":
      return (
        <ul className="space-y-2">
          {t.products.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => onPick(x.id)}
                className={cn(
                  "w-full rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted/40",
                  x.id === p?.id && "border-primary/50 bg-primary/5",
                  x.parent_product_id && "ml-6 w-[calc(100%-1.5rem)]",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-semibold">{x.product_no}</span>
                  <span className="text-muted-foreground">{componentLabel[x.component_code]}</span>
                  <BloodGroupChip abo={x.abo} rh={x.rh} size="sm" />
                  <ProductStatus quality={x.quality_status} inventory={x.inventory_status} expired={x.is_expired} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {x.batch ? `Batch ${x.batch.batch_no} · ` : ""}
                  {x.release ? `${x.release.decision === "RELEASED" ? "Diluluskan" : "Ditolak"} ${fmtDateTime(x.release.decided_at)} · ` : ""}
                  {x.facility_name} · kedaluwarsa {fmtDateTime(x.expires_at)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      );
    case "distribution":
      if (!p || p.transfers.length === 0) return <p className="text-sm text-muted-foreground">Kantong ini belum dikirim ke BDRS.</p>;
      return (
        <ul className="space-y-3">
          {p.transfers.map((tr) => (
            <li key={tr.transfer_id} className="rounded-md border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/transfers/${tr.transfer_id}`} className="font-mono font-semibold text-primary hover:underline">
                  {tr.transfer_no}
                </Link>
                <StatusBadge map={receiveStatus} value={tr.receive_status} />
              </div>
              <p className="mt-1 text-muted-foreground">
                {tr.from_facility} → {tr.to_facility} · dikirim {fmtDateTime(tr.sent_at)}
                {tr.received_at ? ` · diterima ${fmtDateTime(tr.received_at)}` : ""}
                {tr.courier_name ? ` · kurir ${tr.courier_name}` : ""}
              </p>
            </li>
          ))}
        </ul>
      );
    case "patient":
      if (!p?.allocation) return <p className="text-sm text-muted-foreground">Kantong ini belum dialokasikan untuk pasien.</p>;
      return (
        <KeyValue
          items={[
            [
              "Permintaan",
              <Link key="r" href={`/bdrs/requests/${p.allocation.request_id}`} className="font-mono text-primary hover:underline">
                {p.allocation.request_no}
              </Link>,
            ],
            ["Alokasi", `${fmtDateTime(p.allocation.allocated_at)} (${p.allocation.status})`],
            ["Crossmatch", p.allocation.crossmatch_result ?? "Tidak diperlukan"],
            ["Pasien", p.transfusion ? `${p.transfusion.patient_name} (${p.transfusion.patient_mrn})` : "—"],
            ["Serah terima", p.issue ? `${p.issue.issue_no} · ${p.issue.ward} · ${p.issue.received_by_name}` : "Belum diserahkan"],
          ]}
        />
      );
    case "transfusion":
      if (!p?.transfusion) return <p className="text-sm text-muted-foreground">Kantong ini belum ditransfusikan.</p>;
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge map={transfusionStatus} value={p.transfusion.status} />
            {p.transfusion.reactions.length > 0 && <Pill tone="red" label={`${p.transfusion.reactions.length} reaksi dilaporkan`} />}
          </div>
          <KeyValue
            items={[
              ["Pasien", `${p.transfusion.patient_name} (${p.transfusion.patient_mrn})`],
              ["Ruangan", p.transfusion.ward],
              ["Mulai", fmtDateTime(p.transfusion.started_at)],
              ["Selesai", fmtDateTime(p.transfusion.ended_at)],
              ["Volume diberikan", p.transfusion.volume_given_ml !== null ? `${p.transfusion.volume_given_ml} mL` : "—"],
            ]}
          />
          {p.transfusion.reactions.map((r) => (
            <div key={r.reported_at} className="rounded-md border border-red-200 bg-red-50 p-2 text-sm">
              <StatusBadge map={severity} value={r.severity} /> {r.symptoms.join(", ")} · {fmtDateTime(r.reported_at)}
            </div>
          ))}
        </div>
      );
  }
}
