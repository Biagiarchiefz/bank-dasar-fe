"use client";

import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Droplet,
  Droplets,
  HeartPulse,
  PackageCheck,
  ScanSearch,
  ShieldAlert,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { StatCard } from "@/components/data-display/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { RowsSkeleton } from "@/components/feedback/loading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { canAccess } from "@/config/navigation";
import { StockMatrix } from "@/features/inventory";
import { bloodGroup, eventLabel, fmtCountdown, fmtDateTime, fmtTime, greetingAt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFacilityParam, useSession } from "@/store/session";
import { useDashboardSummary, useDashboardTrend, useExpiringProducts, useRecentActivity } from "../hooks/use-dashboard";
import { TrendChart } from "./trend-chart";

export function DashboardView() {
  const { me, facilities, facilityId } = useSession();
  const fid = useFacilityParam();
  const summary = useDashboardSummary(fid);
  const trend = useDashboardTrend(14);
  const expiring = useExpiringProducts(fid);
  const activity = useRecentActivity(fid);

  const s = summary.data;
  const scope = facilityId ? facilities.find((f) => f.id === facilityId)?.name : me.facility_name ?? "Semua fasilitas";
  const critical = s?.low_stock_groups.filter((g) => g.count === 0 || g.rh === "NEG") ?? [];
  const canInventory = canAccess(me.role, "/inventory");

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-600 via-primary to-red-900 p-6 text-primary-foreground shadow-xl shadow-red-900/15 sm:p-10">
        <div className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-red-950/30 blur-3xl" />
        <Droplet className="pointer-events-none absolute right-8 bottom-6 hidden size-36 text-white/10 lg:block" strokeWidth={1.5} />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              {scope} · diperbarui {s ? fmtTime(s.generated_at) : "…"} WIB
            </p>
            <h1 className="mt-4 text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-5xl">
              {s ? greetingAt(s.generated_at) : "Halo"}, {me.full_name.split(" ")[0]}.
            </h1>
            <p className="mt-2 max-w-xl text-pretty text-red-50/90">
              Ringkasan stok dan layanan darah hari ini. Data diperbarui otomatis setiap menit.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {canInventory && (
              <Button asChild className="bg-white text-primary shadow-none hover:bg-white/90">
                <Link href="/inventory">
                  Lihat stok darah
                  <ArrowRight />
                </Link>
              </Button>
            )}
            <Button asChild className="bg-white/15 text-white shadow-none ring-1 ring-white/25 hover:bg-white/25">
              <Link href="/trace">
                <ScanSearch />
                Lacak kantong
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          <HeroStat
            label="Stok siap pakai"
            value={s?.ready_units}
            hint="Lulus, di stok, belum kedaluwarsa"
            icon={PackageCheck}
            href={canInventory ? "/inventory" : undefined}
          />
          <HeroStat label="Karantina" value={s?.hold_units} hint="Menunggu hasil lab/pelulusan" icon={ShieldAlert} />
          <HeroStat
            label={`Kedaluwarsa ≤ ${s?.expiring_soon_days ?? 3} hari`}
            value={s?.expiring_soon_units}
            hint="Gunakan lebih dulu (FEFO)"
            icon={Timer}
            urgent={!!s && s.expiring_soon_units > 0}
          />
        </div>
      </section>

      {s && s.low_stock_groups.length > 0 && (
        <section
          role="alert"
          className="flex flex-col gap-4 rounded-3xl border border-red-200 bg-red-50/80 p-6 text-red-950 sm:flex-row sm:items-start"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Stok PRC rendah pada {s.low_stock_groups.length} golongan darah</p>
            {critical.length > 0 && (
              <p className="mt-0.5 text-sm text-red-800">
                Perhatian khusus: {critical.map((g) => bloodGroup(g.abo, g.rh)).join(", ")} (batas minimum{" "}
                {s.low_stock_threshold}).
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {s.low_stock_groups.map((g) => (
                <span
                  key={`${g.abo}${g.rh}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 ring-1 ring-red-200"
                >
                  <BloodGroupChip abo={g.abo} rh={g.rh} size="sm" className="rounded-full" />
                  <span className="text-sm font-medium tabular-nums">{g.count} kantong</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Pendonor hari ini"
          value={s?.donors_today}
          icon={Users}
          loading={!s}
          hint={s ? `${s.donations_today} donasi selesai` : undefined}
        />
        <StatCard label="Donasi hari ini" value={s?.donations_today} icon={Droplets} tone="danger" loading={!s} />
        <StatCard label="Permintaan aktif" value={s?.active_requests} icon={ClipboardList} loading={!s} />
        <StatCard label="Transfusi berjalan" value={s?.transfusions_in_progress} icon={HeartPulse} tone="success" loading={!s} />
        <StatCard
          label="Reaksi transfusi"
          value={s?.reactions_30d}
          icon={AlertTriangle}
          tone={s && s.reactions_30d > 0 ? "warning" : "default"}
          loading={!s}
          hint="30 hari terakhir"
        />
      </div>

      <Panel
        title="Matriks stok siap pakai"
        description="Per komponen dan golongan darah"
        action={canInventory ? <PanelLink href="/inventory">Stok darah</PanelLink> : undefined}
      >
        <StockMatrix facilityId={fid} />
      </Panel>

      <div className="grid gap-8 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Tren 14 hari" description="Donasi vs transfusi per hari (WIB)">
          {trend.data ? <TrendChart data={trend.data} /> : <Skeleton className="h-72 rounded-2xl" />}
        </Panel>
        <Panel className="xl:col-span-2" title="Akan kedaluwarsa" description="Kantong yang perlu dipakai lebih dulu">
          {expiring.isLoading && <RowsSkeleton rows={3} />}
          {expiring.data?.length === 0 && <EmptyState icon={Timer} title="Tidak ada kantong yang segera kedaluwarsa" />}
          <ul className="-mx-2 space-y-1">
            {expiring.data?.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/inventory/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2.5 text-sm transition-colors hover:bg-muted/60"
                >
                  <BloodGroupChip abo={p.abo} rh={p.rh} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono font-medium">{p.product_no}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.facility_name.replace(" RS Demo", "")}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                    {fmtCountdown(p.expires_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="xl:col-start-3 xl:row-span-2 xl:row-start-1" title="Aktivitas terbaru" description="Perubahan status kantong terakhir">
          {activity.isLoading && <RowsSkeleton rows={4} />}
          {activity.data?.length === 0 && <EmptyState title="Belum ada aktivitas" />}
          <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border">
            {activity.data?.map((a) => (
              <li key={a.id} className="relative flex gap-4 text-sm">
                <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-card bg-primary ring-2 ring-primary/15" />
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
          </ol>
        </Panel>
      </div>
    </div>
  );
}

/** Headline KPI tile on the red hero. */
function HeroStat({
  label,
  value,
  hint,
  icon: Icon,
  href,
  urgent,
}: {
  label: string;
  value: number | undefined;
  hint: string;
  icon: LucideIcon;
  href?: string;
  urgent?: boolean;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full items-start justify-between gap-3 rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-sm transition-colors",
        href && "hover:bg-white/15",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-red-50">{label}</p>
        {value === undefined ? (
          <Skeleton className="mt-2 h-10 w-20 bg-white/20" />
        ) : (
          <p className="mt-1 text-4xl font-extrabold tracking-[-0.03em] tabular-nums">{value}</p>
        )}
        <p className="mt-1 text-xs text-red-100/80">{hint}</p>
      </div>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          urgent ? "bg-white text-primary" : "bg-white/15 text-white",
        )}
      >
        <Icon className="size-5" />
      </span>
    </div>
  );
  return href ? (
    <Link href={href} className="rounded-3xl focus-visible:ring-[3px] focus-visible:ring-white/60 focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}

function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-[2rem] border border-border/80 bg-card p-6 shadow-soft sm:p-8",
        className,
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
    >
      {children}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}
