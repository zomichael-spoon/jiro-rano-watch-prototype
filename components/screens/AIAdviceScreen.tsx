"use client";

import { useState } from "react";
import { UserProfile, Report, ACTIVITIES } from "@/lib/jiro-data";
import {
  Sparkles, Loader2, ShieldAlert, Droplets, Zap,
  Phone, BookOpen, Fuel, CheckCircle2,
} from "lucide-react";

interface Props {
  profile: UserProfile;
  reports: Report[];
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

interface Contact {
  name: string;
  phone: string;
  note: string;
}

function generateAdvice(profile: UserProfile, reports: Report[]) {
  const active = reports.filter(
    (r) => r.is_active && (r.fokontany === profile.fokontany || r.fokontany === "all")
  );
  const hasWater = active.some((r) => r.type === "water" || r.type === "dirty");
  const isDirty = active.some((r) => r.type === "dirty");
  const hasPower = active.some((r) => r.type === "power");
  const hasFuel  = active.some((r) => r.type === "fuel");
  const isRestaurant = profile.activity === "restaurant";
  const isSalon = profile.activity === "salon";

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

  const contacts: Contact[] = [
    { name: "JIRAMA Antananarivo", phone: "+261 20 22 393 00", note: "Coupures eau & électricité" },
    { name: "JIRAMA Urgences 24h", phone: "+261 20 22 224 77", note: "Dépannage d'urgence" },
    { name: "Pompiers / 18", phone: "18", note: "Urgences générales" },
    ...(hasWater
      ? [
          { name: "Hydro-Tanà (livraison rano)", phone: "+261 34 12 345 67", note: "Livraison eau à domicile" },
          { name: "Plombier — réseau local", phone: "+261 32 98 765 43", note: "Réparation conduite" },
        ]
      : []),
    ...(hasPower
      ? [{ name: "Technicien électricien", phone: "+261 33 45 678 90", note: "Intervention réseau" }]
      : []),
  ];

  return { blocks, contacts };
}

export default function AIAdviceScreen({ profile, reports }: Props) {
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  function handleGetAdvice() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setShown(true); }, 1800);
  }

  const { blocks, contacts } = generateAdvice(profile, reports);

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
      {/* Header card */}
      <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex items-center gap-3">
        <div className="rounded-xl bg-primary/20 p-2.5">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">Conseil IA personnalisé</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Basé sur votre profil: {profile.name || "Utilisateur"} · {profile.fokontany}
          </p>
        </div>
      </div>

      {/* Profile summary */}
      <div className="rounded-2xl border border-border bg-card p-4 flex gap-3">
        <div className="rounded-lg bg-secondary p-2.5">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Profil analysé</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {ACTIVITIES[profile.activity]} · {profile.fokontany}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {profile.notes ? `Note: ${profile.notes}` : "Aucune note spéciale"}
          </p>
        </div>
      </div>

      {/* CTA */}
      {!shown && (
        <button
          onClick={handleGetAdvice}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
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

      {/* AI Response */}
      {shown && (
        <div className="flex flex-col gap-4">
          {/* Gemini badge */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground px-2 bg-background rounded-full border border-border">
              Conseil IA · Gemini · {new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Advice blocks */}
          {blocks.map((block, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${block.borderClass} ${block.bgClass} p-4 flex flex-col gap-3`}
            >
              <div className="flex items-center gap-2">
                <block.Icon className={`h-4 w-4 ${block.colorClass}`} />
                <div>
                  <p className={`text-sm font-bold ${block.colorClass}`}>{block.title}</p>
                  <p className="text-[11px] text-muted-foreground italic">{block.titleMg}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {block.steps.map((step, j) => (
                  <div key={j} className="flex gap-2.5">
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${block.colorClass.replace("text-", "bg-")}`} />
                    <div>
                      <p className="text-sm text-foreground/85 leading-relaxed">{step}</p>
                      <p className="text-[11px] text-muted-foreground italic mt-0.5 leading-relaxed">
                        {block.stepsMg[j]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Emergency contacts */}
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">Contacts d&apos;urgence locaux</p>
            </div>
            <div className="flex flex-col gap-2">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={`tel:${c.phone}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2.5 transition-colors active:bg-secondary/50"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.note}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{c.phone}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={() => { setShown(false); setLoading(false); }}
            className="flex items-center justify-center gap-2 w-full rounded-2xl border border-primary/30 bg-primary/10 py-3 text-sm font-semibold text-primary transition-colors active:bg-primary/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Actualiser le conseil
          </button>
        </div>
      )}
    </div>
  );
}
