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

import { useState, useTransition } from "react";
import { Map, ListChecks, PlusCircle, Sparkles, TrendingUp } from "lucide-react";
import type {
  ReportWithRelations,
  FokontanyOption,
  DisruptionType,
  Activity,
  EmergencyContact,
  ProfileWithRelations,
  CreateReportDTO,
} from "@/types";
import { createReport, confirmReport, upsertProfile } from "@/lib/actions";

import OnboardingScreen from "@/components/screens/OnboardingScreen";
import MapScreen from "@/components/screens/MapScreen";
import ReportScreen from "@/components/screens/ReportScreen";
import FeedScreen from "@/components/screens/FeedScreen";
import AIAdviceScreen from "@/components/screens/AIAdviceScreen";
import ProviderScreen from "@/components/screens/ProviderScreen";
import PredictionScreen from "@/components/screens/PredictionScreen";

interface Props {
  initialReports: ReportWithRelations[];
  fokontanyOptions: FokontanyOption[];
  disruptionTypes: DisruptionType[];
  activities: Activity[];
  emergencyContacts: EmergencyContact[];
  profile: ProfileWithRelations | null;
  userId: string | null;
}

type Tab = "map" | "feed" | "report" | "advice" | "prediction";

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
  const [isPending, startTransition] = useTransition();

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
        // Rollback si l'action serveur échoue.
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, confirmations: r.confirmations - 1 } : r,
          ),
        );
      }
    });
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <main className="flex-1 overflow-y-auto">
        {tab === "map" && (<MapScreen reports={reports} disruptionTypes={disruptionTypes} onConfirm={handleConfirm} />)}
        {tab === "feed" && <FeedScreen reports={reports} onUpvote={handleConfirm} />}
        {tab === "report" &&
          (profile.role === "provider" ? (
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
          ))}
        {tab === "advice" && <AIAdviceScreen profile={profile} reports={reports} emergencyContacts={emergencyContacts} />}
        {tab === "prediction" && (<PredictionScreen reports={reports} fokontanyOptions={fokontanyOptions} />)}
      </main>

      {/* Bottom nav — mobile-first, 5 zones tactiles larges */}
      <nav className="flex items-center justify-around border-t border-border bg-card px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
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
      </nav>

      {isPending && (
        <div className="pointer-events-none fixed inset-x-0 top-0 h-0.5 animate-pulse bg-primary" />
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