"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Calendar, Clock, FileText, Phone, Send, CheckCircle2 } from "lucide-react";
import type {
  CreateOfficialReportDTO, DisruptionCode, DisruptionType,
  FokontanyOption, InterventionReason,
} from "@/types";
import { resolveIcon } from "@/lib/utils";

interface Props {
  disruptionTypes: DisruptionType[];
  fokontanyOptions: FokontanyOption[];
  interventionReasons: InterventionReason[];
  organizationId: string | null;
  defaultHotline: string;
  onSubmit: (r: Omit<CreateOfficialReportDTO, "reporter_id">) => void;
}

// Un prestataire ne publie jamais de "dirty" (constaté par un citoyen) ni "restored"
// (généré automatiquement à la clôture) — seulement des interventions planifiées.
const PLANNED_TYPES: DisruptionCode[] = ["power", "water", "fuel"];

export default function ProviderScreen({
  disruptionTypes,
  fokontanyOptions,
  interventionReasons,
  organizationId,
  defaultHotline,
  onSubmit,
}: Props) {
  const providerTypes = disruptionTypes.filter((d) => PLANNED_TYPES.includes(d.code));

  const [cutCode, setCutCode] = useState<DisruptionCode>(providerTypes[0]?.code ?? "power");
  const [fokontanyIds, setFokontanyIds] = useState<string[]>(
    fokontanyOptions[0] ? [fokontanyOptions[0].id] : [],
  );

  useEffect(() => {
    if (fokontanyIds.length === 0 && fokontanyOptions.length > 0) {
      setFokontanyIds([fokontanyOptions[0].id]);
    }
  }, [fokontanyIds.length, fokontanyOptions]);

  // Motifs filtrés par type sélectionné (intervention_reasons.disruption_type_code).
  const relevantReasons = interventionReasons.filter(
    (r) => r.disruption_type_code === cutCode || r.disruption_type_code === null,
  );

  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reasonId, setReasonId] = useState(relevantReasons[0]?.id ?? "");
  const [hotline, setHotline] = useState(defaultHotline);
  const [toast, setToast] = useState(false);

  function toggleZone(id: string) {
    setFokontanyIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSubmit() {
    const reason = relevantReasons.find((r) => r.id === reasonId) ?? relevantReasons[0];

    fokontanyIds.forEach((fid) => {
      const zone = fokontanyOptions.find((f) => f.id === fid);
      if (!zone) return;

      onSubmit({
        type: cutCode,
        disruption_code: cutCode,
        fokontany: zone.name,
        fokontany_id: zone.id,
        description: `${reason?.label_fr ?? "Intervention planifiée"} — Zone ${zone.name}. Début: ${startTime}`,
        is_active: true,
        is_official: true,
        author: null,
        reason: reason?.label_fr ?? null,
        reason_id: reason?.id ?? null,
        planned_end: endTime,
        hotline: hotline || null,
        organization_id: organizationId,
        lat: zone.lat + (Math.random() - 0.5) * 0.004,
        lng: zone.lng + (Math.random() - 0.5) * 0.004,
      });
    });

    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6 relative">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border border-blue-500/40 bg-blue-500/20 px-5 py-3 text-blue-400 text-sm font-semibold shadow-xl">
          <CheckCircle2 className="h-4 w-4" />
          Avis officiel publié! Avertissement envoyé.
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="rounded-xl bg-blue-500/20 p-2.5">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-blue-400">Mode Prestataire</h2>
          <p className="text-[11px] text-muted-foreground">Publier un avis officiel de maintenance</p>
        </div>
      </div>

      {/* Type — depuis disruption_types */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Type d&apos;intervention
        </label>
        <div className="flex gap-2">
          {providerTypes.map((dt) => {
            const Icon = resolveIcon(dt.icon);
            const active = cutCode === dt.code;
            return (
              <button
                key={dt.code}
                onClick={() => setCutCode(dt.code)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                  active ? `${dt.color_border} ${dt.color_bg}` : "border-border bg-card"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? dt.color_text : "text-muted-foreground"}`} />
                <span className={`text-[11px] font-semibold leading-tight ${active ? dt.color_text : "text-muted-foreground"}`}>
                  {dt.label_fr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zones */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Zones affectées (Fokontany)
        </label>
        <div className="flex flex-wrap gap-2">
          {fokontanyOptions.map((f) => {
            const sel = fokontanyIds.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleZone(f.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  sel
                    ? "border-amber-500/60 bg-amber-500/15 text-amber-400"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>
        {fokontanyIds.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {fokontanyIds.length} zone{fokontanyIds.length > 1 ? "s" : ""} sélectionnée{fokontanyIds.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Début</span>
          </label>
          <input
            type="time"
            className="w-full rounded-xl border border-border bg-secondary px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Fin prévue</span>
          </label>
          <input
            type="time"
            className="w-full rounded-xl border border-border bg-secondary px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {/* Reason — depuis intervention_reasons, filtré par type */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />Motif</span>
        </label>
        <select
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={reasonId}
          onChange={(e) => setReasonId(e.target.value)}
        >
          {relevantReasons.map((r) => (
            <option key={r.id} value={r.id} className="bg-zinc-900">{r.label_fr}</option>
          ))}
        </select>
      </div>

      {/* Hotline */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />Hotline / Contact</span>
        </label>
        <input
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="+261 XX XX XXX XX"
          value={hotline}
          onChange={(e) => setHotline(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={fokontanyIds.length === 0}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white transition-opacity active:opacity-80"
      >
        <Send className="h-4 w-4" />
        Publier l&apos;avis officiel
      </button>
    </div>
  );
}