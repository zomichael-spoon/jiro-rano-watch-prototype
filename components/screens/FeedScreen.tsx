"use client";

import { useState } from "react";
import {
  Report, CutType, CUT_COLORS, CUT_LABELS, timeAgo,
} from "@/lib/jiro-data";
import {
  Zap, Droplets, AlertTriangle, Fuel, CheckCircle2,
  ShieldCheck, ChevronUp, Clock, Users, MapPin,
} from "lucide-react";

interface Props {
  reports: Report[];
  onUpvote: (id: string) => void;
}

const ICON: Record<CutType, React.ElementType> = {
  power: Zap,
  water: Droplets,
  dirty: AlertTriangle,
  fuel: Fuel,
  restored: CheckCircle2,
};

type Filter = "all" | "official" | "citizen";

export default function FeedScreen({ reports, onUpvote }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = [...reports]
    .filter((r) => {
      if (filter === "official") return r.is_official;
      if (filter === "citizen") return !r.is_official;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="flex gap-2 px-4 pt-4 pb-3">
        {(["all", "official", "citizen"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === f
                ? f === "official"
                  ? "border-blue-500/60 bg-blue-500/15 text-blue-400"
                  : f === "citizen"
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-400"
                  : "border-primary/60 bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {f === "all" ? "Tout" : f === "official" ? "Officiels" : "Citoyens"}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted-foreground">
          {sorted.length} rapports
        </span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-3">
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <CheckCircle2 className="h-8 w-8 opacity-30" />
            <p className="text-sm">Aucun signalement pour le moment</p>
          </div>
        )}
        {sorted.map((r) => {
          const c = CUT_COLORS[r.type];
          const Icon = ICON[r.type];
          return (
            <article
              key={r.id}
              className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col gap-3`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`rounded-lg p-1.5 shrink-0 bg-black/20`}>
                    <Icon className={`h-3.5 w-3.5 ${c.text}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wide ${c.text}`}>
                        {CUT_LABELS[r.type]}
                      </span>
                      {r.is_official && (
                        <span className="flex items-center gap-0.5 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          OFFICIEL
                        </span>
                      )}
                      {!r.is_active && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          RÉSOLU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-2.5 w-2.5" />
                        {r.fokontany}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(r.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-foreground/80 leading-relaxed">
                {r.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {r.is_official
                      ? r.author || "JIRAMA"
                      : `Confirmé par ${r.confirmations} personne${r.confirmations !== 1 ? "s" : ""}`}
                  </span>
                </div>
                {!r.is_official && (
                  <button
                    onClick={() => onUpvote(r.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${c.border} ${c.bg} ${c.text} active:opacity-70`}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    {r.confirmations}
                  </button>
                )}
                {r.is_official && r.planned_end && (
                  <span className="text-xs text-muted-foreground">
                    Fin prévue: <span className="text-foreground font-semibold">{r.planned_end}</span>
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
