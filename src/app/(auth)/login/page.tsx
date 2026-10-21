import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
