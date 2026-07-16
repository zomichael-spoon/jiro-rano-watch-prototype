"use client";

import { Screen, Role } from "@/lib/jiro-data";
// reportCount is passed in as a pre-computed number from JiroApp
import { User, Map, PlusCircle, ShieldCheck, Rss, Sparkles } from "lucide-react";

interface NavItem {
  screen: Screen;
  label: string;
  Icon: React.ElementType;
  roleOnly?: Role;
}

const NAV_ITEMS: NavItem[] = [
  { screen: "map",        label: "Carte",     Icon: Map },
  { screen: "report",     label: "Signaler",  Icon: PlusCircle,  roleOnly: "citizen" },
  { screen: "provider",   label: "Avis",      Icon: ShieldCheck, roleOnly: "provider" },
  { screen: "feed",       label: "Fil",       Icon: Rss },
  { screen: "ai",         label: "Conseil",   Icon: Sparkles },
  { screen: "onboarding", label: "Profil",    Icon: User },
];

interface Props {
  current: Screen;
  role: Role;
  onChange: (s: Screen) => void;
  reportCount?: number;
}

export default function BottomNav({ current, role, onChange, reportCount }: Props) {
  const visible = NAV_ITEMS.filter((item) => !item.roleOnly || item.roleOnly === role);

  return (
    <nav className="flex items-stretch border-t border-border bg-background/95 backdrop-blur-sm pb-safe">
      {visible.map(({ screen, label, Icon }) => {
        const active = current === screen;
        const isFeed = screen === "feed";
        return (
          <button
            key={screen}
            onClick={() => onChange(screen)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className={`relative`}>
              <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
              {isFeed && reportCount && reportCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                  {reportCount > 9 ? "9+" : reportCount}
                </span>
              ) : null}
            </div>
            <span className={`text-[10px] font-semibold leading-none ${active ? "text-primary" : ""}`}>
              {label}
            </span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
