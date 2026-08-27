import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database";
import { getSupabasePublicEnv } from "./env";

let client: SupabaseClient<Database> | undefined;

export function getSupabase() {
  if (!client) {
    const { url, publishableKey } = getSupabasePublicEnv();
    client = createClient<Database>(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
