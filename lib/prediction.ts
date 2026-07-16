// ============================================================================
// lib/prediction.ts
// Algorithme "prédictif" mocké : il n'appelle aucun modèle ML externe. Il
// analyse l'historique des reports (fréquence, intervalle moyen entre
// occurrences, récence) pour extrapoler statistiquement le prochain
// événement probable. Suffisant pour un MVP produit / démo, à remplacer plus
// tard par un vrai modèle de séries temporelles si besoin.
// ============================================================================

import type { DisruptionCode, ReportWithRelations } from "@/types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface ZoneRisk {
  fokontany: string;
  /** Score 0-100 : combine fréquence historique + récence + gravité (dirty/power pèsent plus). */
  riskScore: number;
  incidentCount: number;
  dominantType: DisruptionCode;
  lastIncidentAt: string | null;
}

export interface PredictedEvent {
  fokontany: string;
  type: DisruptionCode;
  /** Date ISO estimée du prochain événement, dérivée de l'intervalle moyen observé. */
  estimatedDate: string;
  /** Intervalle moyen (jours) entre deux occurrences de ce type dans cette zone. */
  averageIntervalDays: number;
  /** Confiance 0-1, croît avec le nombre d'occurrences observées. */
  confidence: number;
}

export interface PredictionResult {
  riskZones: ZoneRisk[]; // triées par riskScore décroissant
  nextPredictedEvent: PredictedEvent | null;
  globalTrend: {
    totalActive: number;
    mostFrequentType: DisruptionCode | null;
    last7Days: number;
  };
}

/** Poids de gravité par type — un incident "dirty" (eau sale) pèse plus qu'un "restored". */
const SEVERITY_WEIGHT: Record<DisruptionCode, number> = {
  dirty: 1.4,
  power: 1.2,
  water: 1.2,
  fuel: 1.0,
  restored: 0.2,
};

/**
 * Point d'entrée principal : transforme une liste de reports en prédiction.
 */
export function predictNextDisruption(
  reports: ReportWithRelations[],
): PredictionResult {
  const now = Date.now();
  const relevant = reports.filter((r) => r.type !== "restored");

  const riskZones = computeZoneRisk(relevant, now);
  const nextPredictedEvent = computeNextEvent(relevant, riskZones, now);
  const globalTrend = computeGlobalTrend(reports, now);

  return { riskZones, nextPredictedEvent, globalTrend };
}

// ---------------------------------------------------------------------------
// Étape 1 — score de risque par zone
// ---------------------------------------------------------------------------

function computeZoneRisk(reports: ReportWithRelations[], now: number): ZoneRisk[] {
  const byZone = groupBy(reports, (r) => r.fokontany);

  const zones: ZoneRisk[] = Object.entries(byZone).map(([fokontany, items]) => {
    const typeCounts = groupBy(items, (r) => r.type);
    const dominantType = (Object.entries(typeCounts).sort(
      (a, b) => b[1].length - a[1].length,
    )[0]?.[0] ?? "power") as DisruptionCode;

    const sortedByDate = [...items].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const lastIncidentAt = sortedByDate[0]?.created_at ?? null;

    // Récence : un incident d'aujourd'hui compte plus qu'un incident d'il y a 30 jours.
    const recencyScore = lastIncidentAt
      ? Math.max(0, 1 - (now - new Date(lastIncidentAt).getTime()) / (30 * MS_PER_DAY))
      : 0;

    // Gravité moyenne pondérée par type d'incident dans la zone.
    const severityScore =
      items.reduce((sum, r) => sum + SEVERITY_WEIGHT[r.type], 0) / items.length;

    // Fréquence normalisée (plafonnée à 10 incidents pour éviter qu'une zone
    // avec un historique massif écrase totalement les autres).
    const frequencyScore = Math.min(items.length / 10, 1);

    const riskScore = Math.round(
      (frequencyScore * 0.45 + recencyScore * 0.35 + (severityScore / 1.4) * 0.2) * 100,
    );

    return {
      fokontany,
      riskScore,
      incidentCount: items.length,
      dominantType,
      lastIncidentAt,
    };
  });

  return zones.sort((a, b) => b.riskScore - a.riskScore);
}

// ---------------------------------------------------------------------------
// Étape 2 — prochaine occurrence probable (zone la plus à risque)
// ---------------------------------------------------------------------------

function computeNextEvent(
  reports: ReportWithRelations[],
  riskZones: ZoneRisk[],
  now: number,
): PredictedEvent | null {
  const topZone = riskZones[0];
  if (!topZone || !topZone.lastIncidentAt) return null;

  // On isole l'historique de la zone + du type dominant pour calculer
  // l'intervalle moyen entre deux occurrences successives.
  const history = reports
    .filter((r) => r.fokontany === topZone.fokontany && r.type === topZone.dominantType)
    .map((r) => new Date(r.created_at).getTime())
    .sort((a, b) => a - b);

  if (history.length < 2) {
    // Pas assez d'historique pour un intervalle fiable : on utilise une
    // valeur par défaut prudente (7 jours) avec une confiance faible.
    const estimatedDate = new Date(now + 7 * MS_PER_DAY).toISOString();
    return {
      fokontany: topZone.fokontany,
      type: topZone.dominantType,
      estimatedDate,
      averageIntervalDays: 7,
      confidence: 0.25,
    };
  }

  const intervals: number[] = [];
  for (let i = 1; i < history.length; i++) {
    intervals.push((history[i] - history[i - 1]) / MS_PER_DAY);
  }
  const averageIntervalDays =
    intervals.reduce((sum, v) => sum + v, 0) / intervals.length;

  const lastOccurrence = history[history.length - 1];
  const estimatedDate = new Date(
    lastOccurrence + averageIntervalDays * MS_PER_DAY,
  ).toISOString();

  // Plus on a d'occurrences observées, plus la confiance grimpe (plafond 0.9
  // pour rappeler que ceci reste une heuristique, pas une certitude).
  const confidence = Math.min(0.3 + intervals.length * 0.1, 0.9);

  return {
    fokontany: topZone.fokontany,
    type: topZone.dominantType,
    estimatedDate,
    averageIntervalDays: Math.round(averageIntervalDays * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Étape 3 — tendance globale (bandeau résumé en haut de l'écran)
// ---------------------------------------------------------------------------

function computeGlobalTrend(reports: ReportWithRelations[], now: number) {
  const totalActive = reports.filter((r) => r.is_active && r.type !== "restored").length;

  const last7Days = reports.filter(
    (r) => now - new Date(r.created_at).getTime() <= 7 * MS_PER_DAY,
  ).length;

  const typeCounts = groupBy(
    reports.filter((r) => r.type !== "restored"),
    (r) => r.type,
  );
  const mostFrequentType =
    (Object.entries(typeCounts).sort((a, b) => b[1].length - a[1].length)[0]?.[0] as
      | DisruptionCode
      | undefined) ?? null;

  return { totalActive, mostFrequentType, last7Days };
}

// ---------------------------------------------------------------------------
// Helper générique
// ---------------------------------------------------------------------------

function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      (acc[key] ??= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}