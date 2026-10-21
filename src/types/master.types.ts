// Static master data and screening configuration.

export type Facility = { id: number; code: string; name: string; type: "UTD" | "BDRS" };
export type Location = {
  id: number;
  facility_id: number;
  code: string;
  name: string;
  temp_min_c: number | null;
  temp_max_c: number | null;
};
export type Component = {
  id: number;
  code: string;
  name: string;
  compat_group: "RED_CELL" | "PLASMA" | "PLATELET";
  shelf_life_days: number;
};
export type ScreeningQuestion = { code: string; question: string; defer_if_yes: boolean };
export type ScreeningRanges = {
  hb_min: number;
  hb_max: number;
  weight_min: number;
  systolic_min: number;
  systolic_max: number;
  diastolic_min: number;
  diastolic_max: number;
};
export type ScreeningConfig = { questions: ScreeningQuestion[]; ranges: ScreeningRanges };
