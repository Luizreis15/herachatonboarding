import { createFileRoute, useRouter } from "@tanstack/react-router";
import { HeraLogo } from "@/components/hera/brand";
import { HeraButton, HeraCard } from "@/components/hera/ui";
import { OnboardingWizard } from "@/components/hera/OnboardingWizard";
import { validateOnboardingToken } from "@/lib/supabase/onboarding";

export const Route = createFileRoute("/$token")({
  loader: async ({ params }) => validateOnboardingToken(params.token),
  pendingComponent: InviteLoading,
  component: OnboardingPage,
});

function OnboardingPage() {
  const { token } = Route.useParams();
  const validation = Route.useLoaderData();
  const router = useRouter();

  if (validation.state === "erro") {
    return (
      <InviteMessage
        title="Não foi possível validar o convite"
        description="Verifique sua conexão e tente abrir o link novamente."
        actionLabel="Tentar novamente"
        onAction={() => void router.invalidate()}
      />
    );
  }

  if (validation.state === "inexistente" || validation.state === "revogado") {
    return (
      <InviteMessage
        title="Link inválido ou indisponível"
        description="Este convite não está disponível. Se você esperava acessar o onboarding, fale com a Digital Hera."
      />
    );
  }

  if (validation.state === "utilizado") {
    return (
      <InviteMessage
        title="Cadastro já enviado"
        description="O onboarding deste link já foi concluído. A equipe da Digital Hera entra em contato com você."
      />
    );
  }

  if (validation.state === "expirado") {
    return (
      <InviteMessage
        title="Este link expirou"
        description="O prazo deste convite acabou. Peça um novo link à Digital Hera."
      />
    );
  }

  return <OnboardingWizard token={token} />;
}

function InviteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Validando convite...</p>
    </div>
  );
}

function InviteMessage({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <header className="relative z-10 px-6 py-6 sm:px-10">
        <HeraLogo subtitle="Onboarding HeraChat" />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24">
        <HeraCard className="w-full max-w-lg px-6 py-8 sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
          {actionLabel && onAction ? (
            <div className="mt-6">
              <HeraButton onClick={onAction}>{actionLabel}</HeraButton>
            </div>
          ) : null}
        </HeraCard>
      </main>
    </div>
  );
}
