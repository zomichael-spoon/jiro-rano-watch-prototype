"use client";

import { useState } from "react";
import { User, Mail, MapPin, Briefcase, Save, LogOut, Edit2, X } from "lucide-react";
import type { Activity, FokontanyOption, ProfileWithRelations, UpsertProfileDTO } from "@/types";

interface Props {
  profile: ProfileWithRelations | null;
  activities: Activity[];
  fokontanyOptions: FokontanyOption[];
  onUpdate: (dto: UpsertProfileDTO) => Promise<void>;
  onLogout: () => void;
}

export default function ProfileScreen({
  profile,
  activities,
  fokontanyOptions,
  onUpdate,
  onLogout,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [activityCode, setActivityCode] = useState(profile?.activity_code || "");
  const [fokontanyId, setFokontanyId] = useState(profile?.fokontany_id || "");

  const selectedActivity = activities.find((a) => a.code === activityCode);
  const selectedZone = fokontanyOptions.find((z) => z.id === fokontanyId);

  async function handleSave() {
    if (!displayName.trim()) {
      alert("Veuillez entrer votre nom");
      return;
    }

    try {
      // Build complete UpsertProfileDTO with all required fields
      const profileUpdate = {
        id: profile!.id,
        display_name: displayName.trim(),
        role: profile!.role,
        activity_code: activityCode || null,
        fokontany_id: fokontanyId || null,
        notes: profile!.notes,
        organization_name: profile!.organization_name,
        is_verified_provider: profile!.is_verified_provider,
        notify_power: profile!.notify_power,
        notify_water: profile!.notify_water,
        notify_fuel: profile!.notify_fuel,
        notify_dirty: profile!.notify_dirty,
        avatar_url: profile!.avatar_url,
      };
      await onUpdate(profileUpdate);
      setIsEditing(false);
    } catch (err) {
      alert((err as Error).message || "Erreur lors de la mise à jour");
    }
  }

  function handleCancel() {
    setDisplayName(profile?.display_name || "");
    setActivityCode(profile?.activity_code || "");
    setFokontanyId(profile?.fokontany_id || "");
    setIsEditing(false);
  }

  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-24 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
        <button
          onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          className={`rounded-full p-2 transition-colors ${
            isEditing
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          {isEditing ? <X className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-border bg-card p-6 mb-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Votre nom"
                className="w-full text-lg font-bold bg-secondary rounded-xl px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <h2 className="text-lg font-bold text-foreground">{displayName || "Utilisateur"}</h2>
            )}
            <p className="text-xs text-muted-foreground mt-1">ID: {profile.id.slice(0, 8)}...</p>
          </div>
        </div>

        {/* Info Fields */}
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">ID Utilisateur</p>
              <p className="text-sm text-muted-foreground text-ellipsis truncate">{profile.id.slice(0, 8)}...</p>
            </div>
          </div>

          {/* Activity */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50">
            <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Activité</p>
              {isEditing ? (
                <select
                  value={activityCode}
                  onChange={(e) => setActivityCode(e.target.value)}
                  className="w-full text-sm bg-background rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">— Choisir une activité —</option>
                  {activities.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.label_fr}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-foreground">{selectedActivity?.label_fr || "Non défini"}</p>
              )}
            </div>
          </div>

          {/* Zone/Fokontany */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Zone (Fokontany)</p>
              {isEditing ? (
                <select
                  value={fokontanyId}
                  onChange={(e) => setFokontanyId(e.target.value)}
                  className="w-full text-sm bg-background rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">— Choisir une zone —</option>
                  {fokontanyOptions.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-foreground">{selectedZone?.name || "Non défini"}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50">
            <User className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Rôle</p>
              <p className="text-sm text-foreground capitalize">{profile.role || "Citoyen"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-auto">
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={!displayName.trim()}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Enregistrer les modifications
          </button>
        )}

        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-4 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
