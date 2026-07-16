"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Screen, UserProfile, Activity, Report,
} from "@/lib/jiro-data";
import { createClient } from "@/lib/supabase/client";

import StatusBar from "./StatusBar";
import BottomNav from "./BottomNav";
import OnboardingScreen from "./screens/OnboardingScreen";
import MapScreen from "./screens/MapScreen";
import ReportScreen from "./screens/ReportScreen";
import ProviderScreen from "./screens/ProviderScreen";
import FeedScreen from "./screens/FeedScreen";
import AIAdviceScreen from "./screens/AIAdviceScreen";

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  activity: "menage" as Activity,
  fokontany: "Analakely",
  notes: "",
  role: "citizen",
};

const screenTitles: Record<Screen, string> = {
  map:        "Carte en direct",
  report:     "Signaler une panne",
  provider:   "Avis de maintenance",
  feed:       "Fil d'actualité",
  ai:         "Conseil IA",
  onboarding: "Mon profil",
};

export default function JiroApp() {
  const [screen, setScreen] = useState<Screen>("map");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // ── Fetch all reports ───────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setReports(data as Report[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();

    // Real-time subscription: refresh on any change
    const channel = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        () => fetchReports(),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchReports]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  async function addReport(row: Omit<Report, "id" | "created_at" | "confirmations">) {
    const { data, error } = await supabase
      .from("reports")
      .insert({ ...row, confirmations: 0 })
      .select()
      .single();
    if (!error && data) setReports((prev) => [data as Report, ...prev]);
  }

  async function confirmReport(id: string) {
    // Optimistic update first
    setReports((prev) =>
      prev.map((r) => r.id === id ? { ...r, confirmations: r.confirmations + 1 } : r),
    );
    const current = reports.find((r) => r.id === id);
    if (current) {
      await supabase
        .from("reports")
        .update({ confirmations: current.confirmations + 1 })
        .eq("id", id);
    }
  }

  return (
    <div className="flex flex-col h-dvh max-h-dvh bg-background overflow-hidden">
      {/* Top status bar */}
      <StatusBar profile={profile} reports={reports} />

      {/* Screen title */}
      <div className="flex-shrink-0 px-4 pt-3 pb-1 border-b border-border/50">
        <h1 className="text-base font-bold text-foreground text-balance">
          {screenTitles[screen]}
        </h1>
      </div>

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto overscroll-contain min-h-0">
        {loading && screen !== "map" ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {screen === "onboarding" && (
              <OnboardingScreen profile={profile} onChange={setProfile} />
            )}
            {screen === "map" && (
              <div className="relative h-full max-w-screen">
                <MapScreen reports={reports} onConfirm={confirmReport} />
              </div>
            )}
            {screen === "report" && (
              <ReportScreen
                onSubmit={addReport}
                defaultFokontany={profile.fokontany}
              />
            )}
            {screen === "provider" && (
              <ProviderScreen onSubmit={addReport} />
            )}
            {screen === "feed" && (
              <FeedScreen reports={reports} onUpvote={confirmReport} />
            )}
            {screen === "ai" && (
              <AIAdviceScreen profile={profile} reports={reports} />
            )}
          </>
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav
        current={screen}
        role={profile.role}
        onChange={setScreen}
        reportCount={reports.filter((r) => r.is_active).length}
      />
    </div>
  );
}
