"use client";

import { CheckCircle2, PackageCheck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { columnHelper, DataTable } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fmtCountdown, fmtDateTime } from "@/lib/format";
import type { ReleaseWorklistItem } from "@/types";
import { useBulkRelease, useReleaseWorklist } from "../hooks/use-release";

export function ReleaseWorklist() {
  const router = useRouter();
  const { data, isLoading } = useReleaseWorklist();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [visualOK, setVisualOK] = useState(false);
  const [labelOK, setLabelOK] = useState(false);

  const ready = (data ?? []).filter((p) => p.auto_checks_pass);
  const chosen = ready.filter((p) => selected.has(p.id));

  const bulk = useBulkRelease(() => {
    setSelected(new Set());
    setVisualOK(false);
    setLabelOK(false);
  });

  const columns = useMemo(() => {
    const col = columnHelper<ReleaseWorklistItem>();
    return [
      col.display({
        id: "select",
        header: "",
        cell: ({ row }) =>
          row.original.auto_checks_pass ? (
            <Checkbox
              aria-label="Pilih"
              checked={selected.has(row.original.id)}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={(c) =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (c === true) next.add(row.original.id);
                  else next.delete(row.original.id);
                  return next;
                })
              }
            />
          ) : null,
      }),
      col.display({
        id: "no",
        header: "Nomor kantong",
        cell: ({ row }) => <span className="font-mono font-semibold">{row.original.product_no}</span>,
      }),
      col.display({ id: "comp", header: "Komponen", cell: ({ row }) => row.original.component_code }),
      col.display({
        id: "group",
        header: "Golongan",
        cell: ({ row }) => <BloodGroupChip abo={row.original.abo} rh={row.original.rh} size="sm" />,
      }),
      col.display({ id: "collected", header: "Diambil", cell: ({ row }) => fmtDateTime(row.original.collected_at) }),
      col.display({
        id: "expires",
        header: "Kedaluwarsa",
        cell: ({ row }) => <span className="text-sm">{fmtCountdown(row.original.expires_at)}</span>,
      }),
      col.display({
        id: "ready",
        header: "Siap dilulus",
        cell: ({ row }) =>
          row.original.auto_checks_pass ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="size-4" /> Ya
            </span>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-red-700">
                  <XCircle className="size-4" /> Belum
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <ul className="list-disc pl-4">
                  {row.original.failed_checks.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          ),
      }),
    ];
  }, [selected]);

  return (
    <>
      <PageHeader
        title="Pelulusan produk"
        description="Kantong karantina di UTD. Luluskan hanya bila semua syarat checklist terpenuhi."
        actions={
          chosen.length > 0 && (
            <ConfirmDialog
              title={`Luluskan ${chosen.length} kantong?`}
              description="Aturan yang sama dengan pelulusan satu per satu diterapkan ke setiap kantong."
              confirmLabel="Luluskan"
              disabled={!visualOK || !labelOK}
              onConfirm={() =>
                bulk.mutate({
                  product_ids: chosen.map((p) => p.id),
                  manual_checks: { VISUAL_OK: visualOK, LABEL_OK: labelOK },
                })
              }
              trigger={
                <Button>
                  <PackageCheck />
                  Luluskan terpilih ({chosen.length})
                </Button>
              }
            >
              <div className="space-y-2 rounded-md border p-3">
                <p className="text-sm font-medium">Pemeriksaan manual untuk semua kantong terpilih</p>
                <Label className="flex items-center gap-2 font-normal">
                  <Checkbox checked={visualOK} onCheckedChange={(c) => setVisualOK(c === true)} />
                  Kemasan utuh, tidak bocor, warna normal
                </Label>
                <Label className="flex items-center gap-2 font-normal">
                  <Checkbox checked={labelOK} onCheckedChange={(c) => setLabelOK(c === true)} />
                  Label sesuai identitas produk
                </Label>
                <ul className="max-h-32 overflow-y-auto font-mono text-xs text-muted-foreground">
                  {chosen.map((p) => (
                    <li key={p.id}>{p.product_no}</li>
                  ))}
                </ul>
              </div>
            </ConfirmDialog>
          )
        }
      />
      {ready.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <Checkbox
            id="select-all"
            checked={chosen.length === ready.length}
            onCheckedChange={(c) => setSelected(c === true ? new Set(ready.map((p) => p.id)) : new Set())}
          />
          <Label htmlFor="select-all" className="font-normal">
            Pilih semua yang siap ({ready.length})
          </Label>
        </div>
      )}
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        onRowClick={(p) => router.push(`/utd/release/${p.id}`)}
        empty={<EmptyState icon={PackageCheck} title="Tidak ada kantong yang menunggu pelulusan" />}
      />
    </>
  );
}
