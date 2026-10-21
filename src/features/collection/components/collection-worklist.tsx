"use client";

import { Droplets, Syringe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { columnHelper, DataTable } from "@/components/data-display/data-table";
import { StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Field } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { donationStatus, fmtTime, labStatus, todayWIB } from "@/lib/format";
import type { Donation, Visit } from "@/types";
import { useDonations, useEligibleVisits, useStartDonation } from "../hooks/use-collection";

const bagTypes = ["Kantong ganda 350 mL", "Kantong tripel 450 mL", "Kantong kuadrupel 450 mL"];

const dcol = columnHelper<Donation>();
const donationColumns = [
  dcol.display({
    id: "no",
    header: "Nomor donasi",
    cell: ({ row }) => <span className="font-mono font-semibold">{row.original.donation_no}</span>,
  }),
  dcol.display({
    id: "donor",
    header: "Pendonor",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.donor_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.donor_no}</p>
      </div>
    ),
  }),
  dcol.display({ id: "start", header: "Mulai", cell: ({ row }) => fmtTime(row.original.started_at) }),
  dcol.display({
    id: "volume",
    header: "Volume",
    cell: ({ row }) => (row.original.volume_ml ? `${row.original.volume_ml} mL` : "—"),
  }),
  dcol.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <StatusBadge map={donationStatus} value={row.original.status} />
        {row.original.lab_status && <StatusBadge map={labStatus} value={row.original.lab_status} />}
      </div>
    ),
  }),
];

export function CollectionWorklist() {
  const router = useRouter();
  const [startFor, setStartFor] = useState<Visit | null>(null);
  const [bagType, setBagType] = useState(bagTypes[1]);
  const today = todayWIB();

  const eligible = useEligibleVisits();
  const inProgress = useDonations({ status: "IN_PROGRESS", page_size: 100 });
  const todays = useDonations({ date: today, page_size: 100 });
  const start = useStartDonation((d) => router.push(`/utd/collection/${d.id}`));

  const visitColumns = useMemo(() => {
    const vcol = columnHelper<Visit>();
    return [
    vcol.display({
      id: "donor",
      header: "Pendonor",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.donor_name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.visit_no}</p>
        </div>
      ),
    }),
    vcol.display({
      id: "group",
      header: "Golongan",
      cell: ({ row }) => <BloodGroupChip abo={row.original.donor_abo} rh={row.original.donor_rh} />,
    }),
    vcol.display({
      id: "vitals",
      header: "Hb / TD",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.hb_g_dl} g/dL · {row.original.systolic}/{row.original.diastolic}
        </span>
      ),
    }),
    vcol.display({ id: "screened", header: "Diskrining", cell: ({ row }) => fmtTime(row.original.screened_at) }),
    vcol.display({
      id: "action",
      header: "",
      cell: ({ row }) =>
        row.original.donation_id ? (
          <Button size="sm" variant="outline" onClick={() => router.push(`/utd/collection/${row.original.donation_id}`)}>
            Buka donasi
          </Button>
        ) : (
          <Button size="sm" onClick={() => setStartFor(row.original)}>
            <Syringe />
            Mulai pengambilan
          </Button>
        ),
    }),
    ];
  }, [router]);

  return (
    <>
      <PageHeader title="Pengambilan darah" description="Pendonor yang dinyatakan layak dan siap diambil darahnya." />
      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Siap diambil</h2>
          <DataTable
            columns={visitColumns}
            data={eligible.data?.data}
            loading={eligible.isLoading}
            empty={<EmptyState icon={Syringe} title="Tidak ada pendonor yang menunggu pengambilan" />}
          />
        </section>
        {(inProgress.data?.data.length ?? 0) > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Sedang berlangsung</h2>
            <DataTable
              columns={donationColumns}
              data={inProgress.data?.data}
              onRowClick={(d) => router.push(`/utd/collection/${d.id}`)}
            />
          </section>
        )}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Donasi hari ini</h2>
          <DataTable
            columns={donationColumns}
            data={todays.data?.data}
            loading={todays.isLoading}
            onRowClick={(d) => router.push(`/utd/collection/${d.id}`)}
            empty={<EmptyState icon={Droplets} title="Belum ada donasi hari ini" />}
          />
        </section>
      </div>

      <Dialog open={startFor !== null} onOpenChange={(o) => !o && setStartFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mulai pengambilan darah</DialogTitle>
            <DialogDescription>
              {startFor?.donor_name} ({startFor?.visit_no}). Nomor donasi dibuat otomatis.
            </DialogDescription>
          </DialogHeader>
          <Field label="Jenis kantong" required>
            <Select value={bagType} onValueChange={setBagType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bagTypes.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartFor(null)}>
              Batal
            </Button>
            <Button
              disabled={start.isPending}
              onClick={() => startFor && start.mutate({ visitId: startFor.id, bag: bagType })}
            >
              Mulai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
