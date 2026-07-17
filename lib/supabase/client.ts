import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  if (typeof window === "undefined") {
    throw new Error("Supabase browser client can only be created in the browser.");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: window.localStorage,
      },
    },
  );
}
