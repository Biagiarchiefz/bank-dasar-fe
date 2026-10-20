"use client";

import { useQuery } from "@tanstack/react-query";
import { Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Field } from "@/components/shared/field";
import { RowsSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiGet, apiList, apiPost } from "@/lib/api";
import { fmtCountdown } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/lib/session";
import type { Product, TransferDetail } from "@/lib/types";
import { useApiMutation } from "@/lib/use-api-mutation";

export function NewTransfer() {
  const router = useRouter();
  const { facilities } = useSession();
  const utd = facilities.find((f) => f.type === "UTD");
  const bdrs = facilities.find((f) => f.type === "BDRS");
  const [picked, setPicked] = useState<Map<number, Product>>(new Map());
  const [courier, setCourier] = useState("");
  const [temp, setTemp] = useState("4");
  const [notes, setNotes] = useState("");

  const filters = { facility_id: utd?.id, usable: true, page_size: 100, sort: "expires_at" };
  const stock = useQuery({
    queryKey: qk.products(filters),
    queryFn: () => apiList<Product>("/api/v1/products", filters),
    enabled: !!utd,
  });

  function add(p: Product) {
    if (!p.is_usable || p.facility_type !== "UTD") {
      toast.error(`${p.product_no} tidak siap pakai di UTD dan tidak dapat dikirim.`);
      return;
    }
    setPicked((prev) => new Map(prev).set(p.id, p));
  }
  function remove(id: number) {
    setPicked((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  async function scan(code: string) {
    try {
      add(await apiGet<Product>(`/api/v1/products/by-number/${encodeURIComponent(code)}`));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kantong tidak ditemukan.");
    }
  }

  const send = useApiMutation({
    mutationFn: () =>
      apiPost<TransferDetail>("/api/v1/transfers", {
        to_facility_id: bdrs?.id,
        product_ids: [...picked.keys()],
        courier_name: courier,
        packing_temp_c: Number(temp.replace(",", ".")),
        notes: notes.trim() || null,
      }),
    success: (t) => `Kiriman ${t.transfer_no} dibuat (${t.item_count} kantong).`,
    invalidate: [["transfers"], ["products"], ["stock"], ["dashboard"]],
    onSuccess: (t) => router.push(`/transfers/${t.id}`),
  });

  const valid = picked.size > 0 && courier.trim().length >= 3 && temp.trim() !== "" && !!bdrs;

  return (
    <>
      <PageHeader
        title="Buat kiriman ke BDRS"
        description="Pindai kantong siap pakai di UTD atau pilih dari daftar stok."
        back={{ href: "/transfers", label: "Distribusi" }}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <BarcodeInput onScan={scan} buttonLabel="Tambah" />
          <Card className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Stok siap pakai di UTD</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stock.isLoading && <RowsSkeleton />}
              {stock.data?.data.length === 0 && <EmptyState title="Tidak ada kantong siap pakai di UTD" />}
              <ul className="max-h-[480px] divide-y overflow-y-auto">
                {stock.data?.data.map((p) => (
                  <li key={p.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-muted/40">
                      <Checkbox
                        checked={picked.has(p.id)}
                        onCheckedChange={(c) => (c === true ? add(p) : remove(p.id))}
                      />
                      <span className="flex-1 font-mono text-sm font-medium">{p.product_no}</span>
                      <span className="w-12 text-sm">{p.component_code}</span>
                      <BloodGroupChip abo={p.abo} rh={p.rh} size="sm" />
                      <span className="w-28 text-right text-xs text-muted-foreground">{fmtCountdown(p.expires_at)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-20">
          <CardHeader>
            <CardTitle className="text-base">Kiriman ({picked.size} kantong)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {picked.size === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada kantong dipilih.</p>
            ) : (
              <ul className="max-h-56 space-y-1 overflow-y-auto">
                {[...picked.values()].map((p) => (
                  <li key={p.id} className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm">
                    <span className="flex-1 font-mono">{p.product_no}</span>
                    <BloodGroupChip abo={p.abo} rh={p.rh} size="sm" />
                    <Button variant="ghost" size="icon-xs" onClick={() => remove(p.id)} aria-label="Hapus">
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Field label="Tujuan">
              <Input value={bdrs?.name ?? "—"} disabled />
            </Field>
            <Field label="Nama kurir" htmlFor="courier" required>
              <Input id="courier" value={courier} onChange={(e) => setCourier(e.target.value)} />
            </Field>
            <Field label="Suhu kemas (°C)" htmlFor="temp" required hint="Kotak pendingin 2–6 °C untuk sel darah merah">
              <Input id="temp" inputMode="decimal" value={temp} onChange={(e) => setTemp(e.target.value)} />
            </Field>
            <Field label="Catatan" htmlFor="notes">
              <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            {send.error && <ErrorAlert error={send.error} />}
            <ConfirmDialog
              title={`Kirim ${picked.size} kantong ke ${bdrs?.name}?`}
              description="Kantong akan berstatus 'Dalam pengiriman' dan tidak dihitung sebagai stok siap pakai sampai diterima."
              confirmLabel="Kirim"
              onConfirm={() => send.mutate()}
              trigger={
                <Button className="w-full" size="lg" disabled={!valid || send.isPending}>
                  <Truck />
                  Kirim
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
