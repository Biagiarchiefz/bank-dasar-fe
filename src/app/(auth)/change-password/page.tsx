import type { Metadata } from "next";
import { Suspense } from "react";
import { ChangePasswordForm } from "@/features/auth";

export const metadata: Metadata = { title: "Ganti password" };

export default function ChangePasswordPage() {
  return (
    <Suspense>
      <ChangePasswordForm />
    </Suspense>
  );
}
