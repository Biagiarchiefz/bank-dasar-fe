// Master data shared by several features (Master tag in /docs).

import type { Facility, ScreeningConfig } from "@/types";
import { api } from "./api-client";

export const masterService = {
  facilities: () => api.get<Facility[]>("/master/facilities"),
  screeningConfig: () => api.get<ScreeningConfig>("/config/screening"),
};
