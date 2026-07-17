"use server";

// ============================================================================
// lib/actions.ts
// Server Actions — toutes les mutations passent par ici, jamais par un appel
// client direct à Supabase, pour garder les policies RLS + revalidation
// centralisées et testables.
// ============================================================================

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  ActionResult,
  CreateReportDTO,
  CreateOfficialReportDTO,
  CreateConfirmationDTO,
  UpsertProfileDTO,
  UpdateProfileDTO,
  CreateNewsDTO,
  Report,
  Profile,
  News,
  Fokontany,
} from "@/types";

// ---------------------------------------------------------------------------
// 1. Signalement citoyen
// ---------------------------------------------------------------------------

/**
 * Crée un signalement citoyen (JiroRano Watch, écran "Nouveau signalement").
 * `revalidatePath("/")` force la re-lecture des données côté app/page.tsx
 * au prochain rendu, pour que la carte et le feed reflètent le nouveau report.
 */
export async function createReport(
  dto: CreateReportDTO,
): Promise<ActionResult<Report>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reports")
      .insert({
        type: dto.type,
        disruption_code: dto.disruption_code ?? dto.type,
        fokontany: dto.fokontany,
        fokontany_id: dto.fokontany_id,
        description: dto.description,
        is_active: dto.is_active,
        is_official: dto.is_official,
        author: dto.author,
        reason: dto.reason,
        planned_end: dto.planned_end,
        hotline: dto.hotline,
        lat: dto.lat,
        lng: dto.lng,
        reason_id: dto.reason_id,
        organization_id: dto.organization_id,
        reporter_id: dto.reporter_id,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    return { success: true, data: data as Report };
  } catch (err) {
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// 2. Avis officiel prestataire — une entrée par fokontany sélectionné
// ---------------------------------------------------------------------------

/**
 * Publie un avis officiel (écran ProviderScreen) sur plusieurs zones en une
 * seule action. Retourne le tableau des reports créés.
 */
export async function createOfficialReports(
  reports: CreateOfficialReportDTO[],
): Promise<ActionResult<Report[]>> {
  try {
    if (reports.length === 0) {
      return { success: false, error: "Aucune zone sélectionnée." };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reports")
      .insert(
        reports.map((r) => ({
          ...r,
          is_official: true,
        })),
      )
      .select();

    if (error) throw error;

    revalidatePath("/");
    return { success: true, data: data as Report[] };
  } catch (err) {
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// 3. Confirmation ("+1 Moi aussi")
// ---------------------------------------------------------------------------

/**
 * Ajoute une confirmation à un report et incrémente son compteur.
 * On journalise la confirmation dans report_confirmations (traçabilité /
 * anti-doublon possible via device_id) puis on incrémente le compteur
 * dénormalisé reports.confirmations pour un affichage rapide sans jointure.
 */
export async function confirmReport(
  dto: CreateConfirmationDTO,
): Promise<ActionResult<{ confirmations: number }>> {
  try {
    const supabase = await createClient();

    const { error: insertError } = await supabase
      .from("report_confirmations")
      .insert({
        report_id: dto.report_id,
        user_id: dto.user_id ?? null,
        device_id: dto.device_id ?? null,
      });

    if (insertError) throw insertError;

    // Incrémentation atomique côté DB via RPC recommandée en production
    // (ex: `increment_confirmations(report_id)`). Fallback lecture-écriture ici :
    const { data: current, error: fetchError } = await supabase
      .from("reports")
      .select("confirmations")
      .eq("id", dto.report_id)
      .single();

    if (fetchError) throw fetchError;

    const nextCount = (current?.confirmations ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("reports")
      .update({ confirmations: nextCount, updated_at: new Date().toISOString() })
      .eq("id", dto.report_id);

    if (updateError) throw updateError;

    revalidatePath("/");
    return { success: true, data: { confirmations: nextCount } };
  } catch (err) {
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// 4. Clôture / mise à jour rapide d'un signalement (ex: "Rétabli")
// ---------------------------------------------------------------------------

export async function markReportResolved(
  reportId: string,
): Promise<ActionResult<Report>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reports")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", reportId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    return { success: true, data: data as Report };
  } catch (err) {
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// 5. Profil utilisateur (onboarding + préférences)
// ---------------------------------------------------------------------------

export async function upsertProfile(
  dto: UpsertProfileDTO,
): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .upsert({ ...dto, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: toErrorMessage(err) };
  }
}

export async function updateProfile(
  dto: UpdateProfileDTO,
): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { id, ...fields } = dto;

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// 6. Actualités prestataire (news + zones concernées)
// ---------------------------------------------------------------------------

export async function createNews(
  dto: CreateNewsDTO,
): Promise<ActionResult<News>> {
  try {
    const supabase = await createClient();
    const { fokontany_ids, ...newsFields } = dto;

    const { data: news, error: newsError } = await supabase
      .from("news")
      .insert(newsFields)
      .select()
      .single();

    if (newsError) throw newsError;

    if (fokontany_ids.length > 0) {
      const { error: linkError } = await supabase.from("news_fokontany").insert(
        fokontany_ids.map((fokontany_id) => ({
          news_id: news.id,
          fokontany_id,
        })),
      );
      if (linkError) throw linkError;
    }

    revalidatePath("/");
    return { success: true, data: news as News };
  } catch (err) {
    return { success: false, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Helper — normalisation des erreurs Supabase / JS en message affichable
// ---------------------------------------------------------------------------

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Une erreur inattendue est survenue.";
}

/**
 * Recherche des fokontany existants par nom (utilisé par le combobox, debounced).
 */
export async function searchFokontany(query: string): Promise<Fokontany[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fokontany")
    .select("*")
    .ilike("name", `%${q}%`)
    .order("name", { ascending: true })
    .limit(8);

  if (error) {
    console.error("searchFokontany:", error.message);
    return [];
  }
  return data ?? [];
}

interface UpsertFokontanyInput {
  name: string;
  district: string;
  lat: number;
  lng: number;
}

/**
 * Retourne l'id d'un fokontany existant (nom + district, insensible à la casse)
 * ou en crée un nouveau. Appelé à la soumission de l'onboarding quand
 * l'utilisateur a saisi un fokontany qui n'existait pas encore.
 */
export async function upsertFokontany(input: UpsertFokontanyInput): Promise<string> {
  const name = input.name.trim();
  const district = input.district.trim();

  if (!name || !district) {
    throw new Error("Le nom et le district du fokontany sont requis.");
  }

  const supabase = await createClient();

  const { data: existing, error: searchError } = await supabase
    .from("fokontany")
    .select("id")
    .ilike("name", name)
    .ilike("district", district)
    .limit(1)
    .maybeSingle();

  if (searchError) {
    throw new Error(`Recherche fokontany échouée: ${searchError.message}`);
  }
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("fokontany")
    .insert({ name, district, lat: input.lat, lng: input.lng })
    .select("id")
    .single();

  if (insertError || !created) {
    throw new Error(`Création fokontany échouée: ${insertError?.message ?? "inconnue"}`);
  }
  return created.id;
}