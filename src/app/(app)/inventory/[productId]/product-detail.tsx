"use client";

import { useQuery } from "@tanstack/react-query";
import { GitBranch, Printer, ScanSearch, Timer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { ErrorAlert } from "@/components/shared/error-alert";
import { KeyValue } from "@/components/shared/field";
import { PageSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { ProductLabel } from "@/components/shared/product-label";
import { ProductStatus } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import { fmtCountdown, fmtDateTime } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { Product, ProductDetail, ProductEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductDetailView() {
  const { productId } = useParams<{ productId: string }>();
  const id = Number(productId);
  const detail = useQuery({ queryKey: qk.product(id), queryFn: () => apiGet<ProductDetail>(`/api/v1/products/${id}`) });
  const events = useQuery({
    queryKey: qk.productEvents(id),
    queryFn: () => apiGet<ProductEvent[]>(`/api/v1/products/${id}/events`),
  });

  if (detail.isLoading) return <PageSkeleton />;
  if (!detail.data) return <ErrorAlert error={detail.error} />;
  const { product: p, parent, children } = detail.data;

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{p.product_no}</span>}
        description={p.component_name}
        back={{ href: "/inventory", label: "Stok darah" }}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer />
              Cetak label
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/trace?q=${p.product_no}`}>
                <ScanSearch />
                Lacak
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <ProductLabel
            productNo={p.product_no}
            componentCode={p.component_code}
            abo={p.abo}
            rh={p.rh}
            collectedAt={p.collected_at}
            expiresAt={p.expires_at}
            facility={p.facility_name}
            volumeML={p.volume_ml}
          />
          <Card className="print:hidden">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <BloodGroupChip abo={p.abo} rh={p.rh} size="lg" />
                <ProductStatus quality={p.quality_status} inventory={p.inventory_status} expired={p.is_expired} />
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md p-3 text-sm",
                  p.is_expired ? "bg-red-50 text-red-800" : "bg-muted",
                )}
              >
                <Timer className="size-4" />
                {p.is_expired ? `Kedaluwarsa ${fmtCountdown(p.expires_at)}` : `Kedaluwarsa dalam ${fmtCountdown(p.expires_at)}`}
              </div>
              <KeyValue
                items={[
                  ["Siap pakai", p.is_usable ? "Ya" : "Tidak"],
                  ["Fasilitas", p.facility_name],
                  ["Lokasi", p.location_name ? `${p.location_name} (${p.location_code})` : "—"],
                  ["Nomor donasi", <span key="d" className="font-mono">{p.donation_no}</span>],
                  ["Diambil", fmtDateTime(p.collected_at)],
                  ["Diproduksi", fmtDateTime(p.produced_at)],
                  ["Kedaluwarsa", fmtDateTime(p.expires_at)],
                  ["Volume", p.volume_ml ? `${p.volume_ml} mL` : "—"],
                  ...(p.hold_reason ? ([["Alasan tahan/tolak", p.hold_reason]] as [string, string][]) : []),
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitBranch className="size-4" />
                Silsilah kantong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {parent && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Induk</p>
                  <LineageLink p={parent} />
                </div>
              )}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Kantong ini</p>
                <LineageLink p={p} current />
              </div>
              {children.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Turunan</p>
                  <div className="space-y-2">
                    {children.map((c) => (
                      <LineageLink key={c.id} p={c} />
                    ))}
                  </div>
                </div>
              )}
              {!parent && children.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum diolah menjadi komponen.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Riwayat kantong</CardTitle>
            </CardHeader>
            <CardContent>{events.data ? <Timeline events={events.data} /> : <PageSkeleton />}</CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function LineageLink({ p, current }: { p: Product; current?: boolean }) {
  const body = (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm",
        current ? "border-primary/40 bg-primary/5" : "transition-colors hover:bg-muted/50",
      )}
    >
      <span className="font-mono font-semibold">{p.product_no}</span>
      <BloodGroupChip abo={p.abo} rh={p.rh} size="sm" />
      <ProductStatus quality={p.quality_status} inventory={p.inventory_status} expired={p.is_expired} />
    </div>
  );
  return current ? body : <Link href={`/inventory/${p.id}`}>{body}</Link>;
}
