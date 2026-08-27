function readRuntimeEnv(key: string) {
  try {
    const env = globalThis.process?.env;
    const value = env?.[key];
    return typeof value === "string" ? value.trim() : "";
  } catch {
    return "";
  }
}

function readPublicEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY") {
  const fromVite =
    name === "VITE_SUPABASE_URL"
      ? import.meta.env.VITE_SUPABASE_URL
      : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const aliases =
    name === "VITE_SUPABASE_URL"
      ? ["VITE_SUPABASE_URL", "SUPABASE_URL"]
      : ["VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"];
  const value = [fromVite, ...aliases.map(readRuntimeEnv)].find(
    (item) => typeof item === "string" && item.trim(),
  );
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
