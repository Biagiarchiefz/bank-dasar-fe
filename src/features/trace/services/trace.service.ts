// Telusur endpoint: vein-to-vein trace by bag, donation or donor number.

import { api } from "@/services/api-client";
import type { Trace } from "@/types";

export const traceService = {
  trace: (q: string) => api.get<Trace>("/trace", { q }),
};
