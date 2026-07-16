"use client";

import { useState } from "react";
import { Report, CutType, FOKONTANY, CUT_COLORS } from "@/lib/jiro-data";
import { ShieldCheck, Calendar, Clock, FileText, Phone, Send, CheckCircle2, Zap, Droplets, Fuel } from "lucide-react";

// Approximate center coords per fokontany
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
}

const PROVIDER_TYPES: { type: CutType; label: string }[] = [
  { type: "power", label: "Coupure électricité planifiée" },
  { type: "water", label: "Rationnement eau" },
  { type: "fuel",  label: "Rupture carburant" },
];

const REASONS = [
  "Maintenance préventive",
  "Travaux réseau HTA",
  "Réparation conduite principale",
  "Rationnement eau saisonnière",
  "Défaut transformateur",
  "Mise à jour infrastructure",
];

export default function ProviderScreen({ onSubmit }: Props) {
  const [cutType, setCutType] = useState<CutType>("power");
  const [fokontanyList, setFokontanyList] = useState<string[]>(["Analakely"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState(REASONS[0]);
  const [hotline, setHotline] = useState("+261 20 22 393 00");
  const [toast, setToast] = useState(false);

  function toggleZone(f: string) {
    setFokontanyList((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }

  function handleSubmit() {
    fokontanyList.forEach((fkt) => {
      const coords = FOKONTANY_COORDS[fkt] ?? [-18.9101, 47.5362];
      const r: Omit<Report, "id" | "created_at" | "confirmations"> = {
        type: cutType,
        fokontany: fkt,
        description: `${reason} — Zone ${fkt}. Début: ${startTime}`,
        is_active: true,
        is_official: true,
        author: "JIRAMA",
        planned_end: endTime,
        reason,
        hotline: hotline || null,
        lat: coords[0] + (Math.random() - 0.5) * 0.004,
        lng: coords[1] + (Math.random() - 0.5) * 0.004,
      };
      onSubmit(r);
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

      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="rounded-xl bg-blue-500/20 p-2.5">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-blue-400">Mode Prestataire</h2>
          <p className="text-[11px] text-muted-foreground">Publier un avis officiel de maintenance</p>
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Type d&apos;intervention
        </label>
        <div className="flex gap-2">
          {PROVIDER_TYPES.map(({ type, label: _label }) => {
            const c = CUT_COLORS[type];
            const active = cutType === type;
            return (
              <button
                key={type}
                onClick={() => setCutType(type)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                  active ? `${c.border} ${c.bg}` : "border-border bg-card"
                }`}
              >
                {type === "power" ? (
                  <Zap className={`h-4 w-4 ${active ? c.text : "text-muted-foreground"}`} />
                ) : type === "water" ? (
                  <Droplets className={`h-4 w-4 ${active ? c.text : "text-muted-foreground"}`} />
                ) : (
                  <Fuel className={`h-4 w-4 ${active ? c.text : "text-muted-foreground"}`} />
                )}
                <span className={`text-[11px] font-semibold leading-tight ${active ? c.text : "text-muted-foreground"}`}>
                  {type === "power" ? "Électricité" : type === "water" ? "Eau" : "Carburant"}
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
          {FOKONTANY.map((f) => {
            const sel = fokontanyList.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleZone(f)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  sel
                    ? "border-amber-500/60 bg-amber-500/15 text-amber-400"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
        {fokontanyList.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {fokontanyList.length} zone{fokontanyList.length > 1 ? "s" : ""} sélectionnée{fokontanyList.length > 1 ? "s" : ""}
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

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />Motif</span>
        </label>
        <select
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {REASONS.map((r) => (
            <option key={r} value={r} className="bg-zinc-900">{r}</option>
          ))}
        </select>
      </div>

      {/* Hotline */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />Hotline / Contact</span>
        </label>
        <input
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="+261 XX XX XXX XX"
          value={hotline}
          onChange={(e) => setHotline(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={fokontanyList.length === 0}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white transition-opacity active:opacity-80 disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
        Publier l&apos;avis officiel
      </button>
    </div>
  );
}
