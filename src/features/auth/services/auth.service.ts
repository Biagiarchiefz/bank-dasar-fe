// Autentikasi endpoints: session cookie in, Me out.

import { api } from "@/services/api-client";
import type { Me } from "@/types";

export type Credentials = { username: string; password: string };
export type PasswordChange = { current_password: string; new_password: string };

export const authService = {
  me: () => api.get<Me>("/auth/me"),
  login: (body: Credentials) => api.post<Me>("/auth/login", body),
  logout: () => api.post<null>("/auth/logout"),
  changePassword: (body: PasswordChange) => api.post<Me>("/auth/change-password", body),
};
