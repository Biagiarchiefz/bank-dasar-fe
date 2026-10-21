"use client";

import { Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { columnHelper, DataTable } from "@/components/data-display/data-table";
import { StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGE_SIZE } from "@/lib/constants";
import { fmtDateTime, transferStatus } from "@/lib/format";
import { useSession } from "@/store/session";
import type { Transfer } from "@/types";
import { useTransfers } from "../hooks/use-transfers";

const col = columnHelper<Transfer>();
const columns = [
  col.display({
    id: "no",
    header: "Nomor kiriman",
    cell: ({ row }) => <span className="font-mono font-semibold">{row.original.transfer_no}</span>,
  }),
  col.display({
    id: "route",
    header: "Rute",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.from_facility_name} → {row.original.to_facility_name}
      </span>
    ),
  }),
  col.display({
    id: "items",
    header: "Kantong",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.item_count}
        {row.original.rejected_count > 0 && <span className="text-red-700"> ({row.original.rejected_count} ditolak)</span>}
      </span>
    ),
  }),
  col.display({ id: "sent", header: "Dikirim", cell: ({ row }) => fmtDateTime(row.original.sent_at) }),
  col.display({ id: "received", header: "Diterima", cell: ({ row }) => fmtDateTime(row.original.received_at) }),
  col.display({ id: "courier", header: "Kurir", cell: ({ row }) => row.original.courier_name ?? "—" }),
  col.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge map={transferStatus} value={row.original.status} />,
  }),
];

export function TransferList() {
  const router = useRouter();
  const { me } = useSession();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTransfers({ status: status === "all" ? undefined : status, page, page_size: PAGE_SIZE });
  const canSend = me.role === "ADMIN" || me.role === "LAB_UTD";

  return (
    <>
      <PageHeader
        title="Distribusi UTD → BDRS"
        description="Pengiriman kantong siap pakai dari UTD dan penerimaannya di BDRS."
        actions={
          canSend && (
            <Button asChild>
              <Link href="/transfers/new">
                <Truck />
                Buat kiriman
              </Link>
            </Button>
          )
        }
      />
      <Tabs
        value={status}
        onValueChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="IN_TRANSIT">Dalam pengiriman</TabsTrigger>
          <TabsTrigger value="RECEIVED">Diterima</TabsTrigger>
          <TabsTrigger value="PARTIAL">Diterima sebagian</TabsTrigger>
        </TabsList>
      </Tabs>
      <DataTable
        columns={columns}
        data={data?.data}
        loading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
        onRowClick={(t) => router.push(`/transfers/${t.id}`)}
        empty={<EmptyState icon={Truck} title="Belum ada kiriman" />}
      />
    </>
  );
}
