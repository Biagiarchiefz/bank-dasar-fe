"use client";

import { Ban, CheckCircle2, CircleDashed, PackageCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ProductStatus } from "@/components/data-display/status-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageSkeleton } from "@/components/feedback/loading";
import { Field } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ProductLabel } from "@/features/inventory";
import { cn } from "@/lib/utils";
import { useReleaseChecklist, useReleaseDecision } from "../hooks/use-release";

export function ReleaseDecision() {
  const { productId } = useParams<{ productId: string }>();
  const id = Number(productId);
  const router = useRouter();
  const { data, isLoading, error } = useReleaseChecklist(id);
  const [manual, setManual] = useState<Record<string, boolean>>({ VISUAL_OK: false, LABEL_OK: false });
  const [reason, setReason] = useState("");

  const decide = useReleaseDecision(id, () => router.push("/utd/release"));
  const decideAs = (decision: "RELEASED" | "REJECTED") =>
    decide.mutate({ decision, manual_checks: manual, reason: decision === "REJECTED" ? reason : null });

  if (isLoading) return <PageSkeleton />;
  if (!data) return <ErrorAlert error={error} />;
  const p = data.product;
  const allPass = data.items.every((it) => (it.auto ? it.passed : manual[it.key]));

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{p.product_no}</span>}
        description={`${p.component_name} · ${p.facility_name}`}
        back={{ href: "/utd/release", label: "Pelulusan" }}
        actions={<ProductStatus quality={p.quality_status} inventory={p.inventory_status} expired={p.is_expired} />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checklist pelulusan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.items.map((it) => {
                const passed = it.auto ? it.passed : manual[it.key];
                return (
                  <div
                    key={it.key}
                    className={cn(
                      "flex items-center gap-3 rounded-md border p-3",
                      passed ? "border-emerald-200 bg-emerald-50/60" : it.auto ? "border-red-200 bg-red-50/60" : "",
                    )}
                  >
                    {it.auto ? (
                      passed ? (
                        <CheckCircle2 className="size-5 text-emerald-600" />
                      ) : (
                        <XCircle className="size-5 text-red-600" />
                      )
                    ) : (
                      <Checkbox
                        id={it.key}
                        disabled={!data.can_decide}
                        checked={manual[it.key]}
                        onCheckedChange={(c) => setManual((m) => ({ ...m, [it.key]: c === true }))}
                      />
                    )}
                    <label htmlFor={it.auto ? undefined : it.key} className="flex-1 text-sm font-medium">
                      {it.label}
                    </label>
                    <span className="text-xs text-muted-foreground">{it.auto ? "otomatis" : "manual"}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {!data.can_decide && (
            <Alert>
              <CircleDashed />
              <AlertTitle>Kantong ini tidak sedang menunggu keputusan</AlertTitle>
              <AlertDescription>
                Keputusan hanya untuk kantong karantina yang berada di stok UTD.{" "}
                <Link href={`/inventory/${p.id}`} className="font-medium underline">
                  Lihat detail kantong
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {data.can_decide && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Keputusan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {decide.error && <ErrorAlert error={decide.error} />}
                <div className="flex flex-wrap gap-3">
                  <ConfirmDialog
                    title={`Luluskan 1 kantong ${p.product_no}?`}
                    description="Kantong akan berstatus Lulus dan dapat didistribusikan."
                    confirmLabel="Luluskan"
                    onConfirm={() => decideAs("RELEASED")}
                    trigger={
                      <Button size="lg" disabled={!allPass || decide.isPending}>
                        <PackageCheck />
                        Luluskan
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title={`Tolak kantong ${p.product_no}?`}
                    description="Kantong yang ditolak tidak dapat digunakan. Keputusan ini final."
                    confirmLabel="Tolak"
                    destructive
                    disabled={reason.trim().length < 3}
                    onConfirm={() => decideAs("REJECTED")}
                    trigger={
                      <Button size="lg" variant="outline" className="text-destructive" disabled={decide.isPending}>
                        <Ban />
                        Tolak
                      </Button>
                    }
                  >
                    <Field label="Alasan penolakan" required>
                      <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="mis. Kantong bocor" />
                    </Field>
                  </ConfirmDialog>
                </div>
                {!allPass && (
                  <p className="text-sm text-muted-foreground">
                    Tombol Luluskan aktif setelah semua item checklist terpenuhi.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        <ProductLabel
          productNo={p.product_no}
          componentCode={p.component_code}
          abo={p.abo}
          rh={p.rh}
          collectedAt={p.collected_at}
          expiresAt={p.expires_at}
          facility={p.facility_name}
          volumeML={p.volume_ml}
        />
      </div>
    </>
  );
}
