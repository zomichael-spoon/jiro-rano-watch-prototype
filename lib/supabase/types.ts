export type ReportRow = {
  id: string;
  type: "power" | "water" | "dirty" | "fuel" | "restored";
  fokontany: string;
  description: string;
  is_active: boolean;
  is_official: boolean;
  author: string | null;
  reason: string | null;
  planned_end: string | null;
  hotline: string | null;
  lat: number;
  lng: number;
  confirmations: number;
  created_at: string;
};
