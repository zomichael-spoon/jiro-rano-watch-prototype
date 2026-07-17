import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export interface SupabaseApiCookie {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return [];

  return cookieHeader.split("; ").map((cookie) => {
    const [name, ...valueParts] = cookie.split("=");
    return {
      name,
      value: valueParts.join("="),
    };
  });
}

export function createApiSupabaseClient(request: Request, responseCookies: SupabaseApiCookie[]) {
  const cookieHeader = request.headers.get("cookie");
  const requestCookies = parseCookieHeader(cookieHeader);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requestCookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            responseCookies.push({ name, value, options });
          });
        },
      },
    },
  );
}

export function buildJsonResponse(
  body: unknown,
  status = 200,
  cookies: SupabaseApiCookie[] = [],
) {
  const response = NextResponse.json(body, { status });
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}
