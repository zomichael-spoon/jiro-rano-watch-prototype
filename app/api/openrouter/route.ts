import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";

interface OpenRouterRequest {
    profile: {
        display_name: string | null;
        role: string;
        activity_code: string | null;
        fokontany_id: string | null;
        notes: string | null;
        organization_name: string | null;
        is_verified_provider: boolean;
        notify_power: boolean;
        notify_water: boolean;
        notify_fuel: boolean;
        notify_dirty: boolean;
        avatar_url: string | null;
    };
    reports: Array<{
        type: string;
        fokontany: string;
        description: string;
        is_active: boolean;
    }>;
}

function buildPrompt(body: OpenRouterRequest): string {
    const profile = body.profile;
    const zone = profile.fokontany_id ? `Fokontany ID ${profile.fokontany_id}` : "zone inconnue";
    const activity = profile.activity_code ?? "activité inconnue";
    const notes = profile.notes ? `${profile.notes}` : "Aucune note spéciale.";
    const activeReports = body.reports.filter((r) => r.is_active);
    const activeDescriptions = activeReports.length
        ? activeReports.map((r) => `- ${r.type} (${r.description})`).join("\n")
        : "Aucune perturbation active détectée.";

    return `Tu es un assistant qui donne des conseils pratiques et personnalisés en français pour un utilisateur de JiroRano Watch.

Profil utilisateur:
- Nom: ${profile.display_name ?? "Utilisateur"}
- Rôle: ${profile.role}
- Activité: ${activity}
- Zone: ${zone}
- Notes: ${notes}

Perturbations actives:
${activeDescriptions}

Donne 4 conseils clairs et adaptés à ce profil pour traverser la situation actuelle. Reste en français, concis et orienté action.`;
}

export async function POST(request: Request) {
    try {
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: "OPENROUTER_API_KEY is not configured." },
                { status: 500 },
            );
        }

        const body = (await request.json()) as OpenRouterRequest;
        const prompt = buildPrompt(body);
        /*
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                max_tokens: 400,
            }),
        });

        let data: any;
        try {
            data = await response.json();
        } catch {
            const text = await response.text();
            return NextResponse.json(
                { error: `OpenRouter returned invalid JSON: ${text}` },
                { status: response.status },
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: data?.error || "OpenRouter request failed." },
                { status: response.status },
            );
        }

        const advice = data?.choices?.[0]?.message?.content ?? "";
        
        return NextResponse.json({ advice });
        */
        return NextResponse.json({ advice: "Bien sûr, Rakoto. Voici quelques conseils pour vous aider à gérer les perturbations actuelles : \n\n1. **Stockage d'eau** : Étant donné la coupure d'eau signalée, assurez-vous de conserver une réserve d'eau potable et utilisez des méthodes de purification comme des filtres ou des pastilles de purification si nécessaire. Pensez aussi à collecter l'eau de pluie si possible.\n\n2. **Solutions d'énergie** : Pour pallier aux coupures d'électricité, envisagez d'utiliser une batterie externe pour maintenir vos appareils électroniques essentiels chargés, surtout pour continuer votre travail de développeur. Si possible, utilisez un générateur ou des lampes à LED rechargeables pour éclairer votre espace de travail.\n\n3. **Mobilité et carburant** : En raison de la pénurie de carburant, privilégiez les moyens de transport alternatifs comme le vélo ou les transports en commun. Pour les trajets essentiels, ce sera également l'occasion d'envisager le" });
    } catch (err) {
        return NextResponse.json({ error: "Failed to generate advice." }, { status: 500 });
    }
}
