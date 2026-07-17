"use client";

// ============================================================================
// screens/HomeScreen.tsx
// Point d'entrée UI mobile. Reçoit les données déjà chargées côté serveur
// (app/page.tsx) via props typées, gère l'état d'interaction (onglet actif,
// mise à jour optimiste des reports) et délègue l'affichage aux sous-écrans.
//
// NB: les sous-écrans existants (MapScreen, FeedScreen, ReportScreen,
// ProviderScreen, AIAdviceScreen, OnboardingScreen) utilisaient jusqu'ici des
// constantes statiques (CUT_COLORS/CUT_LABELS) importées de lib/jiro-data.
// Avec les disruption_types désormais pilotés par la DB, il faut y remplacer
// ces lookups statiques par `report.disruption_type` (voir ReportWithRelations).
// ============================================================================

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Map, ListChecks, PlusCircle, Sparkles, TrendingUp, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isProfileComplete } from "@/lib/utils";
import type {
  ReportWithRelations,
  FokontanyOption,
  DisruptionType,
  Activity,
  EmergencyContact,
  ProfileWithRelations,
  CreateReportDTO,
} from "@/types";
import { Activity as ActivityData, UserProfile } from "@/lib/jiro-data";
import { createReport, confirmReport, upsertProfile } from "@/lib/actions";

import OnboardingScreen from "@/components/screens/OnboardingScreen";
import MapScreen from "@/components/screens/MapScreen";
import ReportScreen from "@/components/screens/ReportScreen";
import FeedScreen from "@/components/screens/FeedScreen";
import AIAdviceScreen from "@/components/screens/AIAdviceScreen";
import ProviderScreen from "@/components/screens/ProviderScreen";
import PredictionScreen from "@/components/screens/PredictionScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import StatusBar from "../StatusBar";

interface Props {
  initialReports: ReportWithRelations[];
  fokontanyOptions: FokontanyOption[];
  disruptionTypes: DisruptionType[];
  activities: Activity[];
  emergencyContacts: EmergencyContact[];
  profile: ProfileWithRelations | null;
  userId: string | null;
}

type Tab = "map" | "feed" | "report" | "advice" | "prediction" | "profile";

