// Account rules shared by the user list and form (mirrors POST /admin/users).

import type { Account, Facility, Role } from "@/types";

export const roles = [
  "PETUGAS_UTD",
  "LAB_UTD",
  "PETUGAS_BDRS",
  "PERAWAT",
  "PIMPINAN",
  "ADMIN",
] as const satisfies readonly Role[];

/** Facility type a role must belong to (null = optional, ADMIN/PIMPINAN see every facility). */
export function facilityTypeFor(role: Role): Facility["type"] | null {
  if (role === "PETUGAS_UTD" || role === "LAB_UTD") return "UTD";
  if (role === "PETUGAS_BDRS" || role === "PERAWAT") return "BDRS";
  return null;
}

export function facilityOptions(role: Role, facilities: Facility[]): Facility[] {
  const type = facilityTypeFor(role);
  return type ? facilities.filter((f) => f.type === type) : facilities;
}

/** Key into `accountStatus` (lib/format). */
export function statusOf(a: Account): "ACTIVE" | "PENDING" | "LOCKED" | "INACTIVE" {
  if (!a.is_active) return "INACTIVE";
  if (a.locked_until && new Date(a.locked_until).getTime() > Date.now()) return "LOCKED";
  if (a.must_change_password) return "PENDING";
  return "ACTIVE";
}
