import { Suspense } from "react";
import { ClosingBanner, SiteFooter } from "./closing";
import { DailyTools } from "./daily-tools";
import { FeaturesBento } from "./features-bento";
import { JourneyFlow } from "./journey-flow";
import { NumbersSection } from "./numbers-section";
import { RolesSection } from "./role-tabs";
import { ScrollHero } from "./scroll-hero";
import { AuthCta, SessionCta } from "./session-cta";
import { SiteHeader } from "./site-header";

// Public landing page. The only dynamic part is the session-aware button.
export function LandingPage() {
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
