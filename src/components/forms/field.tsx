import { cloneElement, isValidElement, type ReactNode, useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Links the label to a single Input/Textarea child that has no id yet, so
 * clicking the label focuses the field and screen readers announce its name.
 */
function withControlId(children: ReactNode, htmlFor: string | undefined, generatedId: string) {
  if (htmlFor || !isValidElement<{ id?: string }>(children)) return { control: children, labelFor: htmlFor };
  if ((children.type !== Input && children.type !== Textarea) || children.props.id) {
    return { control: children, labelFor: htmlFor ?? children.props.id };
  }
  return { control: cloneElement(children, { id: generatedId }), labelFor: generatedId };
}

/** Form field: label, control, hint and error message. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const generatedId = useId();
  const { control, labelFor } = withControlId(children, htmlFor, generatedId);
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={labelFor}>
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      {control}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** Read-only label/value pairs for detail cards. */
export function KeyValue({ items, className }: { items: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-[minmax(110px,auto)_1fr] gap-x-4 gap-y-2 text-sm", className)}>
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="min-w-0 font-medium">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
