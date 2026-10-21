import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiError } from "@/services/api-client";

/** Shows an API error with its details list (e.g. failed checklist items). */
export function ErrorAlert({ error, title }: { error: unknown; title?: string }) {
  if (!error) return null;
  const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
  const details = error instanceof ApiError ? error.details : undefined;
  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>{title ?? message}</AlertTitle>
      {(title || details?.length) && (
        <AlertDescription>
          {title && <p>{message}</p>}
          {details && details.length > 0 && (
            <ul className="mt-1 list-disc pl-4">
              {details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </AlertDescription>
      )}
    </Alert>
  );
}
