import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Friendly message for empty lists. */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
      <span className="mb-2 flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="size-6" />
      </span>
      <p className="font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
