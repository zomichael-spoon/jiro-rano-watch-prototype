"use client";

// ============================================================================
// screens/PredictionScreen.tsx
// Affiche le résultat de lib/prediction.ts : tendance globale, zone la plus
// à risque, et prochaine occurrence estimée. Design mobile-first, cohérent
// avec le reste de l'app (cards arrondies, badges, palette ambre/bleu).
// ============================================================================

import { useMemo } from "react";
import {
  TrendingUp, AlertTriangle, MapPin, Calendar,
  Zap, Droplets, Fuel, Gauge, Info,
} from "lucide-react";
import { predictNextDisruption } from "@/lib/prediction";
import type { ReportWithRelations, FokontanyOption, DisruptionCode } from "@/types";

interface Props {
  reports: ReportWithRelations[];
  fokontanyOptions: FokontanyOption[];
}

const TYPE_ICON: Record<DisruptionCode, React.ElementType> = {
  power: Zap,
  water: Droplets,
  dirty: AlertTriangle,
  fuel: Fuel,
  restored: TrendingUp,
};

const TYPE_LABEL_FR: Record<DisruptionCode, string> = {
  power: "coupure d'électricité",
  water: "coupure d'eau",
  dirty: "eau polluée",
  fuel: "pénurie de carburant",
  restored: "rétablissement",
};

export default function PredictionScreen({ reports, fokontanyOptions }: Props) {
  // Recalculé uniquement quand la liste de reports change (évite de
  // relancer l'analyse à chaque re-render du composant parent).
  const prediction = useMemo(() => predictNextDisruption(reports), [reports]);
  const { riskZones, nextPredictedEvent, globalTrend } = prediction;

  const topZones = riskZones.slice(0, 5);

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
        <div className="rounded-xl bg-primary/20 p-2.5">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">Analyse prédictive</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Basée sur {reports.length} signalement{reports.length !== 1 ? "s" : ""} historiques
          </p>
        </div>
      </div>

      {/* Bandeau tendance globale */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Actifs" value={globalTrend.totalActive} />
        <StatCard label="7 derniers jours" value={globalTrend.last7Days} />
        <StatCard
          label="Type dominant"
          value={
            globalTrend.mostFrequentType
              ? TYPE_LABEL_FR[globalTrend.mostFrequentType].split(" ")[0]
              : "—"
          }
          isText
        />
      </div>

      {/* Prochain événement prédit */}
      {nextPredictedEvent ? (
        <PredictedEventCard event={nextPredictedEvent} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Historique insuffisant pour formuler une prédiction fiable. Plus de
            signalements permettront d&apos;affiner l&apos;analyse.
          </p>
        </div>
      )}

      {/* Classement des zones à risque */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Zones les plus à risque
        </label>
        <div className="flex flex-col gap-2">
          {topZones.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Aucune donnée exploitable pour le moment.
            </p>
          )}
          {topZones.map((zone, i) => {
            const Icon = TYPE_ICON[zone.dominantType];
            return (
              <div
                key={zone.fokontany}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {zone.fokontany}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      {TYPE_LABEL_FR[zone.dominantType]} · {zone.incidentCount} incident
                      {zone.incidentCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <RiskGauge score={zone.riskScore} />
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Prédiction statistique basée sur les tendances historiques locales — à
        titre indicatif, ne remplace pas une communication officielle de
        JIRAMA sur {fokontanyOptions.length} zones suivies.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  isText,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 flex flex-col items-center gap-1">
      <span className={`font-bold text-foreground ${isText ? "text-sm capitalize" : "text-xl"}`}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function RiskGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-red-400" : score >= 40 ? "text-amber-400" : "text-emerald-400";
  const bg =
    score >= 70 ? "bg-red-500/15" : score >= 40 ? "bg-amber-500/15" : "bg-emerald-500/15";

  return (
    <div className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 ${bg}`}>
      <Gauge className={`h-3.5 w-3.5 ${color}`} />
      <span className={`text-xs font-bold ${color}`}>{score}</span>
    </div>
  );
}

function PredictedEventCard({
  event,
}: {
  event: ReturnType<typeof predictNextDisruption>["nextPredictedEvent"];
}) {
  if (!event) return null;
  const Icon = TYPE_ICON[event.type];
  const date = new Date(event.estimatedDate);
  const confidencePct = Math.round(event.confidence * 100);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-amber-500/20 p-2">
          <Icon className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-400">Prochain événement probable</p>
          <p className="text-[11px] text-muted-foreground">
            {TYPE_LABEL_FR[event.type]} · {event.fokontany}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-foreground font-semibold">
            {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          intervalle moyen: {event.averageIntervalDays}j
        </span>
      </div>

      {/* Barre de confiance */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Fiabilité de l&apos;estimation
          </span>
          <span className="text-[10px] font-bold text-amber-400">{confidencePct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
