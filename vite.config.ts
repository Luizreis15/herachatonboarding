import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

  if (mode === "production" && (!supabaseUrl || !supabaseKey)) {
    throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no ambiente de build.");
  }

  const define: Record<string, string> = {};
  if (supabaseUrl) {
    define["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(supabaseUrl);
  }
  if (supabaseKey) {
    define["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(supabaseKey);
  }

  return {
    define,
    plugins: [
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        server: { entry: "server" },
      }),
      nitro({ preset: "vercel" }),
      viteReact(),
      tailwindcss(),
    ],
  };
});
