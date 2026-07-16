"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, CheckCircle2, ArrowRight } from "lucide-react";

export default function AuthScreen({
  initialMode = "login",
}: {
  initialMode?: "login" | "signup";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email.trim() || !password.trim()) {
      setError("Veuillez renseigner un email et un mot de passe.");
      setLoading(false);
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Les mots de passe doivent être identiques.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const endpoint = `/api/auth/${mode}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Erreur lors de l'authentification.");
      }

      if (result.session) {
        await supabase.auth.setSession(result.session);
      }

      if (mode === "login") {
        if (result.session) {
          router.push("/");
          return;
        }
        setMessage("Connexion réussie. Redirection en cours...");
      } else {
        if (result.session) {
          router.push("/");
          return;
        }
        setMessage(
          "Inscription réussie. Vérifiez votre boîte mail pour confirmer votre compte.",
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'authentification.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">JiroRano Watch</h1>
            <p className="text-sm text-muted-foreground">
              Connectez-vous ou créez un compte pour accéder à l'app.
            </p>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {(["login", "signup"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                mode === option
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {option === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@example.com"
              className="w-full rounded-2xl border border-border bg-secondary py-3 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-2xl border border-border bg-secondary py-3 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                className="w-full rounded-2xl border border-border bg-secondary py-3 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{message}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{mode === "login" ? "Se connecter" : "Créer un compte"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          En créant un compte, vous acceptez les conditions d'utilisation de JiroRano Watch.
        </p>
      </div>
    </div>
  );
}
