"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, apiGet } from "@/lib/api";

type Health = { status: string; database: string; time: string };

type State =
  | { kind: "loading" }
  | { kind: "ok"; health: Health }
  | { kind: "error"; message: string };

// Temporary Phase 0 widget: proves the browser → Next.js rewrite → Go API → PostgreSQL chain works.
export function HealthStatus() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const check = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const health = await apiGet<Health>("/api/v1/health", { cache: "no-store" });
      setState({ kind: "ok", health });
    } catch (err) {
      setState({ kind: "error", message: err instanceof ApiError ? err.message : "Kesalahan tidak dikenal." });
    }
  }, []);

  useEffect(() => {
    // Initial check on mount; check() only sets state after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void check();
  }, [check]);

  return (
    <div className="flex flex-col items-center gap-4">
      {state.kind === "loading" && <Badge variant="secondary">Memeriksa…</Badge>}
      {state.kind === "ok" && (
        <>
          <Badge className="bg-emerald-600 px-3 py-1 text-base text-white">API OK</Badge>
          <p className="text-sm text-muted-foreground">
            Database: {state.health.database} · Waktu server:{" "}
            {new Intl.DateTimeFormat("id-ID", {
              dateStyle: "medium",
              timeStyle: "medium",
              timeZone: "Asia/Jakarta",
            }).format(new Date(state.health.time))}{" "}
            WIB
          </p>
        </>
      )}
      {state.kind === "error" && (
        <>
          <Badge variant="destructive" className="px-3 py-1 text-base">
            API tidak tersedia
          </Badge>
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </>
      )}
      <Button variant="outline" size="sm" onClick={() => void check()}>
        Periksa ulang
      </Button>
    </div>
  );
}
