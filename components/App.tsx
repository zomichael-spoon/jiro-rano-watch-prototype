// ============================================================================
// app/page.tsx
// Server Component "pur routage" : aucune logique UI ici. On récupère toutes
// les données nécessaires au premier rendu côté serveur (sécurisé, pas de
// clé exposée, pas de waterfall côté client) puis on les transmet, déjà
// typées, au composant d'écran mobile situé dans screens/.
// ============================================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeScreen from "@/components/screens/HomeScreen";
import type {
  ReportWithRelations,
  FokontanyOption,
  DisruptionType,
  Activity,
  EmergencyContact,
  ProfileWithRelations,
} from "@/types";

export const revalidate = 30; // 30s : données quasi temps-réel sans surcharger la DB

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Toutes les requêtes indépendantes sont lancées en parallèle.
  const [
    reportsRes,
    fokontanyRes,
    disruptionTypesRes,
    activitiesRes,
    emergencyContactsRes,
    profileRes,
  ] = await Promise.all([
    supabase
      .from("reports")
      .select(
        `*, disruption_type:disruption_types!reports_disruption_code_fkey(*),
         organization:provider_organizations(id, name, short_name, hotline)`,
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("fokontany").select("id, name, lat, lng").order("name"),
    supabase.from("disruption_types").select("*").order("sort_order"),
    supabase.from("activities").select("*").order("sort_order"),
    supabase
      .from("emergency_contacts")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    getCurrentProfile(supabase),
  ]);

  if (reportsRes.error) {
    throw new Error(`Erreur de chargement des signalements: ${reportsRes.error.message}`);
  }

  const reports = (reportsRes.data ?? []) as ReportWithRelations[];
  const fokontanyOptions = (fokontanyRes.data ?? []) as FokontanyOption[];
  const disruptionTypes = (disruptionTypesRes.data ?? []) as DisruptionType[];
  const activities = (activitiesRes.data ?? []) as Activity[];
  const emergencyContacts = (emergencyContactsRes.data ?? []) as EmergencyContact[];

  return (
    <HomeScreen
      initialReports={reports}
      fokontanyOptions={fokontanyOptions}
      disruptionTypes={disruptionTypes}
      activities={activities}
      emergencyContacts={emergencyContacts}
      profile={profileRes}
      userId={user?.id ?? null}
    />
  );
}

/**
 * Récupère le profil de l'utilisateur connecté, enrichi de son activité et
 * de son fokontany. Retourne `null` si aucun utilisateur n'est authentifié
 * (l'app doit alors afficher l'écran d'onboarding).
 */
async function getCurrentProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<ProfileWithRelations | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(`*, activity:activities(*), fokontany_ref:fokontany(*)`)
    .eq("id", user.id)
    .maybeSingle();

  return (data as ProfileWithRelations) ?? null;
}