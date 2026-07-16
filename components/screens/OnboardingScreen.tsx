"use client";

import { UserProfile, Role, Activity, ACTIVITIES, FOKONTANY } from "@/lib/jiro-data";
import { User, Briefcase, ShieldCheck, Droplets, Zap } from "lucide-react";

interface Props {
  profile: UserProfile;
  onChange: (p: UserProfile) => void;
}

export default function OnboardingScreen({ profile, onChange }: Props) {
  const set = (key: keyof UserProfile, val: string) =>
    onChange({ ...profile, [key]: val });

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
          {(["citizen", "provider"] as Role[]).map((r) => {
            const active = profile.role === r;
            return (
              <button
                key={r}
                onClick={() => set("role", r)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                  active
                    ? r === "citizen"
                      ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                      : "border-blue-500/60 bg-blue-500/10 text-blue-400"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {r === "citizen" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
                <span className="text-sm font-semibold">
                  {r === "citizen" ? "Citoyen" : "Prestataire"}
                </span>
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
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Ex: Tiana Rakoto"
            value={profile.name}
            onChange={(e) => set("name", e.target.value)}
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
              value={profile.activity}
              onChange={(e) => set("activity", e.target.value as Activity)}
            >
              {(Object.keys(ACTIVITIES) as Activity[]).map((a) => (
                <option key={a} value={a} className="bg-zinc-900">
                  {ACTIVITIES[a]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Fokontany (Zone)
          </label>
          <select
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={profile.fokontany}
            onChange={(e) => set("fokontany", e.target.value)}
          >
            {FOKONTANY.map((f) => (
              <option key={f} value={f} className="bg-zinc-900">
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            Remarques spéciales
          </label>
          <textarea
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={3}
            placeholder="Informations supplémentaires sur votre situation..."
            value={profile.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </section>

      {/* Summary card */}
      {profile.name && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Profil actif</p>
          <p className="text-sm font-semibold text-foreground">{profile.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {ACTIVITIES[profile.activity]} · {profile.fokontany}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              profile.role === "citizen"
                ? "bg-amber-500/15 text-amber-400"
                : "bg-blue-500/15 text-blue-400"
            }`}
          >
            {profile.role === "citizen" ? "Citoyen" : "Prestataire"}
          </span>
        </div>
      )}
    </div>
  );
}
