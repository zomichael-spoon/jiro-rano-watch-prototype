import type { DisruptionType, DisruptionCode, ProfileWithRelations } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { AlertTriangle, CheckCircle2, Droplets, Fuel, Globe, LucideIcon, MapPin, Zap } from "lucide-react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// ============================================================================
// lib/utils.ts
// Remplace l'ancien lib/jiro-data.ts (constantes statiques). Les couleurs et
// labels viennent désormais de la table disruption_types (voir types/index.ts
// -> DisruptionType), chargée une fois dans app/page.tsx et propagée en props.
// ============================================================================

/**
 * Convertit le champ texte `disruption_types.icon` (ex: "zap", "droplets")
 * en composant Lucide correspondant. Fallback sur AlertTriangle si inconnu.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  droplets: Droplets,
  "alert-triangle": AlertTriangle,
  fuel: Fuel,
  "check-circle-2": CheckCircle2,
  globe: Globe,
  "map-pin": MapPin,
};

export function resolveIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? AlertTriangle;
}

/** Retrouve le DisruptionType correspondant à un code, avec un fallback sûr. */
export function findDisruptionType(
  types: DisruptionType[],
  code: DisruptionCode,
): DisruptionType | undefined {
  return types.find((t) => t.code === code);
}

/** Formate un timestamp ISO en durée relative française ("il y a 5 min"). */
export function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;

  return new Date(isoDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

/**
 * Vérifie si un profil est complet pour bénéficier de la personnalisation et des conseils IA.
 * Un profil est complet si : display_name, activity_code, et fokontany_id sont remplis.
 */
export function isProfileComplete(profile: ProfileWithRelations | null): boolean {
  if (!profile) return false;
  return !!(profile.display_name && profile.activity_code && profile.fokontany_id && profile.ville);
}

