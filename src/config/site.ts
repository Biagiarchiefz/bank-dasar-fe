// Site identity and the fixed routes outside the role menu.

import { env } from "./env";

export const site = {
  name: env.appName,
  tagline: "Darah aman, dari pendonor sampai pasien",
  description: "Prototipe Sistem Informasi Unit Transfusi Darah & Bank Darah Rumah Sakit",
  owner: "RS Demo",
} as const;

export const routes = {
  home: "/",
  login: "/login",
  changePassword: "/change-password",
  /** Sends a signed-in user to the first page of their role. */
  app: "/app",
} as const;
