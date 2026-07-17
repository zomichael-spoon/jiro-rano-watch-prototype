"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, Droplets, Zap, Phone, BookOpen, Fuel, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { ProfileWithRelations, ReportWithRelations, EmergencyContact, DisruptionCode, Activity, FokontanyOption } from "@/types";

interface Props {
  profile: ProfileWithRelations;
  reports: ReportWithRelations[];
  emergencyContacts: EmergencyContact[];
  activities: Activity[];
  fokontanyOptions: FokontanyOption[];
}

interface AdviceBlock {
  title: string;
  titleMg: string;
  steps: string[];
  stepsMg: string[];
  colorClass: string;
  bgClass: string;
  borderClass: string;
  Icon: React.ElementType;
}

/**
 * Logique de conseil conservée telle quelle (mock côté client) — seule la
 * source des contacts d'urgence change: ils viennent maintenant de la table
 * emergency_contacts (filtrable par type de perturbation actif et fokontany).
 */
function generateAdvice(profile: ProfileWithRelations, reports: ReportWithRelations[]) {
  const zoneName = profile.fokontany_ref?.name ?? "";
  const active = reports.filter((r) => r.is_active && r.fokontany === zoneName);

  const hasWater = active.some((r) => r.type === "water" || r.type === "dirty");
  const isDirty = active.some((r) => r.type === "dirty");
  const hasPower = active.some((r) => r.type === "power");
  const hasFuel = active.some((r) => r.type === "fuel");
  const isRestaurant = profile.activity_code === "restaurant";
  const isSalon = profile.activity_code === "salon";

  const blocks: AdviceBlock[] = [];

  if (isDirty) {
    blocks.push({
      title: "Sécurité — eau polluée",
      titleMg: "Fiarovana — rano maloto",
      Icon: Droplets,
      colorClass: "text-orange-400",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      steps: [
        "Ne pas consommer l'eau directement du robinet.",
        "Faire bouillir l'eau 5 minutes minimum avant consommation.",
        "Utiliser du chlore (2 gouttes/litre) pour désinfecter.",
        "Signaler à la mairie et au bureau de la Fokontany.",
      ],
      stepsMg: [
        "Aza misotro rano avy amin'ny kapositra mivantana.",
        "Ampangotraho ny rano 5 minitra alohan'ny ampiasaina.",
        "Ampiasao chlore (2 tampony/litatra) handiovana.",
        "Lazao amin'ny kaomina sy ny birao Fokontany.",
      ],
    });
  } else if (hasWater) {
    blocks.push({
      title: isRestaurant ? "Restaurant: gestion sans eau" : "Coupure d'eau — conseils",
      titleMg: isRestaurant ? "Hotely: fitantanana tsy misy rano" : "Tsy fahazon-drano — torohevitra",
      Icon: Droplets,
      colorClass: "text-blue-400",
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/30",
      steps: isRestaurant
        ? [
            "Commander une livraison d'eau en jerrican dès maintenant.",
            "Réduire le menu aux plats nécessitant peu d'eau.",
            "Réserver l'eau pour la cuisson et le lavage des mains.",
            "Informer les clients de la situation et prévoir des lingettes.",
          ]
        : [
            "Remplir tous les récipients dès que l'eau est disponible.",
            "Conserver dans des jerricans hermétiquement fermés.",
            "Limiter la consommation aux besoins essentiels: boisson, cuisine.",
            "Contacter les porteurs d'eau locaux pour livraison.",
          ],
      stepsMg: isRestaurant
        ? [
            "Mangataha fanondranana rano jerrican amin'izao fotoana izao.",
            "Hamboleo ny sakafo amin'ireo tsy mila rano firy.",
            "Tehirizo ny rano ho an'ny fanondranana sy ny manasa tanana.",
            "Lazao amin'ny mpanjifa ny toe-javatra ary omeo lingettes.",
          ]
        : [
            "Fenoy ny fanaka rehetra raha misy rano.",
            "Tehirizo ao anatin'ny jerrican mihidy tsara.",
            "Hamboleo ny fampiasana: fisotro sy fanondranana.",
            "Mifandraisa amin'ny mpitondra rano eo an-toerana.",
          ],
    });
  }

  if (hasPower) {
    blocks.push({
      title: isSalon ? "Salon: gérer sans électricité" : "Coupure électricité — conseils",
      titleMg: isSalon ? "Coiffure: fitantanana tsy misy jiro" : "Tsy fahazon-jiro — torohevitra",
      Icon: Zap,
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/30",
      steps: isSalon
        ? [
            "Utiliser des fers à coiffer rechargeables ou à gaz.",
            "Proposer des soins manuels (massages, tresses) ne nécessitant pas d'électricité.",
            "Débrancher tous les équipements pour éviter les surtensions au retour du courant.",
            "Charger vos appareils dès que le courant revient.",
          ]
        : [
            "Débrancher TV, frigo et ordinateurs pour les protéger des surtensions.",
            "Utiliser des lampes LED rechargeables ou des bougies (loin des rideaux).",
            isRestaurant
              ? "Passer à la cuisine au gaz/charbon. Conserver aliments dans une glacière."
              : "Éviter d'ouvrir le réfrigérateur inutilement — il garde 4h sans courant.",
            "Charger powerbanks et téléphones dès le retour du courant.",
          ],
      stepsMg: isSalon
        ? [
            "Ampiasao fer atao basy na gaz ho an'ny coiffure.",
            "Omeo fitsaboana tanana (massage, manafy volo) tsy mila jiro.",
            "Esory ny fitaovana rehetra hiaro amin'ny surtension.",
            "Satrio ny fitaovana raha miverina ny jiro.",
          ]
        : [
            "Esory TV, frigo ary solosaina hiaro amin'ny surtension.",
            "Ampiasao jiro LED atao basy na labozy (manalavitra ny lamba).",
            isRestaurant
              ? "Mifamadika amin'ny gaz/arina. Tehirizo sakafo ao glacière."
              : "Aza misokatra ny frigo raha tsy ilaina — mihazona 4h tsy misy jiro.",
            "Satrio powerbank sy finday raha miverina ny jiro.",
          ],
    });
  }

  if (hasFuel) {
    blocks.push({
      title: "Pénurie carburant — conseils",
      titleMg: "Tsy fisian'ny solika — torohevitra",
      Icon: Fuel,
      colorClass: "text-orange-400",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      steps: [
        "Réduire les déplacements non essentiels.",
        "Privilégier le covoiturage ou les transports en commun.",
        "Identifier les stations encore approvisionnées via JiroRano Watch.",
        "Stocker raisonnablement — ne pas créer de pénurie artificielle.",
      ],
      stepsMg: [
        "Hamboleo ny dia tsy ilaina.",
        "Alao ny covoiturage na fitantan-dalambe.",
        "Tarihana ny poste mbola misy solika amin'ny JiroRano Watch.",
        "Tehirizo am-pahendrena — aza mamorona aizana sandoka.",
      ],
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      title: "Tout est normal dans votre zone",
      titleMg: "Toerana mahazatra ao aminao",
      Icon: CheckCircle2,
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      steps: [
        "Aucune coupure active détectée dans votre Fokontany.",
        "Profitez-en pour constituer un stock d'urgence: 10L d'eau/personne.",
        "Préparez un kit: lampes LED, nourriture sèche, médicaments essentiels.",
        "Enregistrez les numéros d'urgence dans votre téléphone.",
      ],
      stepsMg: [
        "Tsy misy faharetana eo amin'ny Fokontany anao.",
        "Maro-mampiasao izany hananana stock maika: 10L/olona.",
        "Omana kit: jiro LED, sakafo maina, fanafody ilaina.",
        "Soraty ny nomerao maika ao amin'ny finday anao.",
      ],
    });
  }

  const activeTypes = new Set<DisruptionCode>([
    ...(hasWater || isDirty ? (["water", "dirty"] as DisruptionCode[]) : []),
    ...(hasPower ? (["power"] as DisruptionCode[]) : []),
    ...(hasFuel ? (["fuel"] as DisruptionCode[]) : []),
  ]);

  return { blocks, activeTypes };
}

