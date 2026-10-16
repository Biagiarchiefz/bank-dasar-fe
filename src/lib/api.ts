// Fetch wrapper for the backend API (envelope: {"data"} / {"error"}).
// Phase 1 adds apiPost/apiPut and the 401 → /login redirect.

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: string[];
  fields?: Record<string, string>;
};

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

/** GET a relative API path such as "/api/v1/health" and return its `data`. */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { Accept: "application/json", ...init?.headers } });
  } catch {
    throw new ApiError(0, { code: "NETWORK_ERROR", message: "Tidak dapat terhubung ke server." });
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      json?.error ?? { code: "UNKNOWN_ERROR", message: `Server mengembalikan status ${res.status}.` },
    );
  }
  return json.data as T;
}
