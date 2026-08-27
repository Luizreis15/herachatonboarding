function readPublicEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY") {
  const fromVite =
    name === "VITE_SUPABASE_URL"
      ? import.meta.env.VITE_SUPABASE_URL
      : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const fromProcess =
    typeof process === "undefined"
      ? undefined
      : name === "VITE_SUPABASE_URL"
        ? process.env.VITE_SUPABASE_URL
        : process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const value = [fromVite, fromProcess].find((item) => typeof item === "string" && item.trim());
  return value?.trim() ?? "";
}

export function getSupabasePublicEnv() {
  const url = readPublicEnv("VITE_SUPABASE_URL");
  const publishableKey = readPublicEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !publishableKey) {
    throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no ambiente.");
  }

  return { url, publishableKey };
}
