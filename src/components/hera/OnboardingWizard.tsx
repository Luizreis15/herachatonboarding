import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Plus,
  Send,
  Trash2,
  LayoutGrid,
  UserPlus,
} from "lucide-react";
import { HeraLogo } from "./brand";
import { Stepper, STEPS } from "./Stepper";
import { ReviewSummary } from "./ReviewSummary";
import { SuccessScreen } from "./SuccessScreen";
import { Field, HeraButton, HeraCard, HeraInput } from "./ui";
import { maskCep, maskCnpj, maskPhone, maskUf, isEmail } from "@/lib/hera/masks";
import { emptyOnboarding, type OnboardingData } from "@/lib/hera/types";
import { submitOnboarding } from "@/lib/supabase/onboarding";

const uid = () => Math.random().toString(36).slice(2, 10);

type Errors = Record<string, string>;

export function OnboardingWizard({ token }: { token: string }) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [data, setData] = useState<OnboardingData>(emptyOnboarding);

  // draft inputs
  const [sectorDraft, setSectorDraft] = useState("");
  const [member, setMember] = useState({ name: "", email: "", sectorId: "" });

  const setCompany = (patch: Partial<OnboardingData["company"]>) =>
    setData((d) => ({ ...d, company: { ...d.company, ...patch } }));
  const setAdmin = (patch: Partial<OnboardingData["admin"]>) =>
    setData((d) => ({ ...d, admin: { ...d.admin, ...patch } }));

  function validate(current: number): boolean {
    const e: Errors = {};
    if (current === 0) {
      if (!data.company.name.trim()) e.name = "Informe o nome da empresa";
      if (data.company.cnpj.replace(/\D/g, "").length !== 14) e.cnpj = "CNPJ incompleto";
      if (data.company.whatsapp.replace(/\D/g, "").length < 10) e.whatsapp = "WhatsApp incompleto";
    }
    if (current === 1) {
      if (!data.admin.name.trim()) e.adminName = "Informe o nome do administrador";
      if (!isEmail(data.admin.email)) e.adminEmail = "Email inválido";
    }
    if (current === 2 && data.sectors.length === 0) e.sectors = "Adicione pelo menos um setor";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function addSector() {
    const name = sectorDraft.trim();
    if (!name) return;
    setData((d) => ({ ...d, sectors: [...d.sectors, { id: uid(), name }] }));
    setSectorDraft("");
    setErrors({});
  }

  function removeSector(id: string) {
    setData((d) => ({
      ...d,
      sectors: d.sectors.filter((s) => s.id !== id),
      members: d.members.filter((m) => m.sectorId !== id),
    }));
  }

  function addMember() {
    const e: Errors = {};
    if (!member.name.trim()) e.memberName = "Informe o nome";
    if (!isEmail(member.email)) e.memberEmail = "Email inválido";
    if (!member.sectorId) e.memberSector = "Selecione um setor";
    setErrors(e);
    if (Object.keys(e).length) return;
    setData((d) => ({ ...d, members: [...d.members, { id: uid(), ...member }] }));
    setMember({ name: "", email: "", sectorId: "" });
  }

  async function submit() {
    if (sending) return;
    setSending(true);
    setSubmitError("");
    const result = await submitOnboarding(token, data);
    if (!result.ok) {
      setSubmitError(result.message);
      setSending(false);
      return;
    }
    setSending(false);
    setSent(true);
  }

  if (sent) return <SuccessScreen />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-6rem] h-80 w-80 rounded-full bg-primary-soft/60 blur-3xl"
      />
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <HeraLogo subtitle="Onboarding HeraChat" />
            <span className="max-w-[46%] truncate text-right text-xs text-muted-foreground">
              Convite <span className="font-medium text-foreground">{token}</span>
            </span>
          </div>
          <div className="mt-5">
            <Stepper current={step} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pt-8 pb-16 sm:px-8 sm:pt-12">
        {step === 0 && (
          <StepShell
            title="Vamos começar pela sua empresa"
            description="Esses dados identificam sua conta dentro do HeraChat."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome da empresa" required error={errors.name} className="sm:col-span-2">
                <HeraInput
                  value={data.company.name}
                  onChange={(ev) => setCompany({ name: ev.target.value })}
                  placeholder="JB Auto"
                />
              </Field>
              <Field label="CNPJ" required error={errors.cnpj}>
                <HeraInput
                  inputMode="numeric"
                  value={data.company.cnpj}
                  onChange={(ev) => setCompany({ cnpj: maskCnpj(ev.target.value) })}
                  placeholder="00.000.000/0000-00"
                />
              </Field>
              <Field label="WhatsApp" required error={errors.whatsapp}>
                <HeraInput
                  inputMode="tel"
                  value={data.company.whatsapp}
                  onChange={(ev) => setCompany({ whatsapp: maskPhone(ev.target.value) })}
                  placeholder="(11) 99999-9999"
                />
              </Field>
            </div>

            <div className="my-8 flex items-center gap-3">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Endereço
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-5 sm:grid-cols-6">
              <Field label="CEP" className="sm:col-span-2">
                <HeraInput
                  inputMode="numeric"
                  value={data.company.cep}
                  onChange={(ev) => setCompany({ cep: maskCep(ev.target.value) })}
                  placeholder="00000-000"
                />
              </Field>
              <Field label="Rua" className="sm:col-span-4">
                <HeraInput
                  value={data.company.street}
                  onChange={(ev) => setCompany({ street: ev.target.value })}
                  placeholder="Av. Paulista"
                />
              </Field>
              <Field label="Número" className="sm:col-span-2">
                <HeraInput
                  value={data.company.number}
                  onChange={(ev) => setCompany({ number: ev.target.value })}
                  placeholder="1000"
                />
              </Field>
              <Field label="Complemento" className="sm:col-span-4">
                <HeraInput
                  value={data.company.complement}
                  onChange={(ev) => setCompany({ complement: ev.target.value })}
                  placeholder="Sala 42"
                />
              </Field>
              <Field label="Bairro" className="sm:col-span-3">
                <HeraInput
                  value={data.company.district}
                  onChange={(ev) => setCompany({ district: ev.target.value })}
                  placeholder="Bela Vista"
                />
              </Field>
              <Field label="Cidade" className="sm:col-span-2">
                <HeraInput
                  value={data.company.city}
                  onChange={(ev) => setCompany({ city: ev.target.value })}
                  placeholder="São Paulo"
                />
              </Field>
              <Field label="Estado" className="sm:col-span-1">
                <HeraInput
                  value={data.company.state}
                  onChange={(ev) => setCompany({ state: maskUf(ev.target.value) })}
                  placeholder="SP"
                />
              </Field>
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            title="Quem será o administrador?"
            description="Essa pessoa recebe o primeiro acesso ao HeraChat."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome" required error={errors.adminName}>
                <HeraInput
                  value={data.admin.name}
                  onChange={(ev) => setAdmin({ name: ev.target.value })}
                  placeholder="João Batista"
                />
              </Field>
              <Field label="Email" required error={errors.adminEmail}>
                <HeraInput
                  type="email"
                  value={data.admin.email}
                  onChange={(ev) => setAdmin({ email: ev.target.value })}
                  placeholder="joao@empresa.com.br"
                />
              </Field>
            </div>

            <div className="mt-6 flex gap-3 rounded-xl border border-primary-soft bg-primary-wash px-4 py-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-foreground">
                O administrador terá acesso total ao sistema e poderá gerenciar usuários e
                configurações.
              </p>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title="Como sua empresa se organiza?"
            description="Crie os setores que vão receber e distribuir os atendimentos."
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <HeraInput
                value={sectorDraft}
                onChange={(ev) => setSectorDraft(ev.target.value)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") {
                    ev.preventDefault();
                    addSector();
                  }
                }}
                placeholder="Comercial, Financeiro, Suporte..."
              />
              <HeraButton variant="secondary" onClick={addSector} className="shrink-0">
                <Plus className="h-4 w-4" />
                Adicionar setor
              </HeraButton>
            </div>
            {errors.sectors ? (
              <p className="mt-2 text-xs font-medium text-destructive">{errors.sectors}</p>
            ) : null}

            <div className="mt-6">
              {data.sectors.length === 0 ? (
                <EmptyState
                  icon={<LayoutGrid className="h-5 w-5" />}
                  title="Nenhum setor adicionado"
                  description="É necessário pelo menos um setor para continuar."
                />
              ) : (
                <ul className="space-y-2.5">
                  {data.sectors.map((s, i) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-soft"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-wash text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                        <span className="truncate text-[15px] font-medium text-foreground">
                          {s.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeSector(s.id)}
                        aria-label={`Remover ${s.name}`}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title="Quem vai usar o sistema?"
            description="Adicione as pessoas da equipe e o setor de cada uma."
          >
            <HeraCard className="p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Nome" error={errors.memberName}>
                  <HeraInput
                    value={member.name}
                    onChange={(ev) => setMember({ ...member, name: ev.target.value })}
                    placeholder="Carla Souza"
                  />
                </Field>
                <Field label="Email" error={errors.memberEmail}>
                  <HeraInput
                    type="email"
                    value={member.email}
                    onChange={(ev) => setMember({ ...member, email: ev.target.value })}
                    placeholder="carla@empresa.com.br"
                  />
                </Field>
                <Field label="Setor" error={errors.memberSector}>
                  <select
                    value={member.sectorId}
                    onChange={(ev) => setMember({ ...member, sectorId: ev.target.value })}
                    className="h-12 w-full rounded-[10px] border border-border bg-card px-4 text-[15px] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">Selecione</option>
                    {data.sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-5">
                <HeraButton variant="secondary" onClick={addMember} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Adicionar pessoa
                </HeraButton>
              </div>
            </HeraCard>

            <div className="mt-6">
              {data.members.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="h-5 w-5" />}
                  title="Nenhuma pessoa adicionada"
                  description="Você pode seguir sem usuários e cadastrá-los depois."
                />
              ) : (
                <ul className="space-y-2.5">
                  {data.members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-soft"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium text-foreground">{m.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                        <span className="mt-1 inline-flex rounded-full border border-primary-soft bg-primary-wash px-2.5 py-1 text-xs font-medium text-primary sm:hidden">
                          {data.sectors.find((s) => s.id === m.sectorId)?.name}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden rounded-full border border-primary-soft bg-primary-wash px-2.5 py-1 text-xs font-medium text-primary sm:inline">
                          {data.sectors.find((s) => s.id === m.sectorId)?.name}
                        </span>
                        <button
                          onClick={() =>
                            setData((d) => ({
                              ...d,
                              members: d.members.filter((x) => x.id !== m.id),
                            }))
                          }
                          aria-label={`Remover ${m.name}`}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title="Confira antes de enviar"
            description="Revise as informações. Você pode voltar e ajustar o que precisar."
          >
            <ReviewSummary data={data} />
          </StepShell>
        )}

        {submitError ? (
          <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-4">
            <p className="text-sm leading-relaxed text-foreground">{submitError}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Seus dados foram mantidos. Você pode tentar enviar novamente.
            </p>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <HeraButton variant="ghost" onClick={back} className="sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </HeraButton>
          ) : (
            <span className="hidden sm:block" />
          )}

          {step < STEPS.length - 1 ? (
            <HeraButton onClick={next} className="w-full sm:w-auto">
              Continuar
              <ArrowRight className="h-4 w-4" />
            </HeraButton>
          ) : (
            <HeraButton
              onClick={() => void submit()}
              disabled={sending}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              {sending ? "Enviando..." : "Enviar cadastro"}
            </HeraButton>
          )}
        </div>
      </main>
    </div>
  );
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{description}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-wash text-primary">
        {icon}
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
