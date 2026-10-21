"use client";

import { Stethoscope, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { columnHelper, DataTable } from "@/components/data-display/data-table";
import { StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtTime, genderLabel, todayWIB, visitStatus } from "@/lib/format";
import type { Visit } from "@/types";
import { useVisits } from "../hooks/use-screening";

const col = columnHelper<Visit>();
const columns = [
  col.display({
    id: "time",
    header: "Jam",
    cell: ({ row }) => <span className="tabular-nums">{fmtTime(row.original.visit_at)}</span>,
  }),
  col.display({
    id: "visit",
    header: "Kunjungan",
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.visit_no}</span>,
  }),
  col.display({
    id: "donor",
    header: "Pendonor",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.donor_name}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.donor_no} · {genderLabel[row.original.donor_gender]}
        </p>
      </div>
    ),
  }),
  col.display({
    id: "group",
    header: "Golongan",
    cell: ({ row }) => <BloodGroupChip abo={row.original.donor_abo} rh={row.original.donor_rh} />,
  }),
  col.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge map={visitStatus} value={row.original.status} />,
  }),
];

export function ScreeningWorklist() {
  const router = useRouter();
  const today = todayWIB();
  const { data, isLoading } = useVisits({ date: today, page_size: 100 });
  const waiting = data?.data.filter((v) => v.status === "REGISTERED");
  const done = data?.data.filter((v) => v.status !== "REGISTERED");

  return (
    <>
      <PageHeader
        title="Seleksi donor"
        description="Kunjungan hari ini yang menunggu kuesioner dan pemeriksaan kesehatan."
        actions={
          <Button variant="outline" asChild>
            <Link href="/utd/donors">
              <UserPlus />
              Daftarkan kunjungan
            </Link>
          </Button>
        }
      />
      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Menunggu skrining ({waiting?.length ?? 0})</h2>
          <DataTable
            columns={columns}
            data={waiting}
            loading={isLoading}
            onRowClick={(v) => router.push(`/utd/screening/${v.id}`)}
            empty={
              <EmptyState
                icon={Stethoscope}
                title="Tidak ada pendonor yang menunggu"
                description="Daftarkan kunjungan dari halaman profil pendonor."
              />
            }
          />
        </section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sudah diskrining hari ini</CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4">
            <DataTable
              columns={columns}
              data={done}
              loading={isLoading}
              onRowClick={(v) => router.push(`/utd/screening/${v.id}`)}
              empty={<EmptyState title="Belum ada" />}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
