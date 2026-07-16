// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "citizen" | "provider";
export type Screen = "onboarding" | "map" | "report" | "provider" | "feed" | "ai";
export type CutType = "power" | "water" | "dirty" | "fuel" | "road" | "internet" | "restored";
export type Activity = "menage" | "restaurant" | "salon" | "bureau" | "hotel" | "marche";

export interface UserProfile {
  name: string;
  activity: Activity;
  fokontany: string;
  notes: string;
  role: Role;
}

/** Matches the Supabase `reports` table row shape. */
export interface Report {
  id: string;
  type: CutType;
  fokontany: string;
  description: string;
  /** DB column: is_active */
  is_active: boolean;
  /** DB column: is_official */
  is_official: boolean;
  confirmations: number;
  author: string | null;
  planned_end: string | null;
  reason: string | null;
  hotline: string | null;
  /** WGS-84 latitude */
  lat: number;
  /** WGS-84 longitude */
  lng: number;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const FOKONTANY: string[] = [
  "Analakely",
  "Antanimena",
  "Ambohijanaka",
  "Ivandry",
  "Ankorondrano",
  "Ambanidia",
  "Tsaralalàna",
  "Manjakamiadana",
  "Ampefiloha",
  "Ankadifotsy",
  "Antsahavola",
  "Behoririka",
  "Faravohitra",
  "Isoraka",
  "Ambohipo",
];

export const ACTIVITIES: Record<Activity, string> = {
  menage: "Ménage / Tokantrano",
  restaurant: "Restaurant / Hotely",
  salon: "Salon de coiffure / Trano Coiffure",
  bureau: "Bureau / Birao",
  hotel: "Hôtel",
  marche: "Marché / Tsena",
};

export const CUT_LABELS: Record<CutType, string> = {
  power: "Coupure d'électricité",
  water: "Coupure d'eau",
  dirty: "Eau sale / polluée",
  fuel: "Pénurie de carburant",
  restored: "Service rétabli",
};

export const CUT_COLORS: Record<CutType, { bg: string; text: string; border: string; dot: string }> = {
  power:    { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/40",  dot: "bg-amber-400" },
  water:    { bg: "bg-blue-500/15",    text: "text-blue-400",    border: "border-blue-500/40",   dot: "bg-blue-400" },
  dirty:    { bg: "bg-orange-800/20",  text: "text-orange-400",  border: "border-orange-700/40", dot: "bg-orange-600" },
  fuel:     { bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/40", dot: "bg-orange-400" },
  restored: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40",dot: "bg-emerald-400" },
};

export const CUT_ICONS: Record<CutType, string> = {
  power: "Zap",
  water: "Droplets",
  dirty: "AlertTriangle",
  fuel: "Fuel",
  restored: "CheckCircle2",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Accepts an ISO string or Date. */
export function timeAgo(dateOrStr: Date | string): string {
  const date = typeof dateOrStr === "string" ? new Date(dateOrStr) : dateOrStr;
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

