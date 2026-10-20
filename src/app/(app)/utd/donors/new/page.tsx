import type { Metadata } from "next";
import { NewDonor } from "./new-donor";

export const metadata: Metadata = { title: "Daftarkan Pendonor" };

export default function Page() {
  return <NewDonor />;
}
