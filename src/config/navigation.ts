// Sidebar menu and the roles allowed to see each entry (PROTOTYPE_PLAN §8).
// This is only a convenience: the backend enforces access on every request.

import {
  ClipboardCheck,
  Droplet,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  type LucideIcon,
  PackageCheck,
  ScanSearch,
  Stethoscope,
  Syringe,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";
import type { Role } from "@/types";

export type NavItem = { href: string; label: string; icon: LucideIcon; roles: Role[] };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Ringkasan",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN", "PETUGAS_UTD", "LAB_UTD", "PETUGAS_BDRS", "PIMPINAN"],
      },
    ],
  },
  {
    label: "UTD",
    items: [
      { href: "/utd/donors", label: "Pendonor", icon: Users, roles: ["ADMIN", "PETUGAS_UTD"] },
      { href: "/utd/screening", label: "Seleksi", icon: Stethoscope, roles: ["ADMIN", "PETUGAS_UTD"] },
      { href: "/utd/collection", label: "Pengambilan", icon: Syringe, roles: ["ADMIN", "PETUGAS_UTD"] },
      { href: "/utd/lab", label: "Laboratorium", icon: FlaskConical, roles: ["ADMIN", "LAB_UTD"] },
      { href: "/utd/processing", label: "Pengolahan", icon: Droplet, roles: ["ADMIN", "LAB_UTD"] },
      { href: "/utd/release", label: "Pelulusan", icon: PackageCheck, roles: ["ADMIN", "LAB_UTD"] },
    ],
  },
  {
    label: "Inventori",
    items: [
      {
        href: "/inventory",
        label: "Stok Darah",
        icon: Warehouse,
        roles: ["ADMIN", "LAB_UTD", "PETUGAS_BDRS", "PIMPINAN"],
      },
      { href: "/transfers", label: "Distribusi", icon: Truck, roles: ["ADMIN", "LAB_UTD", "PETUGAS_BDRS"] },
      {
        href: "/trace",
        label: "Lacak Kantong",
        icon: ScanSearch,
        roles: ["ADMIN", "PETUGAS_UTD", "LAB_UTD", "PETUGAS_BDRS", "PIMPINAN"],
      },
    ],
  },
  {
    label: "BDRS",
    items: [
      {
        href: "/bdrs/requests",
        label: "Permintaan Darah",
        icon: ClipboardCheck,
        roles: ["ADMIN", "PETUGAS_BDRS", "PERAWAT"],
      },
      { href: "/transfusions", label: "Transfusi", icon: HeartPulse, roles: ["ADMIN", "PERAWAT"] },
    ],
  },
  {
    label: "Administrasi",
    items: [{ href: "/admin/users", label: "Pengguna", icon: UserCog, roles: ["ADMIN"] }],
  },
];

/** Menu groups visible for a role (empty groups removed). */
export function navFor(role: Role): NavGroup[] {
  return navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);
}

/** First page a role lands on after login. */
export function landingFor(role: Role): string {
  return navFor(role)[0]?.items[0]?.href ?? "/trace";
}

/** Whether the role may open a path (longest matching menu prefix). */
export function canAccess(role: Role, pathname: string): boolean {
  const all = navGroups.flatMap((g) => g.items);
  const match = all
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return !match || match.roles.includes(role);
}

/**
 * A `?next=` value the role may open, or null. Only same-site paths are
 * accepted ("//host" would leave the site).
 */
export function safeNext(raw: string | null, role: Role): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return canAccess(role, raw) ? raw : null;
}
