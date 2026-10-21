// Aggregated indicators for the dashboard.

import type { ABO, Rh } from "./common.types";

export type DashboardSummary = {
  ready_units: number;
  hold_units: number;
  expiring_soon_units: number;
  low_stock_groups: { component_code: string; abo: ABO; rh: Rh; count: number }[];
  donors_today: number;
  donations_today: number;
  active_requests: number;
  transfusions_in_progress: number;
  reactions_30d: number;
  expiring_soon_days: number;
  low_stock_threshold: number;
  generated_at: string;
};

export type TrendPoint = { day: string; donations: number; transfusions: number };

export type Activity = {
  id: number;
  event_type: string;
  created_at: string;
  note: string | null;
  product_id: number;
  product_no: string;
  component_code: string;
  facility_name: string | null;
  actor: string | null;
};
