"use client";

import { Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/store/session";

const ALL = "all";

/** Facility selector for ADMIN and PIMPINAN; others see their facility name. */
export function FacilitySwitcher() {
  const { me, facilities, facilityId, setFacilityId, canChooseFacility } = useSession();

  if (!canChooseFacility) {
    return (
      <span className="hidden items-center gap-1.5 text-sm text-muted-foreground md:inline-flex">
        <Building2 className="size-4" />
        {me.facility_name}
      </span>
    );
  }
  return (
    <Select
      value={facilityId === null ? ALL : String(facilityId)}
      onValueChange={(v) => setFacilityId(v === ALL ? null : Number(v))}
    >
      <SelectTrigger size="sm" className="w-[180px]" aria-label="Pilih fasilitas">
        <Building2 className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Semua fasilitas</SelectItem>
        {facilities.map((f) => (
          <SelectItem key={f.id} value={String(f.id)}>
            {f.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
