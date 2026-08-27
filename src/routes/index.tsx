import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Link2, MessageCircle, Shield } from "lucide-react";
import { HeraLogo } from "@/components/hera/brand";

export const Route = createFileRoute("/")({
  component: Index,
});

const features = [
  {
    icon: Shield,
    title: "Dados tratados com cuidado",
    text: "Só a equipe da Digital Hera vê o cadastro. O link individual não exige login do cliente.",
  },
  {
    icon: Link2,
    title: "Link individual",
    text: "Cada empresa recebe um convite único, pronto para o responsável preencher.",
  },
  {
    icon: MessageCircle,
    title: "HeraChat pronto",
    text: "As respostas viram a base do atendimento no WhatsApp, já organizado por setor.",
  },
];

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-primary-soft/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-[-6rem] h-[26rem] w-[26rem] rounded-full bg-primary-vivid/10 blur-3xl"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <HeraLogo />
        <Link
          to="/admin/login"
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition-colors hover:border-primary/30 hover:text-primary"
        >
          Área interna
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 sm:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-card sm:p-10 lg:col-span-2">
            <div>
              <p className="inline-flex items-center rounded-full bg-primary-wash px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
                Onboarding do HeraChat
              </p>
              <h1 className="mt-5 max-w-xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                O seu atendimento <span className="text-primary-vivid">começa por aqui</span>
              </h1>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                O responsável da empresa recebe um link individual, preenche os dados em poucos
                minutos e a equipe da Digital Hera prepara o HeraChat.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#como-funciona"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-float transition-colors hover:bg-primary-hover"
                >
                  Ver o onboarding
                  <ArrowRight className="h-4 w-4" />
                </a>
                <p className="text-sm text-muted-foreground">
                  Não encontrou seu link? Fale com seu contato na Digital Hera.
                </p>
              </div>
            </div>

            <dl className="mt-10 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
              {[
                ["05", "etapas guiadas"],
                ["~4", "minutos para concluir"],
                ["100%", "revisado pela equipe"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-extrabold tracking-tight text-foreground">
                    {value}
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="flex flex-col justify-between rounded-3xl bg-linear-to-b from-primary to-primary-deep p-7 text-white shadow-float sm:p-8">
            <p className="text-[11px] font-bold tracking-[0.18em] text-white/70 uppercase">
              HeraChat
            </p>
            <div className="mt-8 space-y-3">
              <p className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/10 px-4 py-3 text-sm leading-relaxed">
                Bom dia! Preciso de um orçamento.
              </p>
              <p className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-primary-vivid px-4 py-3 text-sm leading-relaxed">
                Claro! Vou direcionar para o setor Comercial agora mesmo.
              </p>
              <div className="flex gap-1 px-1 pt-1" aria-hidden>
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              </div>
            </div>
            <p className="mt-8 text-sm leading-relaxed text-white/75">
              Distribuição automática por setor, direto no WhatsApp da sua empresa.
            </p>
          </aside>
        </div>

        <section id="como-funciona" className="mt-4 scroll-mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-7"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-wash text-primary-vivid">
                <feature.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-base font-bold tracking-tight text-foreground">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
