import type { Metadata } from "next";
import { site } from "@/config/site";
import { LandingPage } from "@/features/landing";

export const metadata: Metadata = { title: { absolute: `${site.name} · ${site.tagline}` } };

// Public landing page; see features/landing.
export default function Home() {
  return <LandingPage />;
}