/**
 * Sélectionne les contacts pertinents : toujours les contacts génériques
 * (disruption_code IS NULL), + ceux liés aux perturbations actives dans la
 * zone du profil, + ceux spécifiques au fokontany s'il y en a.
 */
function selectContacts(
  contacts: EmergencyContact[],
  activeTypes: Set<DisruptionCode>,
  fokontanyId: string | null,
): EmergencyContact[] {
  return contacts
    .filter((c) => {
      const matchesType = !c.disruption_code || activeTypes.has(c.disruption_code);
      const matchesZone = !c.fokontany_id || c.fokontany_id === fokontanyId;
      return matchesType && matchesZone;
    })
    .sort((a, b) => a.sort_order - b.sort_order);
}

export default function AIAdviceScreen({
  profile,
  reports,
  emergencyContacts,
  activities,
  fokontanyOptions,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);
  const [adviceText, setAdviceText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setShown(false);
    setAdviceText("");
    setError("");
    setLoading(false);
  }, [profile]);

  async function handleGetAdvice() {
    setLoading(true);
    setError("");
    setAdviceText("");

    try {
      const response = await fetch("/api/openrouter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: {
            display_name: profile.display_name,
            role: profile.role,
            activity_code: profile.activity_code,
            fokontany_id: profile.fokontany_id,
            notes: profile.notes,
            organization_name: profile.organization_name,
            is_verified_provider: profile.is_verified_provider,
            notify_power: profile.notify_power,
            notify_water: profile.notify_water,
            notify_fuel: profile.notify_fuel,
            notify_dirty: profile.notify_dirty,
            avatar_url: profile.avatar_url,
          },
          reports: reports.map((r) => ({
            type: r.type,
            fokontany: r.fokontany,
            description: r.description,
            is_active: r.is_active,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Erreur OpenRouter");
      }

      setAdviceText(data.advice ?? "Aucune réponse reçue.");
      setShown(true);
    } catch (err) {
      setError((err as Error).message || "Erreur lors de la requête.");
      setShown(true);
    } finally {
      setLoading(false);
    }
  }

  const { activeTypes } = generateAdvice(profile, reports);
  const contacts = selectContacts(emergencyContacts, activeTypes, profile.fokontany_id);

  const profileDisplayName = profile.display_name || "Utilisateur";
  const activityLabel = profile.activity?.label_fr ?? profile.activity_code ?? "—";
  const zoneLabel = profile.fokontany_ref?.name ?? (fokontanyOptions.find((f) => f.id === profile.fokontany_id)?.name ?? "—");

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
      <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex items-center gap-3">
        <div className="rounded-xl bg-primary/20 p-2.5">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">Conseil IA personnalisé</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Basé sur votre profil: {profileDisplayName} · {zoneLabel}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 flex gap-3">
        <div className="rounded-lg bg-secondary p-2.5">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Profil analysé</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {activityLabel} · {zoneLabel}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {profile.notes ? `Note: ${profile.notes}` : "Aucune note spéciale"}
          </p>
        </div>
      </div>

      {!shown && (
        <button
          onClick={handleGetAdvice}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Obtenir un conseil IA sur mesure
            </>
          )}
        </button>
      )}

      {shown && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground px-2 bg-background rounded-full border border-border">
              Conseil IA · {new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-bold text-foreground">Conseil personnalisé</p>
              <div className="mt-3 text-sm leading-relaxed text-foreground/90 prose prose-invert">
                {adviceText ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{adviceText}</ReactMarkdown>
                ) : (
                  <span>Le service OpenRouter n'a pas retourné de conseils.</span>
                )}
              </div>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
          </div>

          {/* Contacts d'urgence — depuis emergency_contacts, filtrés par contexte */}
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">Contacts d&apos;urgence locaux</p>
            </div>
            <div className="flex flex-col gap-2">
              {contacts.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucun contact enregistré pour votre zone.</p>
              )}
              {contacts.map((c) => (
                <a
                  key={c.id}
                  href={`tel:${c.phone}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2.5 transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.note_fr}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{c.phone}</span>
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={handleGetAdvice}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full rounded-2xl border border-primary/30 bg-primary/10 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Actualiser le conseil
          </button>
        </div>
      )}
    </div>
  );
}