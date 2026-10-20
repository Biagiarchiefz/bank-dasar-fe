// Fetch wrapper for the Go API. Paths are relative ("/api/v1/...") and are
// proxied to the backend by the rewrite in next.config.ts, so the session
// cookie stays same-origin and no CORS is needed.

import type { Paged } from "./types";

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: string[];
  fields?: Record<string, string>;
};

/** Error returned by the API (or a network failure, status 0). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: string[];
  readonly fields?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
    this.fields = body.fields;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

/** Builds "path?a=1&b=2", skipping empty values. */
export function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request(method: string, path: string, body?: unknown): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(0, { code: "NETWORK_ERROR", message: "Tidak dapat terhubung ke server." });
  }

  if (res.status === 204) return null;
  const json = (await res.json().catch(() => null)) as { data?: unknown; error?: ApiErrorBody } | null;

  if (!res.ok) {
    const err = new ApiError(
      res.status,
      json?.error ?? { code: "UNKNOWN_ERROR", message: `Server mengembalikan status ${res.status}.` },
    );
    // Session expired: send the user back to the login page (except for the login call itself).
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/api/v1/auth/login")) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      // A full page load (not router.push) on purpose: it drops all cached client state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/login?next=${next}`;
    }
    throw err;
  }
  return json;
}

/** GET returning `data`. */
export async function apiGet<T>(path: string, query?: Query): Promise<T> {
  const json = (await request("GET", withQuery(path, query))) as { data: T };
  return json.data;
}

/** GET a paginated list, returning `data` and `meta`. */
export async function apiList<T>(path: string, query?: Query): Promise<Paged<T>> {
  return (await request("GET", withQuery(path, query))) as Paged<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const json = (await request("POST", path, body ?? {})) as { data: T } | null;
  return json?.data as T;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const json = (await request("PUT", path, body)) as { data: T };
  return json.data;
}
