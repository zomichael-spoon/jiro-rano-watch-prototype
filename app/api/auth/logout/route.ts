import { createApiSupabaseClient, buildJsonResponse, type SupabaseApiCookie } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const responseCookies: SupabaseApiCookie[] = [];
  const supabase = createApiSupabaseClient(request, responseCookies);
  const { error } = await supabase.auth.signOut();

  if (error) {
    return buildJsonResponse({ error: error.message }, 400, responseCookies);
  }

  return buildJsonResponse({ success: true }, 200, responseCookies);
}
