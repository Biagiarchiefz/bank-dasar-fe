"use client";

import { CalendarPlus, CircleAlert, CircleCheck, History, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageSkeleton } from "@/components/feedback/loading";
import { KeyValue } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ageFrom,
  donationStatus,
  fmtCivilDate,
  fmtDate,
  fmtDateTime,
  genderLabel,
  visitStatus,
} from "@/lib/format";
import { useDonor, useDonorHistory, useRegisterVisit, useUpdateDonor } from "../hooks/use-donors";
import { DonorForm } from "./donor-form";

export function DonorProfile() {
  const { id } = useParams<{ id: string }>();
  const donorId = Number(id);
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const donor = useDonor(donorId);
  const history = useDonorHistory(donorId);
  const register = useRegisterVisit(donorId, (v) => router.push(`/utd/screening/${v.id}`));
  const update = useUpdateDonor(donorId, () => setEditing(false));

  if (donor.isLoading) return <PageSkeleton />;
  if (donor.error || !donor.data) return <ErrorAlert error={donor.error} />;
  const d = donor.data;
  const e = d.eligibility;

  return (
    <>
      <PageHeader
        title={d.full_name}
        description={
          <span className="font-mono">
            {d.donor_no}
            {d.nik ? ` · NIK ${d.nik}` : ""}
          </span>
        }
        back={{ href: "/utd/donors", label: "Pendonor" }}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil />
              Ubah data
            </Button>
            {d.open_visit_id ? (
              <Button asChild>
                <Link href={`/utd/screening/${d.open_visit_id}`}>Buka kunjungan aktif</Link>
              </Button>
            ) : (
              <ConfirmDialog
                title="Daftarkan kunjungan donor?"
                description={`${d.full_name} (${d.donor_no}) akan didaftarkan untuk seleksi hari ini.`}
                confirmLabel="Daftarkan"
                onConfirm={() => register.mutate()}
                trigger={
                  <Button disabled={!e.can_register || register.isPending}>
                    <CalendarPlus />
                    Daftarkan kunjungan
                  </Button>
                }
              />
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil pendonor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <BloodGroupChip abo={d.abo} rh={d.rh} size="xl" />
                <div className="text-sm">
                  <p className="font-medium">{d.blood_group_confirmed ? "Golongan terkonfirmasi lab" : "Belum terkonfirmasi"}</p>
                  <p className="text-muted-foreground">{d.donation_count}× donor</p>
                </div>
              </div>
              <KeyValue
                items={[
                  ["Jenis kelamin", genderLabel[d.gender]],
                  ["Tanggal lahir", `${fmtCivilDate(d.birth_date)} (${ageFrom(d.birth_date)} th)`],
                  ["Telepon", d.phone ?? "—"],
                  ["Alamat", d.address ?? "—"],
                  ["Donor terakhir", fmtDate(d.last_donation_at)],
                  ["Terdaftar", fmtDate(d.created_at)],
                ]}
              />
            </CardContent>
          </Card>

          {e.can_register ? (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
              <CircleCheck />
              <AlertTitle>Dapat didaftarkan untuk donor hari ini</AlertTitle>
              <AlertDescription className="text-emerald-800">Lanjutkan dengan mendaftarkan kunjungan.</AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <CircleAlert />
              <AlertTitle>Belum dapat donor</AlertTitle>
              <AlertDescription className="text-amber-800">
                <ul className="list-disc pl-4">
                  {e.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                {e.next_eligible_date && <p className="mt-1">Dapat donor kembali mulai {fmtCivilDate(e.next_eligible_date)}.</p>}
              </AlertDescription>
            </Alert>
          )}
          {register.error && <ErrorAlert error={register.error} />}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4" />
              Riwayat kunjungan & donasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.data && history.data.visits.length === 0 && (
              <EmptyState title="Belum ada kunjungan" description="Riwayat akan muncul setelah kunjungan pertama." />
            )}
            <ol className="relative space-y-5 border-l pl-5">
              {history.data?.visits.map((v) => (
                <li key={v.id} className="relative">
                  <span className="absolute -left-[27px] top-1.5 size-3 rounded-full bg-primary ring-4 ring-card" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{v.visit_no}</span>
                    <StatusBadge map={visitStatus} value={v.status} />
                    {v.donation_status && <StatusBadge map={donationStatus} value={v.donation_status} />}
                    <span className="ml-auto text-xs text-muted-foreground">{fmtDateTime(v.visit_at)}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {v.hb_g_dl !== null && (
                      <span>
                        Hb {v.hb_g_dl} g/dL · TD {v.systolic}/{v.diastolic} · BB {v.weight_kg} kg
                      </span>
                    )}
                    {v.donation_no && (
                      <p>
                        Donasi <span className="font-mono">{v.donation_no}</span>
                        {v.donation_volume_ml ? ` · ${v.donation_volume_ml} mL` : ""}
                      </p>
                    )}
                    {v.deferral_reason && (
                      <p className="text-amber-700">
                        Ditunda {v.deferral_type === "PERMANENT" ? "permanen" : `sampai ${fmtCivilDate(v.deferral_until)}`}:{" "}
                        {v.deferral_reason}
                      </p>
                    )}
                    {v.decision_note && <p>{v.decision_note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ubah data pendonor</DialogTitle>
          </DialogHeader>
          <DonorForm
            initial={d}
            submitLabel="Simpan perubahan"
            onSubmit={update.mutateAsync}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
