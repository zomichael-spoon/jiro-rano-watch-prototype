"use client";

import { useEffect, useState, useRef } from "react";
import { Download, Bell, BellOff, X, Smartphone } from "lucide-react";
import {
  requestNotificationPermission,
  subscribeToPush,
  saveSubscription,
} from "@/lib/notifications";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const notifAskedRef = useRef(false);

  // ── Register Service Worker ───────────────────────────────────────────────
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[JiroRano] SW registered:", reg.scope);
        setSwReg(reg);
      })
      .catch((err) => console.error("[JiroRano] SW registration failed:", err));
  }, []);

  // ── Detect if already installed (standalone mode) ─────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(mq.matches);
    mq.addEventListener("change", (e) => setIsInstalled(e.matches));
  }, []);

  // ── Capture install prompt event ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show install banner after 3s if not already installed
      if (!isInstalled) {
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isInstalled]);

  // ── Notification permission state sync ────────────────────────────────────
  useEffect(() => {
    if (!("Notification" in window)) return;
    setNotifPermission(Notification.permission);

    // Show notification banner after 5s if permission not yet decided
    if (Notification.permission === "default" && !notifAskedRef.current) {
      notifAskedRef.current = true;
      setTimeout(() => setShowNotifBanner(true), 5000);
    }
  }, []);

  // ── Subscribe to push when SW is ready & permission is granted ────────────
  useEffect(() => {
    if (!swReg || notifPermission !== "granted") return;
    subscribeToPush(swReg).then((sub) => {
      if (sub) saveSubscription(sub).catch(console.warn);
    });
  }, [swReg, notifPermission]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
    setShowInstallBanner(false);
  }

  async function handleEnableNotifications() {
    const permission = await requestNotificationPermission();
    setNotifPermission(permission);
    setShowNotifBanner(false);

    if (permission === "granted" && swReg) {
      const sub = await subscribeToPush(swReg);
      if (sub) await saveSubscription(sub).catch(console.warn);

      // Show a welcome notification
      swReg.showNotification("🔔 Notifications activées", {
        body: "Vous recevrez des alertes lors de nouvelles pannes dans votre zone.",
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        tag: "welcome",
      });
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Install Banner ─────────────────────────────────────────────── */}
      {showInstallBanner && !isInstalled && (
        <div
          role="dialog"
          aria-label="Installer l'application"
          className="fixed bottom-20 left-3 right-3 z-50 animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="relative flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-[#0f111a]/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-amber-500/10">
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/5 via-transparent to-blue-500/5 pointer-events-none" />

            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Smartphone className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground">Installer JiroRano</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Accès rapide depuis votre écran d'accueil
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 px-3 py-1.5 text-[12px] font-bold text-white transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Installer
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification Banner ─────────────────────────────────────────── */}
      {showNotifBanner && notifPermission === "default" && (
        <div
          role="dialog"
          aria-label="Activer les notifications"
          className="fixed bottom-20 left-3 right-3 z-50 animate-in slide-in-from-bottom-4 duration-300"
          style={{ bottom: showInstallBanner ? "9rem" : undefined }}
        >
          <div className="relative flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-[#0f111a]/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-blue-500/10">
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground">Alertes de panne</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Soyez notifié des coupures dans votre zone
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleEnableNotifications}
                className="flex items-center gap-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-95 px-3 py-1.5 text-[12px] font-bold text-white transition-all"
              >
                <Bell className="h-3.5 w-3.5" />
                Activer
              </button>
              <button
                onClick={() => setShowNotifBanner(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification status indicator in header area ─────────────────── */}
      {notifPermission === "denied" && (
        <div className="fixed top-14 right-3 z-40">
          <div
            className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1"
            title="Notifications bloquées dans les paramètres du navigateur"
          >
            <BellOff className="h-3 w-3 text-red-400" />
            <span className="text-[9px] font-bold text-red-400">Bloqué</span>
          </div>
        </div>
      )}
    </>
  );
}
