// Public environment variables, read in one place. NEXT_PUBLIC_* values are
// inlined at build time, so they must be referenced literally here.

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "SI UTD & BDRS",
  /** Shows the demo accounts on the login page. */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
} as const;
