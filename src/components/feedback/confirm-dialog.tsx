"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/**
 * Confirmation for important actions, with a summary of what will happen
 * (e.g. "Luluskan 1 kantong UTD0126000123-PRC?").
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  children,
  confirmLabel = "Ya, lanjutkan",
  destructive,
  onConfirm,
  disabled,
  open,
  onOpenChange,
}: {
  trigger?: ReactNode;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={disabled}
            className={cn(destructive && "bg-destructive text-white hover:bg-destructive/90")}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
