"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ClipboardCheck, FilePlus2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { columnHelper, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiList } from "@/lib/api";
import { fmtDateTime, priority, requestStatus } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { BloodRequest } from "@/lib/types";
import { useDebounced } from "@/lib/use-debounced";

const col = columnHelper<BloodRequest>();
const columns = [
  col.display({
    id: "no",
    header: "Permintaan",
    cell: ({ row }) => (
      <div>
        <p className="font-mono font-semibold">{row.original.request_no}</p>
        <p className="text-xs text-muted-foreground">{fmtDateTime(row.original.created_at)}</p>
      </div>
    ),
  }),
  col.display({
    id: "patient",
    header: "Pasien",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <BloodGroupChip abo={row.original.patient_abo} rh={row.original.patient_rh} size="sm" />
        <div>
          <p className="font-medium">{row.original.patient_name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.patient_mrn}</p>
        </div>
      </div>
    ),
  }),
  col.display({ id: "ward", header: "Ruangan", cell: ({ row }) => row.original.ward }),
  col.display({ id: "items", header: "Komponen", cell: ({ row }) => row.original.items_summary }),
  col.display({
    id: "progress",
    header: "Progres",
    cell: ({ row }) => {
      const r = row.original;
      const done = r.status === "COMPLETED" ? r.total_requested : r.total_allocated;
      return (
        <div className="w-28">
          <p className="text-xs tabular-nums text-muted-foreground">
            {done}/{r.total_requested} kantong
          </p>
          <Progress value={r.total_requested ? (done / r.total_requested) * 100 : 0} className="mt-1 h-1.5" />
        </div>
      );
    },
  }),
  col.display({
    id: "priority",
    header: "Prioritas",
    cell: ({ row }) => <StatusBadge map={priority} value={row.original.priority} />,
  }),
  col.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge map={requestStatus} value={row.original.status} />,
  }),
];

export function RequestList() {
  const router = useRouter();
  const [status, setStatus] = useState("ACTIVE");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebounced(q);
  const filters = { status: status === "all" ? undefined : status, q: search, page, page_size: 20 };
  const { data, isLoading } = useQuery({
    queryKey: qk.requests(filters),
    queryFn: () => apiList<BloodRequest>("/api/v1/bdrs/requests", filters),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });

  return (
    <>
      <PageHeader
        title="Permintaan darah"
        description="Permintaan dari ruangan: verifikasi, sampel, crossmatch/alokasi, dan serah terima."
        actions={
          <Button asChild>
            <Link href="/bdrs/requests/new">
              <FilePlus2 />
              Permintaan baru
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="ACTIVE">Aktif</TabsTrigger>
            <TabsTrigger value="NEW">Baru</TabsTrigger>
            <TabsTrigger value="READY">Siap diserahkan</TabsTrigger>
            <TabsTrigger value="COMPLETED">Selesai</TabsTrigger>
            <TabsTrigger value="all">Semua</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Cari pasien, RM, nomor, ruangan…"
            className="pl-9"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.data}
        loading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
        onRowClick={(r) => router.push(`/bdrs/requests/${r.id}`)}
        rowClassName={(r) => (r.priority === "EMERGENCY" && r.status !== "COMPLETED" ? "bg-red-50/60" : undefined)}
        empty={<EmptyState icon={ClipboardCheck} title="Tidak ada permintaan" />}
      />
    </>
  );
}
