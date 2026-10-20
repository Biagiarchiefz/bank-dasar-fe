"use client";

import { HandHeart, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BloodGroupChip } from "@/components/shared/blood-group-chip";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Field } from "@/components/shared/field";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";
import { fmtCountdown, fmtDateTime, transfusionStatus } from "@/lib/format";
import type { IssueDetail, RequestDetail } from "@/lib/types";
import { useApiMutation } from "@/lib/use-api-mutation";
import { requestInvalidations } from "./invalidations";

export function IssueTab({ request: r, canProcess }: { request: RequestDetail; canProcess: boolean }) {
  const active = r.allocations.filter((a) => a.status === "ACTIVE");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [receiver, setReceiver] = useState("");
  const [notes, setNotes] = useState("");
  const chosen = active.filter((a) => selected.has(a.id));

  const issue = useApiMutation({
    mutationFn: () =>
      apiPost<IssueDetail>(`/api/v1/bdrs/requests/${r.id}/issues`, {
        allocation_ids: chosen.map((a) => a.id),
        received_by_name: receiver,
        notes: notes || null,
      }),
    success: (i) => `Serah terima ${i.issue_no} tercatat (${i.items.length} kantong).`,
    invalidate: requestInvalidations,
    onSuccess: () => {
      setSelected(new Set());
      setReceiver("");
      setNotes("");
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        {r.issues.length === 0 && (
          <Card>
            <EmptyState icon={HandHeart} title="Belum ada serah terima" description="Kantong yang sudah dialokasikan dapat diserahkan ke ruangan." />
          </Card>
        )}
        {r.issues.map((iss) => (
          <Card key={iss.id}>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-semibold">{iss.issue_no}</span>
                <span className="text-sm text-muted-foreground">
                  {fmtDateTime(iss.issued_at)} · oleh {iss.issued_by_name} · diterima {iss.received_by_name} ({iss.ward})
                </span>
                <Button size="sm" variant="outline" className="ml-auto" asChild>
                  <Link href={`/bdrs/issues/${iss.id}`}>
                    <Printer />
                    Bukti serah terima
                  </Link>
                </Button>
              </div>
              <ul className="space-y-1">
                {iss.items.map((it) => (
                  <li key={it.id} className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 px-2 py-1 text-sm">
                    <span className="font-mono">{it.product.product_no}</span>
                    <BloodGroupChip abo={it.product.abo} rh={it.product.rh} size="sm" />
                    {it.transfusion_status ? (
                      <StatusBadge map={transfusionStatus} value={it.transfusion_status} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Belum ditransfusikan</span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {canProcess && active.length > 0 && (
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Serahkan ke ruangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1">
              {active.map((a) => (
                <li key={a.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox
                      checked={selected.has(a.id)}
                      onCheckedChange={(c) =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (c === true) next.add(a.id);
                          else next.delete(a.id);
                          return next;
                        })
                      }
                    />
                    <span className="flex-1 font-mono">{a.product.product_no}</span>
                    <BloodGroupChip abo={a.product.abo} rh={a.product.rh} size="sm" />
                    <span className="text-xs text-muted-foreground">{fmtCountdown(a.product.expires_at)}</span>
                  </label>
                </li>
              ))}
            </ul>
            <Field label="Diterima oleh (petugas ruangan)" required>
              <Input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="mis. Ns. Wahyu" />
            </Field>
            <Field label="Catatan">
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            {issue.error && <ErrorAlert error={issue.error} />}
            <ConfirmDialog
              title={`Serahkan ${chosen.length} kantong ke ${r.ward}?`}
              description={`Untuk ${r.patient.full_name} (${r.patient.mrn}), diterima oleh ${receiver}.`}
              confirmLabel="Serahkan"
              onConfirm={() => issue.mutate()}
              trigger={
                <Button className="w-full" disabled={chosen.length === 0 || receiver.trim().length < 3 || issue.isPending}>
                  <HandHeart />
                  Serahkan
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
