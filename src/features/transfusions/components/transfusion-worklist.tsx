"use client";

import { HeartPulse, Play, Timer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSkeleton } from "@/components/feedback/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtCountdown, fmtDuration, fmtTime, priority, wards } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WorklistEntry } from "@/types";
import { useTransfusionWorklist } from "../hooks/use-transfusions";

export function TransfusionWorklistView() {
  const [ward, setWard] = useState<string | null>(null);
  const { data, isLoading } = useTransfusionWorklist();
  if (isLoading || !data) return <PageSkeleton />;

  const byWard = (list: WorklistEntry[]) => (ward ? list.filter((e) => e.ward === ward) : list);
  const waiting = byWard(data.waiting);
  const running = byWard(data.in_progress);

  return (
    <>
      <PageHeader title="Transfusi" description="Kantong yang sudah diserahkan ke ruangan dan transfusi yang sedang berjalan." />
      <div className="mb-6 flex flex-wrap gap-2">
        <Button size="lg" variant={ward === null ? "default" : "outline"} onClick={() => setWard(null)}>
          Semua ruangan
        </Button>
        {wards.map((w) => (
          <Button key={w} size="lg" variant={ward === w ? "default" : "outline"} onClick={() => setWard(w)}>
            {w}
          </Button>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Sedang berjalan ({running.length})</h2>
        {running.length === 0 ? (
          <Card>
            <EmptyState icon={HeartPulse} title="Tidak ada transfusi yang berjalan" />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {running.map((e) => (
              <Link key={e.issue_item_id} href={`/transfusions/${e.transfusion_id}`}>
                <EntryCard entry={e} running />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Menunggu transfusi ({waiting.length})</h2>
        {waiting.length === 0 ? (
          <Card>
            <EmptyState title="Tidak ada kantong yang menunggu" description="Kantong muncul di sini setelah diserahkan BDRS ke ruangan." />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {waiting.map((e) => (
              <EntryCard key={e.issue_item_id} entry={e} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function EntryCard({ entry: e, running }: { entry: WorklistEntry; running?: boolean }) {
  return (
    <Card className={cn("h-full transition-colors", running ? "border-sky-300 hover:border-sky-500" : "")}>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold leading-tight">{e.patient_name}</p>
            <p className="font-mono text-sm text-muted-foreground">{e.patient_mrn}</p>
          </div>
          <BloodGroupChip abo={e.patient_abo} rh={e.patient_rh} size="lg" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-muted px-2 py-0.5">{e.ward}</span>
          <StatusBadge map={priority} value={e.priority} />
        </div>
        <div className="rounded-md border p-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold">{e.product_no}</span>
            <BloodGroupChip abo={e.product_abo} rh={e.product_rh} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">
            {e.component_code} · diserahkan {fmtTime(e.issued_at)} · kedaluwarsa {fmtCountdown(e.expires_at)}
          </p>
        </div>
        {running ? (
          <p className="flex items-center gap-2 font-medium text-sky-700">
            <Timer className="size-4" />
            Berjalan {e.started_at ? fmtDuration(e.started_at) : ""}
          </p>
        ) : (
          <Button size="lg" className="h-12 w-full text-base" asChild>
            <Link href={`/transfusions/start/${e.issue_item_id}`}>
              <Play />
              Mulai transfusi
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
