import type { Metadata } from "next";
import { NewDonor } from "@/features/donors";

export const metadata: Metadata = { title: "Daftarkan Pendonor" };

export default function Page() {
  return <NewDonor />;
}
