import { type FormEvent, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { HeraLogo } from "@/components/hera/brand";
import { Field, HeraButton, HeraCard, HeraInput } from "@/components/hera/ui";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { fetchAdminSession } from "@/lib/supabase/admin-server";

type LoginSearch = {
  error?: "denied";
};

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch =>
    search["error"] === "denied" ? { error: "denied" } : {},
  beforeLoad: async () => {
    const session = await fetchAdminSession();
    if (session.status === "ok") {
      throw redirect({ to: "/admin" });
    }
  },
  component: AdminLoginPage,
});

function loginErrorMessage(message: string) {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) return "Email ou senha inválidos.";
  if (value.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  if (value.includes("too many requests")) return "Muitas tentativas. Aguarde um momento.";
  return "Não foi possível entrar. Tente novamente.";
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    search.error === "denied" ? "Você não tem permissão para acessar o painel." : "",
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Informe email e senha.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await getSupabaseBrowser().auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(loginErrorMessage(signInError.message));
        return;
      }

      const session = await fetchAdminSession();
      if (session.status !== "ok") {
        setError("Você não tem permissão para acessar o painel.");
        return;
      }

      await navigate({ to: "/admin" });
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-primary-soft/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-primary-wash blur-3xl"
      />

      <header className="relative z-10 px-6 py-6 sm:px-10">
        <HeraLogo subtitle="Painel interno" />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24">
        <HeraCard className="w-full max-w-md p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso da equipe Digital Hera ao painel de onboarding.
          </p>

          <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-5">
            <Field label="Email" required>
              <HeraInput
                type="email"
                name="email"
                autoComplete="username"
                placeholder="equipe@digitalhera.com"
                required
                disabled={loading}
              />
            </Field>
            <Field label="Senha" required>
              <HeraInput
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </Field>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <HeraButton type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </HeraButton>
          </form>
        </HeraCard>
      </main>
    </div>
  );
}
