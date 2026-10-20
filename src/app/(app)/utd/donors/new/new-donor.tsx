"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { apiPost } from "@/lib/api";
import type { DonorDetail } from "@/lib/types";
import { DonorForm } from "../donor-form";

export function NewDonor() {
  const router = useRouter();
  const qc = useQueryClient();
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
            onSubmit={async (values) => {
              try {
                const d = await apiPost<DonorDetail>("/api/v1/donors", values);
                await qc.invalidateQueries({ queryKey: ["donors"] });
                toast.success(`Pendonor ${d.donor_no} berhasil didaftarkan.`);
                router.push(`/utd/donors/${d.id}`);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
                throw err;
              }
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
