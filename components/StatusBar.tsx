"use client";

import { useState, useEffect } from "react";
import { UserProfile, Report } from "@/lib/jiro-data";
import { Zap, Droplets, ShieldCheck, User, Wifi } from "lucide-react";

interface Props {
  profile: UserProfile;
  reports: Report[];
}

export default function StatusBar({ profile, reports }: Props) {
  const activeCount = reports.filter((r) => r.is_active).length;
  const powerDown = reports.some((r) => r.is_active && r.type === "power");
  const waterDown = reports.some((r) => r.is_active && (r.type === "water" || r.type === "dirty"));

  // Render time client-side only to avoid SSR hydration mismatch
  const [timeStr, setTimeStr] = useState("--:--");
  useEffect(() => {
    function tick() {
      setTimeStr(new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }));
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border bg-background/95 backdrop-blur-sm z-20">
      {/* Left: App name + role */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <Droplets className="h-3.5 w-3.5 text-blue-400" />
        </div>
        <div>
          <span className="text-[13px] font-bold text-foreground tracking-tight">JiroRano</span>
          <span
            className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              profile.role === "provider"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {profile.role === "provider" ? (
              <span className="flex items-center gap-0.5">
                <ShieldCheck className="h-2.5 w-2.5 inline" /> Prestataire
              </span>
            ) : (
              <span className="flex items-center gap-0.5">
                <User className="h-2.5 w-2.5 inline" /> Citoyen
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Center: live status dots */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              powerDown ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <Zap className={`h-3 w-3 ${powerDown ? "text-amber-400" : "text-emerald-400"}`} />
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              waterDown ? "bg-blue-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <Droplets className={`h-3 w-3 ${waterDown ? "text-blue-400" : "text-emerald-400"}`} />
        </div>
        {activeCount > 0 && (
          <span className="rounded-full bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
            {activeCount}
          </span>
        )}
      </div>

      {/* Right: time + wifi */}
      <div className="flex items-center gap-2">
        <Wifi className="h-3 w-3 text-muted-foreground" />
        <span className="text-[12px] font-semibold text-foreground tabular-nums">{timeStr}</span>
      </div>
    </header>
  );
}
