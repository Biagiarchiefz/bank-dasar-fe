import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Italic serif for single accent words in landing headings.
const serif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME ?? "SI UTD & BDRS",
    template: `%s · ${process.env.NEXT_PUBLIC_APP_NAME ?? "SI UTD & BDRS"}`,
  },
  description: "Prototipe Sistem Informasi Unit Transfusi Darah & Bank Darah Rumah Sakit",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${serif.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
