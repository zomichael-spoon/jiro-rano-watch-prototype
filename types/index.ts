// ============================================================================
// types/index.ts
// Typage strict dérivé du schéma PostgreSQL (public.*)
// Zéro `any` — toutes les tables sont représentées par une interface dédiée.
// ============================================================================

// ---------------------------------------------------------------------------
// ENUMS (représentés par des unions de strings, fidèles aux CHECK constraints)
// ---------------------------------------------------------------------------

/** Correspond à reports.type CHECK (...) et disruption_types.code */
export type DisruptionCode = "power" | "water" | "dirty" | "fuel" | "road" | "internet" | "restored";

/** Correspond à profiles.role CHECK (...) */
export type UserRole = "citizen" | "provider" | "admin";

// ---------------------------------------------------------------------------
// TABLES — correspondance 1:1 avec le schéma SQL
// ---------------------------------------------------------------------------

// Le fokontany est maintenant une entité DB (Supabase), plus une simple option statique
export interface Fokontany {
  id: string; // uuid
  name: string;
  district: string;
  lat: number;
  lng: number;
  created_at: string; // ISO timestamp
}

// Ce que le combobox manipule avant soumission :
// - soit un fokontany déjà en base (id connu)
// - soit un nouveau fokontany saisi (pas encore d'id → sera créé au submit)
export type FokontanySelection =
  | { kind: "existing"; fokontany: Fokontany }
  | { kind: "new"; name: string; district: string; lat: number; lng: number };

export interface DisruptionType {
  id: string;
  code: DisruptionCode;
  label_fr: string;
  label_mg: string;
  color_bg: string;
  color_text: string;
  color_border: string;
  color_dot: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Activity {
  id: string;
  code: string;
  label_fr: string;
  label_mg: string | null;
  sort_order: number;
  created_at: string;
}

export interface InterventionReason {
  id: string;
  label_fr: string;
  label_mg: string | null;
  disruption_type_code: DisruptionCode | null;
  sort_order: number;
  created_at: string;
}

export interface ProviderOrganization {
  id: string;
  name: string;
  short_name: string | null;
  hotline: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string; // uuid, FK -> auth.users(id)
  display_name: string | null;
  ville?: string | null;
  role: UserRole;
  activity_code: string | null;
  fokontany_id: string | null;
  notes: string | null;
  organization_name: string | null;
  is_verified_provider: boolean;
  notify_power: boolean;
  notify_water: boolean;
  notify_fuel: boolean;
  notify_dirty: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  type: DisruptionCode;
  fokontany: string; // conservé en clair (legacy) en plus de fokontany_id
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
  fokontany_id: string | null;
  disruption_code: DisruptionCode | null;
  reason_id: string | null;
  organization_id: string | null;
  reporter_id: string | null;
  updated_at: string;
}

export interface ReportConfirmation {
  id: string;
  report_id: string;
  user_id: string | null;
  device_id: string | null;
  created_at: string;
}

export interface News {
  id: string;
  organization_id: string | null;
  title_fr: string;
  title_mg: string | null;
  body_fr: string | null;
  body_mg: string | null;
  cover_url: string | null;
  disruption_code: DisruptionCode | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsFokontany {
  news_id: string;
  fokontany_id: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  note_fr: string | null;
  note_mg: string | null;
  organization_id: string | null;
  disruption_code: DisruptionCode | null;
  fokontany_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// TYPES COMPOSÉS (jointures) — utilisés côté UI pour éviter les lookups
// répétés dans les composants (remplace les tables statiques CUT_COLORS /
// CUT_LABELS de l'ancien lib/jiro-data.ts, désormais pilotées par la DB).
// ---------------------------------------------------------------------------

/** Un report enrichi de son DisruptionType (couleurs/labels) et de son organisme. */
export interface ReportWithRelations extends Report {
  disruption_type: DisruptionType | null;
  organization: Pick<ProviderOrganization, "id" | "name" | "short_name" | "hotline"> | null;
}

/** Fokontany simplifié utilisé dans les <select> et listes de zones. */
export interface FokontanyOption {
  id: string;
  name: string;
  lat: number;
  lng: number;
  district?: string | null;
}

/** Profil enrichi de son activité et de son fokontany (pour l'écran d'accueil / conseils IA). */
export interface ProfileWithRelations extends Profile {
  activity: Activity | null;
  fokontany_ref: Fokontany | null;
}

// ---------------------------------------------------------------------------
// DTOs — types dérivés pour les mutations (Server Actions)
// ---------------------------------------------------------------------------

/**
 * Création d'un signalement citoyen.
 * Les champs générés serveur (id, created_at, updated_at, confirmations)
 * sont exclus ; is_official/author/reason/etc. sont optionnels côté citoyen.
 */
export type CreateReportDTO = Omit<
  Report,
  "id" | "created_at" | "updated_at" | "confirmations"
>;

/** Création d'un avis officiel prestataire (une entrée par zone sélectionnée). */
export type CreateOfficialReportDTO = Omit<
  Report,
  "id" | "created_at" | "updated_at" | "confirmations" | "is_official" | "reporter_id"
> & {
  is_official: true;
};

/** Mise à jour partielle d'un report (ex: clôture, changement de statut). */
export type UpdateReportDTO = Partial<
  Omit<Report, "id" | "created_at" | "reporter_id">
> & {
  id: string;
};

/** Confirmation ("+1 moi aussi") d'un signalement existant. */
export interface CreateConfirmationDTO {
  report_id: string;
  user_id?: string | null;
  device_id?: string | null;
}

/** Création/MAJ du profil utilisateur lors de l'onboarding. */
export type UpsertProfileDTO = Omit<Profile, "created_at" | "updated_at">;

/** Mise à jour partielle du profil (ex: écran de préférences de notification). */
export type UpdateProfileDTO = Partial<
  Omit<Profile, "id" | "created_at" | "updated_at">
> & {
  id: string;
};

/** Création d'une actualité par un prestataire. */
export type CreateNewsDTO = Omit<
  News,
  "id" | "created_at" | "updated_at" | "published_at"
> & {
  fokontany_ids: string[]; // pour peupler news_fokontany en une seule action
};

// ---------------------------------------------------------------------------
// Résultat générique des Server Actions (pattern discriminated union)
// ---------------------------------------------------------------------------

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };