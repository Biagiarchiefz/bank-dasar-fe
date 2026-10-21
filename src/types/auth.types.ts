// Signed-in user and the accounts ADMIN manages.

import type { Role } from "./common.types";

export type Me = {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  facility_id: number | null;
  facility_name: string | null;
  facility_type: "UTD" | "BDRS" | null;
  /** Temporary password still in use: every other endpoint answers PASSWORD_CHANGE_REQUIRED. */
  must_change_password: boolean;
};

export type Account = {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  role: Role;
  facility_id: number | null;
  facility_name: string | null;
  facility_type: "UTD" | "BDRS" | null;
  is_active: boolean;
  must_change_password: boolean;
  /** Set only while the account is still locked. */
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};
/** Shown once, right after create or reset; the API cannot return it again. */
export type TempPassword = { temporary_password: string; temporary_password_expires_at: string };
export type CreatedAccount = TempPassword & { user: Account };
