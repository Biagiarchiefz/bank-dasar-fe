"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ClipboardList,
  Droplets,
  HeartPulse,
  PackageCheck,
  ShieldAlert,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { EmptyState } from "@/components/shared/empty-state";
import { RowsSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StockMatrix } from "@/components/shared/stock-matrix";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";
import { bloodGroup, eventLabel, fmtCountdown, fmtDateTime, fmtTime } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { useFacilityParam, useSession } from "@/lib/session";
import type { Activity, DashboardSummary, Product, TrendPoint } from "@/lib/types";
import { TrendChart } from "./trend-chart";

export function DashboardView() {
  const { me, facilities, facilityId } = useSession();
  const fid = useFacilityParam();
  const refresh = { refetchInterval: 60_000 };

  const summary = useQuery({
    queryKey: qk.dashboard("summary", fid),
    queryFn: () => apiGet<DashboardSummary>("/api/v1/dashboard/summary", { facility_id: fid }),
    ...refresh,
  });
  const trend = useQuery({
    queryKey: qk.dashboard("trend"),
    queryFn: () => apiGet<TrendPoint[]>("/api/v1/dashboard/trend", { days: 14 }),
    ...refresh,
  });
  const expiring = useQuery({
    queryKey: qk.dashboard("expiring", fid),
    queryFn: () => apiGet<Product[]>("/api/v1/dashboard/expiring", { facility_id: fid }),
    ...refresh,
  });
  const activity = useQuery({
    queryKey: qk.dashboard("activity", fid),
    queryFn: () => apiGet<Activity[]>("/api/v1/dashboard/activity", { facility_id: fid, limit: 12 }),
    ...refresh,
  });

  const s = summary.data;
  const scope = facilityId ? facilities.find((f) => f.id === facilityId)?.name : me.facility_name ?? "Semua fasilitas";
  const critical = s?.low_stock_groups.filter((g) => g.count === 0 || g.rh === "NEG") ?? [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          <>
            {scope} · diperbarui {s ? fmtTime(s.generated_at) : "…"} WIB
          </>
        }
      />

      {s && s.low_stock_groups.length > 0 && (
        <Alert className="mb-6 border-red-300 bg-red-50 text-red-900">
          <AlertTriangle />
          <AlertTitle>Stok PRC rendah pada {s.low_stock_groups.length} golongan darah</AlertTitle>
          <AlertDescription className="text-red-800">
            <div className="mt-1 flex flex-wrap gap-2">
              {s.low_stock_groups.map((g) => (
                <span key={`${g.abo}${g.rh}`} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 ring-1 ring-red-200">
                  <BloodGroupChip abo={g.abo} rh={g.rh} size="sm" />
                  <span className="text-sm tabular-nums">{g.count} kantong</span>
                </span>
              ))}
            </div>
            {critical.length > 0 && (
              <p className="mt-2 text-sm">
                Perhatian khusus: {critical.map((g) => bloodGroup(g.abo, g.rh)).join(", ")} (batas minimum {s.low_stock_threshold}).
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stok siap pakai" value={s?.ready_units} icon={PackageCheck} tone="success" href="/inventory" loading={!s} hint="Lulus, di stok, belum kedaluwarsa" />
        <StatCard label="Karantina" value={s?.hold_units} icon={ShieldAlert} tone="warning" loading={!s} hint="Menunggu hasil lab/pelulusan" />
        <StatCard
          label={`Akan kedaluwarsa ≤ ${s?.expiring_soon_days ?? 3} hari`}
          value={s?.expiring_soon_units}
          icon={Timer}
          tone={s && s.expiring_soon_units > 0 ? "danger" : "default"}
          loading={!s}
          hint="Gunakan lebih dulu (FEFO)"
        />
        <StatCard label="Pendonor hari ini" value={s?.donors_today} icon={Users} loading={!s} hint={s ? `${s.donations_today} donasi selesai` : undefined} />
        <StatCard label="Permintaan aktif" value={s?.active_requests} icon={ClipboardList} loading={!s} />
        <StatCard label="Transfusi berjalan" value={s?.transfusions_in_progress} icon={HeartPulse} loading={!s} />
        <StatCard label="Reaksi transfusi (30 hari)" value={s?.reactions_30d} icon={AlertTriangle} tone={s && s.reactions_30d > 0 ? "warning" : "default"} loading={!s} />
        <StatCard label="Donasi hari ini" value={s?.donations_today} icon={Droplets} loading={!s} />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matriks stok siap pakai</CardTitle>
          </CardHeader>
          <CardContent>
            <StockMatrix facilityId={fid} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tren 14 hari: donasi vs transfusi</CardTitle>
          </CardHeader>
          <CardContent>{trend.data ? <TrendChart data={trend.data} /> : <Skeleton className="h-72" />}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Akan kedaluwarsa</CardTitle>
          </CardHeader>
          <CardContent>
            {expiring.isLoading && <RowsSkeleton rows={3} />}
            {expiring.data?.length === 0 && <EmptyState title="Tidak ada kantong yang segera kedaluwarsa" />}
            <ul className="divide-y">
              {expiring.data?.map((p) => (
                <li key={p.id}>
                  <Link href={`/inventory/${p.id}`} className="flex items-center gap-3 py-2 text-sm hover:bg-muted/40">
                    <span className="flex-1 font-mono font-medium">{p.product_no}</span>
                    <BloodGroupChip abo={p.abo} rh={p.rh} size="sm" />
                    <span className="w-24 text-muted-foreground">{p.facility_name.replace(" RS Demo", "")}</span>
                    <span className="w-32 text-right font-medium text-red-700">{fmtCountdown(p.expires_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aktivitas terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.isLoading && <RowsSkeleton rows={4} />}
            <ul className="space-y-3">
              {activity.data?.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p>
                      <span className="font-medium">{eventLabel[a.event_type] ?? a.event_type}</span>{" "}
                      <Link href={`/inventory/${a.product_id}`} className="font-mono text-primary hover:underline">
                        {a.product_no}
                      </Link>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {fmtDateTime(a.created_at)} · {a.actor ?? "Sistem"} · {a.facility_name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
