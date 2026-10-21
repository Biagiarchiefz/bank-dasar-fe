"use client";

import { FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { columnHelper, DataTable } from "@/components/data-display/data-table";
import { Pill, StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGE_SIZE } from "@/lib/constants";
import { fmtDateTime, labStatus } from "@/lib/format";
import type { LabResult, LabStatus } from "@/types";
import { useLabWorklist } from "../hooks/use-lab";

const col = columnHelper<LabResult>();
const columns = [
  col.display({
    id: "donation",
    header: "Nomor donasi",
    cell: ({ row }) => <span className="font-mono font-semibold">{row.original.donation_no}</span>,
  }),
  col.display({
    id: "donor",
    header: "Pendonor",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.donor_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.donor_no}</p>
      </div>
    ),
  }),
  col.display({ id: "collected", header: "Diambil", cell: ({ row }) => fmtDateTime(row.original.collected_at) }),
  col.display({
    id: "group",
    header: "Golongan (lab)",
    cell: ({ row }) => <BloodGroupChip abo={row.original.abo} rh={row.original.rh} />,
  }),
  col.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <StatusBadge map={labStatus} value={row.original.status} />
        {row.original.is_reactive && <Pill tone="red" label="Reaktif" />}
      </div>
    ),
  }),
];

const tabs: { value: LabStatus; label: string }[] = [
  { value: "PENDING", label: "Belum diperiksa" },
  { value: "ENTERED", label: "Menunggu validasi" },
  { value: "VALIDATED", label: "Selesai" },
];

export function LabWorklist() {
  const router = useRouter();
  const [status, setStatus] = useState<LabStatus>("PENDING");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useLabWorklist({ status, page, page_size: PAGE_SIZE });

  return (
    <>
      <PageHeader
        title="Laboratorium"
        description="Uji saring IMLTD (HIV, HBV, HCV, Sifilis) dan golongan darah ABO/Rh per donasi."
      />
      <Tabs
        value={status}
        onValueChange={(v) => {
          setStatus(v as LabStatus);
          setPage(1);
        }}
        className="mb-4"
      >
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DataTable
        columns={columns}
        data={data?.data}
        loading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
        onRowClick={(r) => router.push(`/utd/lab/${r.donation_id}`)}
        empty={<EmptyState icon={FlaskConical} title="Tidak ada sampel pada daftar ini" />}
      />
    </>
  );
}
