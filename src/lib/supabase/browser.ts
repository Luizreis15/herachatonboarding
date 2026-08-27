import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseBrowser() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowser só pode ser usado no browser");
  }

  if (!browserClient) {
    const { url, publishableKey } = getSupabasePublicEnv();
    browserClient = createBrowserClient<Database>(url, publishableKey);
  }

  return browserClient;
}
