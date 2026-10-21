"use client";

import { KeyRound, MoreHorizontal, Pencil, Power, PowerOff, Search, UserCog, UserPlus } from "lucide-react";
import { useState } from "react";
import { columnHelper, DataTable } from "@/components/data-display/data-table";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounced } from "@/hooks/use-debounced";
import { PAGE_SIZE } from "@/lib/constants";
import { accountStatus, fmtDateTime, roleLabel } from "@/lib/format";
import { useSession } from "@/store/session";
import type { Account, Role, TempPassword } from "@/types";
import { type AccountActionVars, useAccountAction, useCreateUser, useUpdateUser, useUsers } from "../hooks/use-users";
import type { AccountInput, AccountUpdate, UserFilters } from "../services/users.service";
import { roles, statusOf } from "../utils";
import { TempPasswordDialog } from "./temp-password-dialog";
import { UserFormDialog } from "./user-form-dialog";

const ANY = "any";

type Revealed = TempPassword & { username: string; full_name: string };
type Pending = AccountActionVars;

export function UserList() {
  const { me, facilities } = useSession();
  const [q, setQ] = useState("");
  const [role, setRole] = useState(ANY);
  const [facility, setFacility] = useState(ANY);
  const [status, setStatus] = useState(ANY);
  const [page, setPage] = useState(1);
  const search = useDebounced(q, 300);
  const filters: UserFilters = {
    q: search,
    role: role === ANY ? undefined : (role as Role),
    facility_id: facility === ANY ? undefined : Number(facility),
    status: status === ANY ? undefined : (status as UserFilters["status"]),
    page,
    page_size: PAGE_SIZE,
  };
  const { data, isLoading } = useUsers(filters);

  // Dialog state: the form (create/edit), a confirmation, and the one-time password.
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [revealed, setRevealed] = useState<{ title: string; data: Revealed } | null>(null);

  function openForm(account: Account | null) {
    setEditing(account);
    setFormOpen(true);
  }

  const create = useCreateUser((res) => {
    setFormOpen(false);
    setRevealed({ title: "Akun berhasil dibuat", data: { ...res, username: res.user.username, full_name: res.user.full_name } });
  });
  const update = useUpdateUser(() => setFormOpen(false));
  const action = useAccountAction((temp, { account }) => {
    setPending(null);
    if (temp) {
      setRevealed({ title: "Password sementara baru", data: { ...temp, username: account.username, full_name: account.full_name } });
    }
  });

  async function submit(p: AccountInput) {
    if (!editing) return create.mutateAsync(p);
    // Send only what changed: a role/facility change ends that user's sessions.
    const body: AccountUpdate = {};
    if (p.full_name !== editing.full_name) body.full_name = p.full_name;
    if (p.email !== editing.email) body.email = p.email;
    if (p.role !== editing.role) body.role = p.role;
    if (p.facility_id !== editing.facility_id) body.facility_id = p.facility_id;
    if (Object.keys(body).length === 0) {
      setFormOpen(false);
      return;
    }
    return update.mutateAsync({ id: editing.id, body });
  }

  const col = columnHelper<Account>();
  const columns = [
    col.display({
      id: "user",
      header: "Pengguna",
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {a.full_name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-medium">
                {a.full_name}
                {a.id === me.id && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(Anda)</span>}
              </p>
              <p className="font-mono text-xs text-muted-foreground">{a.username}</p>
            </div>
          </div>
        );
      },
    }),
    col.display({ id: "role", header: "Peran", cell: ({ row }) => roleLabel[row.original.role] }),
    col.display({
      id: "facility",
      header: "Fasilitas",
      cell: ({ row }) => row.original.facility_name ?? <span className="text-muted-foreground">Semua fasilitas</span>,
    }),
    col.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge map={accountStatus} value={statusOf(row.original)} />,
    }),
    col.display({ id: "last", header: "Login terakhir", cell: ({ row }) => fmtDateTime(row.original.last_login_at) }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => {
        const a = row.original;
        const self = a.id === me.id;
        return (
          // Keep menu clicks from also opening the edit dialog via the row.
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Aksi untuk ${a.full_name}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => openForm(a)}>
                  <Pencil />
                  Ubah akun
                </DropdownMenuItem>
                <DropdownMenuItem disabled={self || !a.is_active} onClick={() => setPending({ kind: "reset", account: a })}>
                  <KeyRound />
                  Reset password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {a.is_active ? (
                  <DropdownMenuItem
                    disabled={self}
                    className="text-destructive"
                    onClick={() => setPending({ kind: "deactivate", account: a })}
                  >
                    <PowerOff />
                    Nonaktifkan
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setPending({ kind: "activate", account: a })}>
                    <Power />
                    Aktifkan kembali
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const filtered = search || role !== ANY || facility !== ANY || status !== ANY;
  const confirm = pending && confirmCopy(pending);

  return (
    <>
      <PageHeader
        title="Pengguna"
        description="Buat akun petugas, atur peran dan fasilitasnya, reset password, atau nonaktifkan akun."
        actions={
          <Button onClick={() => openForm(null)}>
            <UserPlus />
            Tambah pengguna
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau username…"
            className="pl-9"
            aria-label="Cari pengguna"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
          <FilterSelect
            label="Peran"
            value={role}
            onChange={(v) => {
              setRole(v);
              setPage(1);
            }}
            options={[[ANY, "Semua peran"], ...roles.map((r): [string, string] => [r, roleLabel[r as Role]])]}
          />
          <FilterSelect
            label="Fasilitas"
            value={facility}
            onChange={(v) => {
              setFacility(v);
              setPage(1);
            }}
            options={[[ANY, "Semua fasilitas"], ...facilities.map((f): [string, string] => [String(f.id), f.name])]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={[
              [ANY, "Semua status"],
              ["active", "Aktif"],
              ["inactive", "Nonaktif"],
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        loading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
        onRowClick={(a) => openForm(a)}
        rowClassName={(a) => (a.is_active ? undefined : "opacity-60")}
        empty={
          <EmptyState
            icon={UserCog}
            title={filtered ? "Pengguna tidak ditemukan" : "Belum ada pengguna"}
            description={filtered ? "Coba kata kunci atau filter lain." : undefined}
          />
        }
      />

      <UserFormDialog
        open={formOpen}
        account={editing}
        isSelf={editing?.id === me.id}
        onOpenChange={setFormOpen}
        onSubmit={submit}
      />

      {pending && confirm && (
        <ConfirmDialog
          open
          onOpenChange={(o) => !o && setPending(null)}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.label}
          destructive={pending.kind === "deactivate"}
          disabled={action.isPending}
          onConfirm={() => action.mutate(pending)}
        />
      )}

      <TempPasswordDialog
        result={revealed?.data ?? null}
        title={revealed?.title ?? ""}
        onClose={() => setRevealed(null)}
      />
    </>
  );
}

function confirmCopy({ kind, account: a }: Pending) {
  if (kind === "reset")
    return {
      title: `Reset password ${a.full_name}?`,
      description:
        "Password lama tidak berlaku lagi, kunci akun dibuka, dan semua sesinya keluar. Anda akan menerima password sementara baru (berlaku 72 jam).",
      label: "Ya, reset password",
    };
  if (kind === "deactivate")
    return {
      title: `Nonaktifkan ${a.full_name}?`,
      description: "Pengguna langsung keluar dan tidak bisa masuk lagi. Riwayat kerjanya tetap tersimpan, dan akun bisa diaktifkan kembali kapan saja.",
      label: "Ya, nonaktifkan",
    };
  return {
    title: `Aktifkan kembali ${a.full_name}?`,
    description: "Pengguna bisa masuk lagi dengan password terakhirnya. Bila lupa, lakukan reset password.",
    label: "Ya, aktifkan",
  };
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full lg:w-48" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
