import { createFileRoute } from "@tanstack/react-router";
import { HeraLogo } from "@/components/hera/brand";
import { HeraCard } from "@/components/hera/ui";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
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
        <HeraLogo subtitle="HeraChat" />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Onboarding Digital Hera
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            O cadastro do HeraChat é feito por um link individual, enviado pela Digital Hera ao
            responsável da empresa.
          </p>

          <HeraCard className="mt-10 px-6 py-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Como acessar
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              Abra o convite recebido por e-mail ou WhatsApp. Ele leva direto ao formulário da sua
              empresa — não é necessário login nesta etapa.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Se você não recebeu o link, fale com o contato da Digital Hera.
            </p>
          </HeraCard>
        </div>
      </main>
    </div>
  );
}
