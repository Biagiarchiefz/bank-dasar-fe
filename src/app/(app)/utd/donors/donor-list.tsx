"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { columnHelper, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pill } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiList } from "@/lib/api";
import { fmtCivilDate, fmtDate, genderLabel } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { Donor } from "@/lib/types";
import { useDebounced } from "@/lib/use-debounced";

const col = columnHelper<Donor>();
const columns = [
  col.display({
    id: "donor",
    header: "Pendonor",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.full_name}</p>
        <p className="font-mono text-xs text-muted-foreground">{row.original.donor_no}</p>
      </div>
    ),
  }),
  col.display({
    id: "group",
    header: "Golongan",
    cell: ({ row }) => <BloodGroupChip abo={row.original.abo} rh={row.original.rh} />,
  }),
  col.display({
    id: "identity",
    header: "Jenis kelamin / lahir",
    cell: ({ row }) => (
      <span className="text-sm">
        {genderLabel[row.original.gender]} · {fmtCivilDate(row.original.birth_date)}
      </span>
    ),
  }),
  col.display({
    id: "count",
    header: "Jumlah donor",
    cell: ({ row }) => <span className="tabular-nums">{row.original.donation_count}×</span>,
  }),
  col.display({
    id: "last",
    header: "Donor terakhir",
    cell: ({ row }) => fmtDate(row.original.last_donation_at),
  }),
  col.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const d = row.original;
      if (d.is_permanently_deferred) return <Pill tone="red" label="Tunda permanen" />;
      if (d.deferred_until) return <Pill tone="amber" label={`Tunda s.d. ${fmtCivilDate(d.deferred_until)}`} />;
      return <Pill tone="green" label="Aktif" />;
    },
  }),
];

const ANY = "any";

export function DonorList() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState(ANY);
  const [page, setPage] = useState(1);
  const search = useDebounced(q, 300);
  const [abo, rh] = group === ANY ? [undefined, undefined] : group.split("|");
  const filters = { q: search, abo, rh, page, page_size: 20 };

  const { data, isLoading } = useQuery({
    queryKey: qk.donors(filters),
    queryFn: () => apiList<Donor>("/api/v1/donors", filters),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader
        title="Pendonor"
        description="Cari pendonor terdaftar atau daftarkan pendonor baru."
        actions={
          <Button asChild>
            <Link href="/utd/donors/new">
              <UserPlus />
              Daftarkan pendonor
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, nomor pendonor, NIK, atau telepon…"
            className="pl-9"
            autoFocus
          />
        </div>
        <Select
          value={group}
          onValueChange={(v) => {
            setGroup(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Semua golongan</SelectItem>
            {["O|POS", "O|NEG", "A|POS", "A|NEG", "B|POS", "B|NEG", "AB|POS", "AB|NEG"].map((g) => {
              const [a, r] = g.split("|");
              return (
                <SelectItem key={g} value={g}>
                  {a}
                  {r === "POS" ? "+" : "−"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={data?.data}
        loading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
        onRowClick={(d) => router.push(`/utd/donors/${d.id}`)}
        empty={
          <EmptyState
            icon={Users}
            title={search ? "Pendonor tidak ditemukan" : "Belum ada pendonor"}
            description={search ? "Coba kata kunci lain atau daftarkan pendonor baru." : undefined}
          />
        }
      />
    </>
  );
}
