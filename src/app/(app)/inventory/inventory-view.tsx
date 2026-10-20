"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, Trash2, Warehouse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { columnHelper, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Field } from "@/components/shared/field";
import { PageHeader } from "@/components/shared/page-header";
import { ProductStatus } from "@/components/shared/status-badge";
import { StockMatrix } from "@/components/shared/stock-matrix";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiList, apiPost } from "@/lib/api";
import { fmtCountdown, fmtDateTime } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { useFacilityParam, useSession } from "@/lib/session";
import type { Product } from "@/lib/types";
import { useApiMutation } from "@/lib/use-api-mutation";
import { useDebounced } from "@/lib/use-debounced";
import { cn } from "@/lib/utils";

const ANY = "any";

type Filters = { component: string; group: string; quality: string; inventory: string; special: string };
const initialFilters: Filters = { component: ANY, group: ANY, quality: ANY, inventory: "IN_STOCK", special: ANY };

function canDiscard(p: Product) {
  return p.inventory_status === "IN_STOCK" && (p.quality_status !== "RELEASED" || p.is_expired);
}

export function InventoryView() {
  const router = useRouter();
  const { me } = useSession();
  const facilityId = useFacilityParam();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const search = useDebounced(q);
  const [discardFor, setDiscardFor] = useState<Product | null>(null);
  const [reason, setReason] = useState("");
  const mayDiscard = ["ADMIN", "LAB_UTD", "PETUGAS_BDRS"].includes(me.role);

  const set = (patch: Partial<Filters>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };
  const [abo, rh] = f.group === ANY ? [undefined, undefined] : f.group.split("|");
  const params = {
    q: search,
    facility_id: facilityId,
    component: f.component === ANY ? undefined : f.component,
    abo,
    rh,
    quality_status: f.quality === ANY ? undefined : f.quality,
    inventory_status: f.inventory === ANY ? undefined : f.inventory,
    usable: f.special === "usable" ? true : undefined,
    expiring_days: f.special === "expiring" ? 3 : undefined,
    page,
    page_size: 20,
  };
  const { data, isLoading } = useQuery({
    queryKey: qk.products(params),
    queryFn: () => apiList<Product>("/api/v1/products", params),
    placeholderData: keepPreviousData,
  });

  const discard = useApiMutation({
    mutationFn: (p: Product) => apiPost<Product>(`/api/v1/products/${p.id}/discard`, { reason }),
    success: (p) => `${p.product_no} dimusnahkan.`,
    invalidate: [["products"], ["stock"], ["dashboard"]],
    onSuccess: () => {
      setDiscardFor(null);
      setReason("");
    },
  });

  const columns = useMemo(() => {
    const col = columnHelper<Product>();
    return [
      col.display({
        id: "no",
        header: "Nomor kantong",
        cell: ({ row }) => (
          <div>
            <p className="font-mono font-semibold">{row.original.product_no}</p>
            <p className="text-xs text-muted-foreground">{row.original.component_name}</p>
          </div>
        ),
      }),
      col.display({
        id: "group",
        header: "Golongan",
        cell: ({ row }) => <BloodGroupChip abo={row.original.abo} rh={row.original.rh} size="sm" />,
      }),
      col.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <ProductStatus
            quality={row.original.quality_status}
            inventory={row.original.inventory_status}
            expired={row.original.is_expired}
          />
        ),
      }),
      col.display({
        id: "where",
        header: "Lokasi",
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{row.original.facility_name}</p>
            <p className="text-xs text-muted-foreground">{row.original.location_name ?? "—"}</p>
          </div>
        ),
      }),
      col.display({
        id: "expires",
        header: "Kedaluwarsa",
        cell: ({ row }) => (
          <div className={cn("text-sm", row.original.is_expired && "font-medium text-red-700")}>
            <p>{fmtDateTime(row.original.expires_at)}</p>
            <p className="text-xs text-muted-foreground">{fmtCountdown(row.original.expires_at)}</p>
          </div>
        ),
      }),
      col.display({
        id: "actions",
        header: "",
        cell: ({ row }) =>
          mayDiscard && canDiscard(row.original) ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDiscardFor(row.original);
              }}
            >
              <Trash2 />
              Musnahkan
            </Button>
          ) : null,
      }),
    ];
  }, [mayDiscard]);

  return (
    <>
      <PageHeader title="Stok darah" description="Satu baris = satu kantong fisik, dengan status mutu dan status stok terpisah." />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Matriks stok siap pakai</CardTitle>
        </CardHeader>
        <CardContent>
          <StockMatrix
            facilityId={facilityId}
            onCellClick={(component, a, r) =>
              set({ component, group: `${a}|${r}`, special: "usable", quality: ANY, inventory: ANY })
            }
          />
        </CardContent>
      </Card>

      <div className="mb-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <div className="relative md:col-span-3 xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Nomor kantong atau donasi…"
            className="pl-9"
          />
        </div>
        <FilterSelect
          value={f.component}
          onChange={(v) => set({ component: v })}
          options={[[ANY, "Semua komponen"], ["WB", "WB"], ["PRC", "PRC"], ["TC", "TC"], ["FFP", "FFP"]]}
        />
        <FilterSelect
          value={f.group}
          onChange={(v) => set({ group: v })}
          options={[
            [ANY, "Semua golongan"],
            ...["O|POS", "O|NEG", "A|POS", "A|NEG", "B|POS", "B|NEG", "AB|POS", "AB|NEG"].map(
              (g): [string, string] => [g, g.replace("|POS", "+").replace("|NEG", "−")],
            ),
          ]}
        />
        <FilterSelect
          value={f.quality}
          onChange={(v) => set({ quality: v })}
          options={[[ANY, "Semua status mutu"], ["HOLD", "Karantina"], ["RELEASED", "Lulus"], ["REJECTED", "Ditolak"]]}
        />
        <FilterSelect
          value={f.inventory}
          onChange={(v) => set({ inventory: v })}
          options={[
            [ANY, "Semua status stok"],
            ["IN_STOCK", "Di stok"],
            ["RESERVED", "Dipesan"],
            ["IN_TRANSIT", "Dalam pengiriman"],
            ["ISSUED", "Diserahkan"],
            ["TRANSFUSED", "Ditransfusikan"],
            ["PROCESSED", "Diolah"],
            ["DISCARDED", "Dimusnahkan"],
          ]}
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          [ANY, "Semua"],
          ["usable", "Siap pakai"],
          ["expiring", "Akan kedaluwarsa ≤ 3 hari"],
        ].map(([v, l]) => (
          <Button
            key={v}
            size="sm"
            variant={f.special === v ? "default" : "outline"}
            onClick={() => set({ special: v, ...(v !== ANY ? { inventory: ANY, quality: ANY } : {}) })}
          >
            {l}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => set(initialFilters)}>
          Atur ulang filter
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        loading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
        onRowClick={(p) => router.push(`/inventory/${p.id}`)}
        empty={<EmptyState icon={Warehouse} title="Tidak ada kantong sesuai filter" />}
      />

      <ConfirmDialog
        open={discardFor !== null}
        onOpenChange={(o) => !o && setDiscardFor(null)}
        title={`Musnahkan ${discardFor?.product_no}?`}
        description="Kantong yang dimusnahkan tidak dapat dikembalikan ke stok."
        confirmLabel="Musnahkan"
        destructive
        disabled={reason.trim().length < 3 || discard.isPending}
        onConfirm={() => discardFor && discard.mutate(discardFor)}
      >
        <Field label="Alasan pemusnahan" required>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="mis. Kedaluwarsa" />
        </Field>
      </ConfirmDialog>
    </>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
