"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { X, Users, MapPin, Clock, Phone, ChevronRight } from "lucide-react";
import type { ReportWithRelations, DisruptionCode, DisruptionType } from "@/types";
import { resolveIcon, timeAgo } from "@/lib/utils";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  ),
});

interface Props {
  reports: ReportWithRelations[];
  disruptionTypes: DisruptionType[];
  onConfirm: (id: string) => void;
}

export default function MapScreen({ reports, disruptionTypes, onConfirm }: Props) {
  const [filterType, setFilterType] = useState<DisruptionCode | "all">("all");
  const [selected, setSelected] = useState<ReportWithRelations | null>(null);

  const visible = useMemo(
    () => reports.filter((r) => filterType === "all" || r.type === filterType),
    [reports, filterType],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Type filter bar — généré depuis disruption_types (ordre = sort_order) */}
      <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-none px-3 pt-3 pb-2">
        <button
          onClick={() => setFilterType("all")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all ${
            filterType === "all"
              ? "border-primary/60 bg-primary/15 text-primary"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          Tout
        </button>
        {disruptionTypes.map((dt) => {
          const Icon = resolveIcon(dt.icon);
          const active = filterType === dt.code;
          return (
            <button
              key={dt.code}
              onClick={() => setFilterType(dt.code)}
              className={`flex  items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all ${
                active
                  ? `${dt.color_border} ${dt.color_bg} ${dt.color_text}`
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {dt.label_fr}
            </button>
          );
        })}
      </div>

      {/* Map fills remaining space */}
      <div className="relative flex-1 mx-3 mb-3 rounded-2xl overflow-hidden border border-border min-h-75">
        <LeafletMap reports={visible} onMarkerClick={setSelected} />
      </div>

      <div className="px-4 pb-2">
        <span className="text-xs text-muted-foreground">
          {visible.length} signalement{visible.length !== 1 ? "s" : ""} affiché{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Bottom drawer */}
      {selected && (
        <ReportDrawer
          report={selected}
          onClose={() => setSelected(null)}
          onConfirm={() => {
            onConfirm(selected.id);
            setSelected({ ...selected, confirmations: selected.confirmations + 1 });
          }}
        />
      )}
    </div>
  );
}

function ReportDrawer({
  report,
  onClose,
  onConfirm,
}: {
  report: ReportWithRelations;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dt = report.disruption_type;
  const Icon = dt ? resolveIcon(dt.icon) : null;

  return (
    <div className="absolute inset-0 z-1000 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 rounded-t-3xl border-t border-border bg-card p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2.5 ${dt?.color_bg ?? "bg-secondary"}`}>
              <span className={dt?.color_text ?? "text-muted-foreground"}>
                {Icon && <Icon className="h-3.5 w-3.5" />}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{dt?.label_fr ?? report.type}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{report.fokontany}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-secondary p-1.5 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{report.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(report.created_at)}
          </span>
          {report.author && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {report.author}
            </span>
          )}
          {report.is_official && (
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-blue-400 font-semibold">
              Officiel
            </span>
          )}
        </div>

        {report.reason && (
          <div className="rounded-xl border border-border bg-secondary p-3 mb-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Motif:</span> {report.reason}
            {report.planned_end && (
              <span className="block mt-1">
                <span className="font-semibold text-foreground">Fin prévue:</span> {report.planned_end}
              </span>
            )}
          </div>
        )}

        {report.hotline && (
          <a
            href={`tel:${report.hotline}`}
            className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 mb-4"
          >
            <Phone className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-semibold">{report.hotline}</span>
          </a>
        )}

        {!report.is_official && (
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">+1 Moi aussi / Aho koa</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-amber-400">{report.confirmations}</span>
              <ChevronRight className="h-4 w-4 text-amber-400" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}