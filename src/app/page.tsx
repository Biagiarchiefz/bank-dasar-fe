import type { Metadata } from "next";
import { Suspense } from "react";
import { ClosingBanner, SiteFooter } from "./_landing/closing";
import { DailyTools } from "./_landing/daily-tools";
import { FeaturesBento } from "./_landing/features-bento";
import { JourneyFlow } from "./_landing/journey-flow";
import { NumbersSection } from "./_landing/numbers-section";
import { RolesSection } from "./_landing/role-tabs";
import { ScrollHero } from "./_landing/scroll-hero";
import { AuthCta, SessionCta } from "./_landing/session-cta";
import { SiteHeader } from "./_landing/site-header";

export const metadata: Metadata = {
  title: { absolute: `${process.env.NEXT_PUBLIC_APP_NAME ?? "SI UTD & BDRS"} · Darah aman, dari pendonor sampai pasien` },
};

// Public landing page. The only dynamic part is the session-aware button.
export default function Home() {
  const cta = (size?: "sm" | "lg", className?: string) => (
    <Suspense fallback={<AuthCta size={size} className={className} />}>
      <SessionCta size={size} className={className} />
    </Suspense>
  );

  return (
    <>
      <SiteHeader cta={cta()} />
      <main>
        <ScrollHero cta={cta("lg")} />
        <NumbersSection />
        <FeaturesBento cta={cta("lg", "bg-white text-blue-700 shadow-none hover:bg-white/90")} />
        <DailyTools />
        <JourneyFlow />
        <RolesSection />
        <ClosingBanner cta={cta("lg", "bg-white text-primary shadow-none hover:bg-white/90")} />
      </main>
      <SiteFooter />
    </>
  );
}
