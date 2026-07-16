"use client";

import { useState } from "react";
import { Report, CutType, CUT_COLORS, CUT_LABELS, FOKONTANY } from "@/lib/jiro-data";
import { Zap, Droplets, AlertTriangle, Fuel, CheckCircle2, Send } from "lucide-react";

// Approximate center coords for each fokontany in Antananarivo
const FOKONTANY_COORDS: Record<string, [number, number]> = {
  "Analakely":       [-18.9101, 47.5362],
  "Antanimena":      [-18.9078, 47.5401],
  "Ambohijanaka":    [-18.9230, 47.5290],
  "Ivandry":         [-18.8871, 47.5497],
  "Ankorondrano":    [-18.8967, 47.5311],
  "Ambanidia":       [-18.9227, 47.5284],
  "Tsaralalàna":     [-18.9174, 47.5218],
  "Manjakamiadana":  [-18.9050, 47.5330],
  "Ampefiloha":      [-18.9155, 47.5370],
  "Ankadifotsy":     [-18.9305, 47.5350],
  "Antsahavola":     [-18.9130, 47.5310],
  "Behoririka":      [-18.9190, 47.5330],
  "Faravohitra":     [-18.9048, 47.5421],
  "Isoraka":         [-18.9200, 47.5400],
  "Ambohipo":        [-18.8980, 47.5600],
};

interface Props {
  onSubmit: (r: Omit<Report, "id" | "created_at" | "confirmations">) => void;
  defaultFokontany: string;
}

const TYPES: { type: CutType; Icon: React.ElementType; label: string; labelMg: string }[] = [
  { type: "power",    Icon: Zap,           label: "Coupure d'électricité", labelMg: "Tsy misy jiro" },
  { type: "water",    Icon: Droplets,       label: "Coupure d'eau",         labelMg: "Tsy misy rano" },
  { type: "dirty",    Icon: AlertTriangle,  label: "Eau sale",              labelMg: "Rano maloto" },
  { type: "fuel",     Icon: Fuel,           label: "Pénurie carburant",     labelMg: "Tsy misy solika" },
  { type: "restored", Icon: CheckCircle2,   label: "Service rétabli",       labelMg: "Vita ny fanitsiana" },
];

export default function ReportScreen({ onSubmit, defaultFokontany }: Props) {
  const [cutType, setCutType] = useState<CutType>("power");
  const [fokontany, setFokontany] = useState(defaultFokontany || FOKONTANY[0]);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [toast, setToast] = useState(false);

  function handleSubmit() {
    const coords = FOKONTANY_COORDS[fokontany] ?? [-18.9101, 47.5362];
    // Jitter slightly so multiple reports in same fokontany don't stack exactly
    const lat = coords[0] + (Math.random() - 0.5) * 0.005;
    const lng = coords[1] + (Math.random() - 0.5) * 0.005;

    const newReport: Omit<Report, "id" | "created_at" | "confirmations"> = {
      type: cutType,
      fokontany,
      description: description.trim() || CUT_LABELS[cutType] + " signalée par la communauté.",
      is_active: isActive,
      is_official: false,
      author: null,
      reason: null,
      planned_end: null,
      hotline: null,
      lat,
      lng,
    };
    onSubmit(newReport);
    setToast(true);
    setDescription("");
    setTimeout(() => setToast(false), 3000);
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6 relative">
      {/* Toast */}
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

      {/* Type selector */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Type de perturbation
        </label>
        <div className="flex flex-col gap-2">
          {TYPES.map(({ type, Icon, label, labelMg }) => {
            const c = CUT_COLORS[type];
            const active = cutType === type;
            return (
              <button
                key={type}
                onClick={() => setCutType(type)}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                  active ? `${c.border} ${c.bg}` : "border-border bg-card"
                }`}
              >
                <div className={`rounded-xl p-2 ${c.bg}`}>
                  <Icon className={`h-4 w-4 ${c.text}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${active ? c.text : "text-foreground"}`}>{label}</p>
                  <p className="text-[11px] text-muted-foreground">{labelMg}</p>
                </div>
                {active && <div className={`ml-auto h-2 w-2 rounded-full ${c.dot}`} />}
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
          value={fokontany}
          onChange={(e) => setFokontany(e.target.value)}
        >
          {FOKONTANY.map((f) => (
            <option key={f} value={f} className="bg-zinc-900">{f}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          Description (optionnel)
        </label>
        <textarea
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
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
              isActive
                ? "border-red-500/50 bg-red-500/10 text-red-400"
                : "border-border bg-card text-muted-foreground"
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

      {/* Submit */}
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
