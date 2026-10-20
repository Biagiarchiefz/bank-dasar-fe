"use client";

// Current user and facility selection, shared by the whole app shell.

import { useQuery } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { apiGet } from "./api";
import { qk } from "./query-keys";
import type { Facility, Me } from "./types";

type Session = {
  me: Me;
  facilities: Facility[];
  /** Selected facility for ADMIN/PIMPINAN (null = all). Bound users always see their own. */
  facilityId: number | null;
  setFacilityId: (id: number | null) => void;
  canChooseFacility: boolean;
};

const SessionContext = createContext<Session | null>(null);

const STORAGE_KEY = "si-utd-bdrs.facility";
const listeners = new Set<() => void>();

function readStoredFacility(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useMe() {
  return useQuery({ queryKey: qk.me, queryFn: () => apiGet<Me>("/api/v1/auth/me"), staleTime: 5 * 60_000 });
}

export function SessionProvider({ me, children }: { me: Me; children: ReactNode }) {
  const canChooseFacility = me.role === "ADMIN" || me.role === "PIMPINAN";
  const facilitiesQuery = useQuery({
    queryKey: qk.facilities,
    queryFn: () => apiGet<Facility[]>("/api/v1/master/facilities"),
    staleTime: Infinity,
  });
  const stored = useSyncExternalStore(subscribe, readStoredFacility, () => null);

  const setFacilityId = useCallback((id: number | null) => {
    try {
      if (id === null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      /* storage unavailable: selection just won't persist */
    }
    listeners.forEach((l) => l());
  }, []);

  const value = useMemo<Session>(
    () => ({
      me,
      facilities: facilitiesQuery.data ?? [],
      facilityId: canChooseFacility ? stored : me.facility_id,
      setFacilityId,
      canChooseFacility,
    }),
    [me, facilitiesQuery.data, canChooseFacility, stored, setFacilityId],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}

/** The facility_id query parameter to send (undefined lets the backend scope bound users). */
export function useFacilityParam(): number | undefined {
  const { facilityId, canChooseFacility } = useSession();
  return canChooseFacility && facilityId !== null ? facilityId : undefined;
}
