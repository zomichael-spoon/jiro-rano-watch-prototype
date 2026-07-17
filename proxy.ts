import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

// Backwards-compatible wrapper for Next.js proxy API.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Keep `middleware` export for older Next.js versions that still call it.
export { proxy as middleware };

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