export default function HomeScreen({
  initialReports,
  fokontanyOptions,
  disruptionTypes,
  activities,
  emergencyContacts,
  profile: initialProfile,
  userId,
}: Props) {
  const [reports, setReports] = useState<ReportWithRelations[]>(initialReports);
  const [profile, setProfile] = useState<ProfileWithRelations | null>(initialProfile);
  const [tab, setTab] = useState<Tab>("map");
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = typeof window === "undefined" ? null : createClient();

  // Vérifier si le profil est complet au chargement et au changement
  useEffect(() => {
    if (profile && !isProfileComplete(profile)) {
      setShowOnboardingModal(true);
    }
  }, [profile?.id]); // Dépendance sur profile.id pour éviter les appels répétés

  async function handleLogout() {
    // Ensure we sign out the browser Supabase client (clears localStorage session)
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      // ignore client sign-out errors, continue to server-side logout
    }

    // Notify server to clear auth cookies as well
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Redirect to login regardless; server cleared cookies if response.ok
      router.push("/login");
      return;
    } catch (err) {
      // If network fails, still redirect and refresh app state
      router.push("/login");
      return;
    }
  }

  // Aucune session active : à brancher sur votre écran de connexion Supabase Auth.
  if (!userId) {
    return (
      <div className="flex h-dvh items-center justify-center px-6 text-center text-sm text-muted-foreground">
        Veuillez vous connecter pour accéder à JiroRano Watch.
      </div>
    );
  }

  // Onboarding obligatoire tant qu'aucun profil n'est enregistré.
  if (!profile) {
    return (
      <OnboardingScreen
        activities={activities}
        fokontanyOptions={fokontanyOptions}
        userId={userId}
        onComplete={(dto) => {
          startTransition(async () => {
            const result = await upsertProfile(dto);
            if (result.success) {
              // Optimistic: on ne relit pas activity/fokontany_ref immédiatement,
              // ils seront hydratés au prochain rendu serveur (revalidatePath).
              setProfile({ ...result.data, activity: null, fokontany_ref: null });
            }
          });
        }}
      />
    );
  }

  /** Ajout optimiste d'un nouveau signalement citoyen ou officiel. */
  function handleCreateReport(dto: CreateReportDTO) {
    startTransition(async () => {
      const result = await createReport(dto);
      if (result.success) {
        const disruption_type =
          disruptionTypes.find((d) => d.code === result.data.type) ?? null;
        setReports((prev) => [
          { ...result.data, disruption_type, organization: null },
          ...prev,
        ]);
        setTab("feed");
      }
    });
  }

  /** Incrémente le compteur de confirmations avec mise à jour optimiste immédiate. */
  function handleConfirm(reportId: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, confirmations: r.confirmations + 1 } : r,
      ),
    );
    startTransition(async () => {
      const result = await confirmReport({ report_id: reportId, user_id: profile?.id });
      if (!result.success) {
        // revert on error
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? { ...r, confirmations: Math.max(0, r.confirmations - 1) }
              : r,
          ),
        );
      }
    });
  }

  /** Update profile via server action */
  async function handleUpdateProfile(dto: any) {
    try {
      const result = await upsertProfile(dto);
      if (result.success) {
        const activity = activities.find((a) => a.code === result.data.activity_code) ?? null;
        setProfile({ ...result.data, activity, fokontany_ref: null });
      } else {
        throw new Error("Erreur lors de la mise à jour du profil");
      }
    } catch (err) {
      throw err;
    }
  }

  return (
    <div className="flex items-center justify-center h-dvh flex-col bg-background overflow-hidden">
    <StatusBar 
      reports={reports} 
      profile={{
        activity: (profile.activity?.label_fr ?? "menage") as ActivityData, 
        fokontany: profile.fokontany_ref?.name ?? ""
      } as UserProfile} 
    />
    
    <main className="flex-1 overflow-y-auto flex flex-col justify-start items-center overscroll-contain min-h-0">
      <div className="flex flex-1 w-full max-w-2xl flex-col overflow-hidden bg-background">
        {tab === "map" && (<MapScreen reports={reports} disruptionTypes={disruptionTypes} onConfirm={handleConfirm} />)}
        {tab === "feed" && <FeedScreen reports={reports} onUpvote={handleConfirm} />}
        {tab === "report" && (
          profile.role === "provider" ? (
            <ProviderScreen
              defaultHotline=""
              disruptionTypes={disruptionTypes}
              interventionReasons={[]}
              organizationId={null}
              fokontanyOptions={fokontanyOptions}
              onSubmit={(r) => handleCreateReport({ ...r, reporter_id: profile.id })}
            />
          ) : (
            <ReportScreen
              defaultFokontanyId=""
              disruptionTypes={disruptionTypes}
              fokontanyOptions={fokontanyOptions}
              onSubmit={(r) => handleCreateReport({ ...r, reporter_id: profile.id })}
            />
          )
        )}
        {tab === "advice" && (
          <AIAdviceScreen
            profile={profile}
            reports={reports}
            emergencyContacts={emergencyContacts}
            activities={activities}
            fokontanyOptions={fokontanyOptions}
          />
        )}
        {tab === "prediction" && (<PredictionScreen reports={reports} fokontanyOptions={fokontanyOptions} />)}
        {tab === "profile" && (
          <ProfileScreen
            profile={profile}
            activities={activities}
            fokontanyOptions={fokontanyOptions}
            onUpdate={handleUpdateProfile}
            onLogout={handleLogout}
          />
        )}
      </div>
    </main>

      {/* Bottom nav — mobile-first, 6 zones tactiles larges */}
      <nav className="w-full max-w-2xl flex items-center justify-between border-t border-border bg-card px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <NavButton icon={Map} label="Carte" active={tab === "map"} onClick={() => setTab("map")} />
        <NavButton icon={ListChecks} label="Fil" active={tab === "feed"} onClick={() => setTab("feed")} />
        <NavButton
          icon={PlusCircle}
          label="Signaler"
          active={tab === "report"}
          onClick={() => setTab("report")}
          emphasized
        />
        <NavButton icon={Sparkles} label="Conseil IA" active={tab === "advice"} onClick={() => setTab("advice")} />
        <NavButton
          icon={TrendingUp}
          label="Prédiction"
          active={tab === "prediction"}
          onClick={() => setTab("prediction")}
        />
        <NavButton icon={User} label="Profil" active={tab === "profile"} onClick={() => setTab("profile")} />
      </nav>

      {isPending && (
        <div className="pointer-events-none fixed inset-x-0 top-0 h-0.5 animate-pulse bg-primary" />
      )}

      {/* Onboarding Modal - affichage si le profil n'est pas complet */}
      {showOnboardingModal && profile && (
        <div className="fixed inset-0 z-10050 flex items-end bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
              <h2 className="text-lg font-bold text-foreground">Complétez votre profil</h2>
              <button
                onClick={() => setShowOnboardingModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <OnboardingScreen
              activities={activities}
              fokontanyOptions={fokontanyOptions}
              userId={userId!}
              onComplete={(dto) => {
                startTransition(async () => {
                  const result = await upsertProfile(dto);
                  if (result.success) {
                    setProfile({ ...result.data, activity: null, fokontany_ref: null });
                    setShowOnboardingModal(false);
                  }
                });
              }}
              onSkip={() => setShowOnboardingModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
  emphasized,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  emphasized?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${active ? "text-primary" : "text-muted-foreground"
        }`}
    >
      <Icon className={emphasized ? "h-6 w-6" : "h-5 w-5"} />
      {label}
    </button>
  );
}
