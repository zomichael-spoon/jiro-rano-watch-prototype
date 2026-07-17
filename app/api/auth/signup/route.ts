import { createApiSupabaseClient, buildJsonResponse, type SupabaseApiCookie } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return buildJsonResponse({ error: "Email et mot de passe requis." }, 400);
  }

  const responseCookies: SupabaseApiCookie[] = [];
  const supabase = createApiSupabaseClient(request, responseCookies);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return buildJsonResponse({ error: error.message }, 400, responseCookies);
  }

  return buildJsonResponse(
    { session: data.session, user: data.user },
    200,
    responseCookies,
  );
}
