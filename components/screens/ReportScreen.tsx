"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import type { CreateReportDTO, DisruptionCode, DisruptionType, FokontanyOption } from "@/types";
import { resolveIcon } from "@/lib/utils";

const FALLBACK_DISRUPTION_TYPES: DisruptionType[] = [
  {
    id: "fallback-power",
    code: "power",
    label_fr: "Coupure d'électricité",
    label_mg: "Tsy misy herinaratra",
    color_bg: "bg-amber-500/15",
    color_text: "text-amber-400",
    color_border: "border-amber-500/40",
    color_dot: "bg-amber-400",
    icon: "zap",
    sort_order: 1,
    created_at: "",
  },
  {
    id: "fallback-water",
    code: "water",
    label_fr: "Coupure d'eau",
    label_mg: "Tsy misy rano",
    color_bg: "bg-blue-500/15",
    color_text: "text-blue-400",
    color_border: "border-blue-500/40",
    color_dot: "bg-blue-400",
    icon: "droplets",
    sort_order: 2,
    created_at: "",
  },
  {
    id: "fallback-dirty",
    code: "dirty",
    label_fr: "Eau sale / polluée",
    label_mg: "Rano maloto",
    color_bg: "bg-orange-800/20",
    color_text: "text-orange-400",
    color_border: "border-orange-700/40",
    color_dot: "bg-orange-600",
    icon: "alert-triangle",
    sort_order: 3,
    created_at: "",
  },
  {
    id: "fallback-fuel",
    code: "fuel",
    label_fr: "Pénurie de carburant",
    label_mg: "Tsy ampy solika",
    color_bg: "bg-orange-500/15",
    color_text: "text-orange-400",
    color_border: "border-orange-500/40",
    color_dot: "bg-orange-400",
    icon: "fuel",
    sort_order: 4,
    created_at: "",
  },
  {
    id: "fallback-road",
    code: "road",
    label_fr: "Route bloquée",
    label_mg: "Lalana tapaka",
    color_bg: "bg-violet-500/15",
    color_text: "text-violet-400",
    color_border: "border-violet-500/40",
    color_dot: "bg-violet-400",
    icon: "map-pin",
    sort_order: 5,
    created_at: "",
  },
  {
    id: "fallback-internet",
    code: "internet",
    label_fr: "Coupure d'internet",
    label_mg: "Internet tapaka",
    color_bg: "bg-cyan-500/15",
    color_text: "text-cyan-400",
    color_border: "border-cyan-500/40",
    color_dot: "bg-cyan-400",
    icon: "globe",
    sort_order: 6,
    created_at: "",
  },
  {
    id: "fallback-restored",
    code: "restored",
    label_fr: "Service rétabli",
    label_mg: "Serivisy averina",
    color_bg: "bg-emerald-500/15",
    color_text: "text-emerald-400",
    color_border: "border-emerald-500/40",
    color_dot: "bg-emerald-400",
    icon: "check-circle-2",
    sort_order: 7,
    created_at: "",
  },
];

const TYPE_ORDER: Record<DisruptionCode, number> = {
  power: 0,
  water: 1,
  dirty: 2,
  fuel: 3,
  road: 4,
  internet: 5,
  restored: 6,
};

interface Props {
  disruptionTypes: DisruptionType[];
  fokontanyOptions: FokontanyOption[];
  defaultFokontanyId: string;
  onSubmit: (r: Omit<CreateReportDTO, "reporter_id">) => void;
}

export default function ReportScreen({
  disruptionTypes,
  fokontanyOptions,
  defaultFokontanyId,
  onSubmit,
}: Props) {
  const allDisruptionTypes = [
    ...disruptionTypes,
    ...FALLBACK_DISRUPTION_TYPES.filter((fallback) => !disruptionTypes.some((d) => d.code === fallback.code)),
  ].sort((a, b) => TYPE_ORDER[a.code] - TYPE_ORDER[b.code]);

  // On exclut "restored" des choix citoyens actifs : géré via le toggle statut.
  const selectableTypes = allDisruptionTypes.filter((d) => d.code !== "restored");

  const [cutCode, setCutCode] = useState<DisruptionCode>(selectableTypes[0]?.code ?? "power");
  const [fokontanyId, setFokontanyId] = useState(defaultFokontanyId || fokontanyOptions[0]?.id || "");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [toast, setToast] = useState(false);

  function handleSubmit() {
    const zone = fokontanyOptions.find((f) => f.id === fokontanyId) ?? fokontanyOptions[0];
    if (!zone) return;

    const dt = allDisruptionTypes.find((d) => d.code === cutCode);
    // Jitter léger pour éviter que plusieurs reports d'une même zone se superposent exactement.
    const lat = zone.lat + (Math.random() - 0.5) * 0.005;
    const lng = zone.lng + (Math.random() - 0.5) * 0.005;

    onSubmit({
      type: cutCode,
      disruption_code: cutCode,
      fokontany: zone.name,
      fokontany_id: zone.id,
      description: description.trim() || `${dt?.label_fr ?? cutCode} signalée par la communauté.`,
      is_active: isActive,
      is_official: false,
      author: null,
      reason: null,
      reason_id: null,
      planned_end: null,
      hotline: null,
      organization_id: null,
      lat,
      lng,
    });

    setToast(true);
    setDescription("");
    setTimeout(() => setToast(false), 3000);
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6 relative">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/20 px-5 py-3 text-emerald-400 text-sm font-semibold shadow-xl">
          <CheckCircle2 className="h-4 w-4" />
          Signalement envoyé! Misaotra anao.
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-foreground">Nouveau signalement</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Rapporter une coupure dans votre zone</p>
      </div>

      {/* Type selector — généré depuis disruption_types */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Type de perturbation
        </label>
        <div className="flex flex-col gap-2">
          {selectableTypes.map((dt) => {
            const Icon = resolveIcon(dt.icon);
            const active = cutCode === dt.code;
            return (
              <button
                key={dt.code}
                onClick={() => setCutCode(dt.code)}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                  active ? `${dt.color_border} ${dt.color_bg}` : "border-border bg-card"
                }`}
              >
                <div className={`rounded-xl p-2 ${dt.color_bg}`}>
                  <Icon className={`h-4 w-4 ${dt.color_text}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${active ? dt.color_text : "text-foreground"}`}>
                    {dt.label_fr}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{dt.label_mg}</p>
                </div>
                {active && <div className={`ml-auto h-2 w-2 rounded-full ${dt.color_dot}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fokontany */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          Fokontany (Zone)
        </label>
        <select
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={fokontanyId}
          onChange={(e) => setFokontanyId(e.target.value)}
        >
          {fokontanyOptions.map((f) => (
            <option key={f.id} value={f.id} className="bg-zinc-900">{f.name}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          Description (optionnel)
        </label>
        <textarea
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          rows={3}
          placeholder="Décrivez la situation..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Active toggle */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Statut actuel
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsActive(true)}
            className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
              isActive ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-border bg-card text-muted-foreground"
            }`}
          >
            Panne active
          </button>
          <button
            onClick={() => setIsActive(false)}
            className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
              !isActive
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            Rétabli
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-opacity active:opacity-80"
      >
        <Send className="h-4 w-4" />
        Envoyer le signalement
      </button>
    </div>
  );
}