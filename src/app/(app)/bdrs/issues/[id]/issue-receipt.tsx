"use client";

import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useParams } from "next/navigation";
import { Barcode } from "@/components/shared/barcode";
import { ErrorAlert } from "@/components/shared/error-alert";
import { PageSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { bloodGroup, componentLabel, fmtDateTime } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { IssueDetail } from "@/lib/types";

/** Printable hand-over receipt (bukti serah terima) for the ward. */
export function IssueReceipt() {
  const { id } = useParams<{ id: string }>();
  const issueId = Number(id);
  const { data: iss, isLoading, error } = useQuery({
    queryKey: qk.issue(issueId),
    queryFn: () => apiGet<IssueDetail>(`/api/v1/bdrs/issues/${issueId}`),
  });
  if (isLoading) return <PageSkeleton />;
  if (!iss) return <ErrorAlert error={error} />;

  return (
    <>
      <PageHeader
        title="Bukti serah terima darah"
        back={{ href: `/bdrs/requests/${iss.request_id}`, label: iss.request.request_no }}
        actions={
          <Button onClick={() => window.print()}>
            <Printer />
            Cetak
          </Button>
        }
      />
      <article className="mx-auto max-w-3xl rounded-lg border bg-white p-8 text-zinc-900 shadow-sm print:border-0 print:shadow-none">
        <header className="flex items-start justify-between border-b pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">BDRS RS Demo</p>
            <h1 className="text-2xl font-bold">Bukti Serah Terima Darah</h1>
            <p className="font-mono text-sm">{iss.issue_no}</p>
          </div>
          <Barcode value={iss.issue_no} height={36} />
        </header>
        <section className="grid grid-cols-2 gap-x-8 gap-y-1 py-4 text-sm">
          <p>
            <span className="text-zinc-500">Pasien:</span> <b>{iss.patient.full_name}</b>
          </p>
          <p>
            <span className="text-zinc-500">No. RM:</span> <span className="font-mono">{iss.patient.mrn}</span>
          </p>
          <p>
            <span className="text-zinc-500">Golongan pasien:</span> <b>{bloodGroup(iss.patient.abo, iss.patient.rh) || "—"}</b>
          </p>
          <p>
            <span className="text-zinc-500">Permintaan:</span> <span className="font-mono">{iss.request.request_no}</span>
          </p>
          <p>
            <span className="text-zinc-500">Ruangan:</span> {iss.ward}
          </p>
          <p>
            <span className="text-zinc-500">DPJP:</span> {iss.request.doctor_name}
          </p>
          <p>
            <span className="text-zinc-500">Waktu serah:</span> {fmtDateTime(iss.issued_at)}
          </p>
        </section>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y bg-zinc-50 text-left">
              <th className="p-2">No.</th>
              <th className="p-2">Nomor kantong</th>
              <th className="p-2">Komponen</th>
              <th className="p-2">Golongan</th>
              <th className="p-2">Volume</th>
              <th className="p-2">Kedaluwarsa</th>
            </tr>
          </thead>
          <tbody>
            {iss.items.map((it, i) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-mono font-semibold">{it.product.product_no}</td>
                <td className="p-2">{componentLabel[it.product.component_code]}</td>
                <td className="p-2 font-bold">{bloodGroup(it.product.abo, it.product.rh)}</td>
                <td className="p-2">{it.product.volume_ml ? `${it.product.volume_ml} mL` : "—"}</td>
                <td className="p-2">{fmtDateTime(it.product.expires_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {iss.notes && <p className="mt-3 text-sm">Catatan: {iss.notes}</p>}
        <p className="mt-4 text-xs text-zinc-500">
          Lakukan verifikasi identitas pasien dan kantong di samping tempat tidur (bedside) sebelum transfusi dimulai.
        </p>
        <footer className="mt-10 grid grid-cols-2 gap-8 text-center text-sm">
          <div>
            <p>Yang menyerahkan (BDRS)</p>
            <p className="mt-16 border-t pt-1 font-medium">{iss.issued_by_name}</p>
          </div>
          <div>
            <p>Yang menerima (ruangan)</p>
            <p className="mt-16 border-t pt-1 font-medium">{iss.received_by_name}</p>
          </div>
        </footer>
      </article>
    </>
  );
}
