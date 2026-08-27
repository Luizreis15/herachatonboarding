import { Check } from "lucide-react";
import { HeraLogo } from "./brand";

export function SuccessScreen() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-primary-soft/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-primary-wash blur-3xl"
      />

      <header className="relative z-10 px-6 py-6 sm:px-10">
        <HeraLogo />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-lg text-center">
          <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary-wash" />
            <span className="absolute inset-2 rounded-full bg-primary-soft/70" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float">
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cadastro enviado!
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            A equipe da Digital Hera vai preparar seu ambiente e entrar em contato com você.
          </p>

          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-border bg-card px-6 py-5 text-left shadow-card">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Próximos passos
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-foreground">
              {[
                "Configuração do seu HeraChat",
                "Conexão do número de WhatsApp",
                "Convite para os usuários cadastrados",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            Você já pode fechar esta página com segurança.
          </p>
        </div>
      </main>
    </div>
  );
}
