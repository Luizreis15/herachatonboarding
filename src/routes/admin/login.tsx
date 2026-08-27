import { type FormEvent, useState } from "react";
import { createFileRoute, Link, isRedirect, redirect } from "@tanstack/react-router";
import { ArrowLeft, LogIn } from "lucide-react";
import { HeraLogo } from "@/components/hera/brand";
import { Field, HeraButton, HeraInput } from "@/components/hera/ui";
import { fetchAdminSession } from "@/lib/supabase/admin-server";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type LoginSearch = {
  error?: "denied";
};

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch =>
    search["error"] === "denied" ? { error: "denied" } : {},
  beforeLoad: async () => {
    try {
      const session = await fetchAdminSession();
      if (session.status === "ok") {
        throw redirect({ to: "/admin" });
      }
    } catch (error) {
      if (isRedirect(error)) throw error;
    }
  },
  component: AdminLoginPage,
});

function mapClientLoginError(message: string) {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) return "Email ou senha inválidos.";
  if (value.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  if (value.includes("too many requests")) return "Muitas tentativas. Aguarde um momento.";
  if (value.includes("vite_supabase") || value.includes("defina vite")) {
    return "Configuração do servidor incompleta. Tente de novo em instantes.";
  }
  return "Não foi possível entrar. Tente novamente.";
}

function AdminLoginPage() {
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
      const supabase = getSupabaseBrowser();
      const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (authError || !auth.user) {
        setError(mapClientLoginError(authError?.message ?? ""));
        return;
      }

      const session = await fetchAdminSession();
      if (session.status === "forbidden") {
        await supabase.auth.signOut();
        setError("Você não tem permissão para acessar o painel.");
        return;
      }
      if (session.status !== "ok") {
        await supabase.auth.signOut();
        setError("Não foi possível validar a sessão. Recarregue a página e tente de novo.");
        return;
      }

      window.location.assign("/admin");
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (message.includes("forbidden")) {
        setError("Não foi possível validar a sessão. Recarregue a página e tente de novo.");
        return;
      }
      setError(mapClientLoginError(error instanceof Error ? error.message : ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-linear-to-b from-primary to-primary-deep px-10 py-10 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-primary-vivid/30 blur-3xl"
        />
        <HeraLogo invert subtitle="Painel interno" />
        <div className="relative z-10 my-auto max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight xl:text-5xl">
            Cada onboarding vira um ambiente pronto.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/75">
            Acompanhe as submissões recebidas pelos links individuais, revise os dados e prepare o
            HeraChat de cada cliente.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/50">
          Digital Hera — tecnologia de atendimento
        </p>
      </section>

      <section className="relative flex flex-col bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white blur-3xl"
        />
        <header className="relative z-10 px-6 py-6 lg:hidden">
          <HeraLogo subtitle="Painel interno" />
        </header>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-float sm:p-9">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Entrar</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesso restrito à equipe da Digital Hera
            </p>
            <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-5">
              <Field label="Email" required>
                <HeraInput
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="voce@digitalhera.com"
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
                <LogIn className="h-4 w-4" />
                {loading ? "Entrando..." : "Entrar no painel"}
              </HeraButton>
            </form>
          </div>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o site
          </Link>
        </div>
      </section>
    </div>
  );
}
