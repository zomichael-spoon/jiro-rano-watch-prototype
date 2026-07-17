"use client";

import { useState } from "react";
import { User, Briefcase, ShieldCheck, Droplets, Zap, Loader2 } from "lucide-react";
import type { Activity, UserRole, UpsertProfileDTO, FokontanySelection, FokontanyOption } from "@/types";
import { FokontanyCombobox } from "@/components/FokontanyCombobox";
import { upsertFokontany } from "@/lib/actions";

interface Props {
  activities: Activity[];
  fokontanyOptions: FokontanyOption[];
  onComplete: (dto: UpsertProfileDTO) => void;
  onSkip?: () => void; // Optionnel : permet de sauter l'onboarding
  userId: string; // fourni par la session Supabase (auth.uid())
}

// export default function OnboardingScreen({
//   activities,
//   fokontanyOptions,
//   onComplete,
//   onSkip,
//   userId,
// }: Props) {
//   const [name, setName] = useState("");
//   const [role, setRole] = useState<UserRole>("citizen");
//   const [activityCode, setActivityCode] = useState(activities[0]?.code ?? "");
//   const [ville, setVille] = useState<string>(fokontanyOptions[0]?.district ?? "");
//   const [fokontanyId, setFokontanyId] = useState(fokontanyOptions[0]?.id ?? "");
//   userId: string;
// }

export default function OnboardingScreen({ activities, fokontanyOptions, onComplete, userId, onSkip }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [activityCode, setActivityCode] = useState(activities[0]?.code ?? "");
  const [fokontanySelection, setFokontanySelection] = useState<FokontanySelection | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ville, setVille] = useState<string>(fokontanyOptions[0]?.district ?? "");
  const [fokontanyId, setFokontanyId] = useState(fokontanyOptions[0]?.id ?? "");

  const selectedActivity = activities.find((a) => a.code === activityCode);
  const villes = Array.from(new Set(fokontanyOptions.map((f) => f.district).filter(Boolean as any))) as string[];
  const fokontanyFiltered = ville ? fokontanyOptions.filter((f) => f.district === ville) : fokontanyOptions;

  async function handleSubmit() {
    if (!name.trim() || !fokontanySelection) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const fokontanyId =
        fokontanySelection.kind === "existing"
          ? fokontanySelection.fokontany.id
          : await upsertFokontany({
            name: fokontanySelection.name,
            district: fokontanySelection.district,
            lat: fokontanySelection.lat,
            lng: fokontanySelection.lng,
          });

      const dto: UpsertProfileDTO = {
        id: userId,
        display_name: name.trim(),
        role,
        activity_code: activityCode || null,
        fokontany_id: fokontanyId,
        notes: notes.trim() || null,
        organization_name: null,
        is_verified_provider: false,
        notify_power: true,
        notify_water: true,
        notify_fuel: false,
        notify_dirty: true,
        avatar_url: null,
      };
      onComplete(dto);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 pt-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-amber-500/20 p-2.5">
            <Zap className="h-6 w-6 text-amber-400" />
          </div>
          <div className="rounded-xl bg-blue-500/20 p-2.5">
            <Droplets className="h-6 w-6 text-blue-400" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground tracking-tight">JiroRano Watch</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Signalement communautaire · Antananarivo
          </p>
        </div>
      </div>

      {/* Role selector */}
      <section>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Mon rôle / Ny andraikitro
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["citizen", "provider"] as const).map((r) => {
            const active = role === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${active
                  ? r === "citizen"
                    ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                    : "border-blue-500/60 bg-blue-500/10 text-blue-400"
                  : "border-border bg-card text-muted-foreground"
                  }`}
              >
                {r === "citizen" ? <User className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                <span className="text-sm font-semibold">{r === "citizen" ? "Citoyen" : "Prestataire"}</span>
                <span className="text-[11px] opacity-70 text-center leading-tight">
                  {r === "citizen" ? "Signaler / Manolotra" : "JIRAMA / Autorité"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Form */}
      <section className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Anarana (Nom)
          </label>
          <input
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Ex: Tiana Rakoto"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Activités
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              className="w-full rounded-xl border border-border bg-secondary pl-10 pr-4 py-3 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={activityCode}
              onChange={(e) => setActivityCode(e.target.value)}
            >
              {activities.map((a) => (
                <option key={a.code} value={a.code} className="bg-zinc-900">
                  {a.label_fr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Ville
          </label>
          <select
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
            value={ville}
            onChange={(e) => {
              setVille(e.target.value);
              setFokontanyId("");
            }}
          >
            <option value="">— Choisir une ville —</option>
            {villes.map((v) => (
              <option key={v} value={v} className="bg-zinc-900">
                {v}
              </option>
            ))}
          </select>

          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Fokontany (Zone)
          </label>
          <FokontanyCombobox value={fokontanySelection} onChange={setFokontanySelection} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Remarques spéciales
          </label>
          <textarea
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={3}
            placeholder="Informations supplémentaires sur votre situation..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </section>

      {/* Summary card */}
      {name && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Profil actif</p>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedActivity?.label_fr ?? "—"} ·{" "}
            {fokontanySelection?.kind === "existing"
              ? fokontanySelection.fokontany.name
              : fokontanySelection?.kind === "new"
                ? fokontanySelection.name
                : "—"}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${role === "citizen" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"
              }`}
          >
            {role === "citizen" ? "Citoyen" : "Prestataire"}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !fokontanySelection || submitting}
          className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-opacity active:opacity-80 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuer
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full rounded-2xl border border-border bg-transparent py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
          >
            Sauter pour maintenant
          </button>
        )}
      </div>
      {submitError && <p className="text-sm text-red-400 -mt-2">{submitError}</p>}
    </div >
  );
}