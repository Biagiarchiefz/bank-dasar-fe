// HTTP client for the Go API. Paths passed in are relative to API_BASE_PATH
// ("/donors" -> "/api/v1/donors"), which next.config.ts proxies to the backend,
// so the session cookie stays same-origin and no CORS is needed.
// Only files in services/ and features/*/services/ should import this.

import { routes } from "@/config/site";
import { API_BASE_PATH } from "@/lib/constants";
import type { ApiErrorBody, Paged } from "@/types";

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

export type Query = Record<string, string | number | boolean | null | undefined>;

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

/** Full page load (not router.push) on purpose: it drops all cached client state. */
function redirectTo(page: string) {
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${page}?next=${next}`;
}

async function request(method: string, path: string, body?: unknown): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(API_BASE_PATH + path, {
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
    if (typeof window !== "undefined") {
      // Session expired: back to the login page (except for the login call itself).
      if (res.status === 401 && !path.startsWith("/auth/login")) redirectTo(routes.login);
      // Temporary password still in use: the API refuses everything until it is changed.
      if (err.code === "PASSWORD_CHANGE_REQUIRED" && window.location.pathname !== routes.changePassword) {
        redirectTo(routes.changePassword);
      }
    }
    throw err;
  }
  return json;
}

export const api = {
  /** GET returning `data`. */
  async get<T>(path: string, query?: Query): Promise<T> {
    const json = (await request("GET", withQuery(path, query))) as { data: T };
    return json.data;
  },

  /** GET a paginated list, returning `data` and `meta`. */
  async list<T>(path: string, query?: Query): Promise<Paged<T>> {
    return (await request("GET", withQuery(path, query))) as Paged<T>;
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const json = (await request("POST", path, body ?? {})) as { data: T } | null;
    return json?.data as T;
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const json = (await request("PUT", path, body)) as { data: T };
    return json.data;
  },

  async patch<T>(path: string, body: unknown): Promise<T> {
    const json = (await request("PATCH", path, body)) as { data: T };
    return json.data;
  },
};
