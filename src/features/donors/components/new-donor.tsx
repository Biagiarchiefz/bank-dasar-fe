"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateDonor } from "../hooks/use-donors";
import { DonorForm } from "./donor-form";

export function NewDonor() {
  const router = useRouter();
  const create = useCreateDonor((d) => router.push(`/utd/donors/${d.id}`));
  return (
    <>
      <PageHeader
        title="Daftarkan pendonor"
        description="Nomor pendonor dibuat otomatis setelah data disimpan."
        back={{ href: "/utd/donors", label: "Pendonor" }}
      />
      <Card className="max-w-3xl">
        <CardContent>
          <DonorForm
            submitLabel="Simpan pendonor"
            onSubmit={create.mutateAsync}
          />
        </CardContent>
      </Card>
    </>
  );
}
