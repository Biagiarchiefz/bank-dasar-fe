"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fmtDateTime } from "@/lib/format";
import type { TempPassword } from "@/types";

/**
 * The one moment a temporary password is visible (after create or reset).
 * Outside clicks don't close it, so the admin can't lose it by accident.
 */
export function TempPasswordDialog({
  result,
  title,
  onClose,
}: {
  result: (TempPassword & { username: string; full_name: string }) | null;
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function close() {
    setCopied(false);
    onClose();
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.temporary_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Tidak dapat menyalin otomatis. Salin password secara manual.");
    }
  }

  return (
    <Dialog open={result !== null} onOpenChange={(o) => !o && close()}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Berikan password sementara ini langsung kepada <strong>{result?.full_name}</strong>. Password ini{" "}
            <strong>tidak bisa dilihat lagi</strong> setelah jendela ini ditutup.
          </DialogDescription>
        </DialogHeader>

        {result && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-border">
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Username</dt>
                <dd className="font-mono font-semibold">{result.username}</dd>
                <dt className="text-muted-foreground">Password</dt>
                <dd className="flex items-center justify-between gap-2">
                  <span className="font-mono text-lg font-bold tracking-wider break-all select-all">
                    {result.temporary_password}
                  </span>
                  <Button type="button" size="sm" variant="outline" onClick={copy} className="shrink-0">
                    {copied ? <Check className="text-emerald-600" /> : <Copy />}
                    {copied ? "Tersalin" : "Salin"}
                  </Button>
                </dd>
              </dl>
            </div>
            <p className="text-sm text-muted-foreground">
              Berlaku sampai <strong className="text-foreground">{fmtDateTime(result.temporary_password_expires_at)} WIB</strong>.
              Saat pertama masuk, pengguna wajib membuat password baru.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={close}>Sudah saya catat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
