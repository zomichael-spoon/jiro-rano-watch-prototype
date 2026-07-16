"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Report, CutType, CUT_COLORS, CUT_LABELS, timeAgo,
} from "@/lib/jiro-data";
import {
  Zap, Droplets, AlertTriangle, Fuel, CheckCircle2,
  X, Users, MapPin, Clock, Phone, ChevronRight,
} from "lucide-react";

// ── Lazy-load the actual map (SSR must be off for Leaflet) ──────────────────
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  ),
});

interface Props {
  reports: Report[];
  onConfirm: (id: string) => void;
}

const CUT_ICON: Record<CutType, React.ReactNode> = {
  power:    <Zap className="h-3.5 w-3.5" />,
  water:    <Droplets className="h-3.5 w-3.5" />,
  dirty:    <AlertTriangle className="h-3.5 w-3.5" />,
  fuel:     <Fuel className="h-3.5 w-3.5" />,
  restored: <CheckCircle2 className="h-3.5 w-3.5" />,
};

const ALL_TYPES: CutType[] = ["power", "water", "dirty", "fuel", "restored"];

export default function MapScreen({ reports, onConfirm }: Props) {
  const [filterType, setFilterType] = useState<CutType | "all">("all");
  const [selected, setSelected] = useState<Report | null>(null);

  const visible = useMemo(
    () => reports.filter((r) => filterType === "all" || r.type === filterType),
    [reports, filterType],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Type filter bar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-3 pt-3 pb-2">
        {(["all", ...ALL_TYPES] as (CutType | "all")[]).map((t) => {
          const active = filterType === t;
          const colors = t !== "all" ? CUT_COLORS[t] : null;
          return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all ${
                active
                  ? t === "all"
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : `${colors!.border} ${colors!.bg} ${colors!.text}`
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {t !== "all" && CUT_ICON[t]}
              {t === "all" ? "Tout" : CUT_LABELS[t].split(" ")[1] || CUT_LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* Map fills remaining space */}
      <div className="relative flex-1 mx-3 mb-3 rounded-2xl overflow-hidden border border-border min-h-[300px]">
        <LeafletMap reports={visible} onMarkerClick={setSelected} />
      </div>

      {/* Count */}
      <div className="px-4 pb-2">
        <span className="text-xs text-muted-foreground">
          {visible.length} signalement{visible.length !== 1 ? "s" : ""} affiché{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Bottom drawer */}
      {selected && (
        <div
          className="absolute inset-0 z-[1000] flex flex-col justify-end"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 rounded-t-3xl border-t border-border bg-card p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${CUT_COLORS[selected.type].bg}`}>
                  <span className={CUT_COLORS[selected.type].text}>
                    {CUT_ICON[selected.type]}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{CUT_LABELS[selected.type]}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{selected.fokontany}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-secondary p-1.5 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              {selected.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(selected.created_at)}
              </span>
              {selected.author && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {selected.author}
                </span>
              )}
              {selected.is_official && (
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-blue-400 font-semibold">
                  Officiel
                </span>
              )}
            </div>

            {selected.reason && (
              <div className="rounded-xl border border-border bg-secondary p-3 mb-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Motif:</span> {selected.reason}
                {selected.planned_end && (
                  <span className="block mt-1">
                    <span className="font-semibold text-foreground">Fin prévue:</span>{" "}
                    {selected.planned_end}
                  </span>
                )}
              </div>
            )}

            {selected.hotline && (
              <a
                href={`tel:${selected.hotline}`}
                className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 mb-4"
              >
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-semibold">{selected.hotline}</span>
              </a>
            )}

            <button
              onClick={() => {
                onConfirm(selected.id);
                setSelected({ ...selected, confirmations: selected.confirmations + 1 });
              }}
              className="w-full flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5 transition-colors active:bg-amber-500/20"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">+1 Moi aussi / Aho koa</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-amber-400">{selected.confirmations}</span>
                <ChevronRight className="h-4 w-4 text-amber-400" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
