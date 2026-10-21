import { ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SESSION_COOKIE } from "@/lib/constants";

type CtaProps = { size?: "sm" | "lg"; className?: string };

/** "Masuk" for visitors, "Buka aplikasi" when a session cookie is present. Wrap in Suspense. */
export async function SessionCta(props: CtaProps) {
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  return <AuthCta signedIn={signedIn} {...props} />;
}

/** Static variant, also used as the Suspense fallback. */
export function AuthCta({ signedIn = false, size = "sm", className }: CtaProps & { signedIn?: boolean }) {
  const label = signedIn ? "Buka aplikasi" : size === "lg" ? "Masuk ke aplikasi" : "Masuk";
  return (
    <Button asChild size={size === "lg" ? "lg" : "default"} className={className}>
      <Link href={signedIn ? "/app" : "/login"}>
        {label}
        <ArrowRight />
      </Link>
    </Button>
  );
}
