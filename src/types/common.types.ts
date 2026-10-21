// Shared enums of the blood-bank domain.

export type Role = "ADMIN" | "PETUGAS_UTD" | "LAB_UTD" | "PETUGAS_BDRS" | "PERAWAT" | "PIMPINAN";
export type ABO = "A" | "B" | "AB" | "O";
export type Rh = "POS" | "NEG";
export type QualityStatus = "HOLD" | "RELEASED" | "REJECTED";
export type InventoryStatus =
  | "IN_STOCK"
  | "PROCESSED"
  | "RESERVED"
  | "IN_TRANSIT"
  | "ISSUED"
  | "TRANSFUSED"
  | "DISCARDED";
