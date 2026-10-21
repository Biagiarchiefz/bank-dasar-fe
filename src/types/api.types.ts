// Response envelopes of the Go API (see /docs/openapi.yaml).

export type PageMeta = { page: number; page_size: number; total: number };
export type Paged<T> = { data: T[]; meta: PageMeta };

/** Body of `{"error": {...}}`; `message` is Indonesian and safe to show. */
export type ApiErrorBody = {
  code: string;
  message: string;
  details?: string[];
  fields?: Record<string, string>;
};
