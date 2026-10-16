import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthStatus } from "./health-status";

// Temporary Phase 0 page. Replaced by /login and /dashboard in Phase 1.
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{process.env.NEXT_PUBLIC_APP_NAME ?? "SI UTD & BDRS"}</CardTitle>
          <CardDescription>Prototipe — pemeriksaan koneksi sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <HealthStatus />
        </CardContent>
      </Card>
    </main>
  );
}
