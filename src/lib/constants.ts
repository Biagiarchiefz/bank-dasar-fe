// App-wide constants shared by the client, the proxy and server components.

/** Prefix of every Go API path; next.config.ts proxies it to the backend. */
export const API_BASE_PATH = "/api/v1";

/** httpOnly JWT cookie set by POST /auth/login. */
export const SESSION_COOKIE = "utd_session";

/** Minimum length of a new password (POST /auth/change-password). */
export const PASSWORD_MIN_LENGTH = 12;

/** Default page size of paginated lists. */
export const PAGE_SIZE = 20;
