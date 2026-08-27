import { Building2, UserCog, LayoutGrid, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HeraCard } from "./ui";
import type { OnboardingData } from "@/lib/hera/types";

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <HeraCard className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-wash text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </HeraCard>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 truncate text-[15px] text-foreground">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

export function ReviewSummary({ data }: { data: OnboardingData }) {
  const { company, admin, sectors, members } = data;
  const address = [
    [company.street, company.number].filter(Boolean).join(", "),
    company.complement,
    company.district,
    [company.city, company.state].filter(Boolean).join(" - "),
    company.cep,
  ]
    .filter((p) => p && p.trim())
    .join(" • ");

  return (
    <div className="space-y-4">
      <SectionCard icon={Building2} title="Empresa">
        <dl className="grid gap-5 sm:grid-cols-3">
          <Row label="Nome" value={company.name} />
          <Row label="CNPJ" value={company.cnpj} />
          <Row label="WhatsApp" value={company.whatsapp} />
        </dl>
        <div className="mt-5 border-t border-border pt-5">
          <Row label="Endereço" value={address} />
        </div>
      </SectionCard>

      <SectionCard icon={UserCog} title="Administrador">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Row label="Nome" value={admin.name} />
          <Row label="Email" value={admin.email} />
        </dl>
      </SectionCard>

      <SectionCard icon={LayoutGrid} title="Setores">
        {sectors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum setor adicionado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sectors.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-primary-soft bg-primary-wash px-3 py-1.5 text-sm font-medium text-primary"
              >
                {s.name}
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard icon={Users} title="Usuários por setor">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum usuário adicionado.</p>
        ) : (
          <div className="space-y-6">
            {sectors
              .filter((s) => members.some((m) => m.sectorId === s.id))
              .map((sector) => (
                <div key={sector.id}>
                  <div className="mb-3 flex items-center gap-2">
                    <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {sector.name}
                    </h4>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <ul className="space-y-2">
                    {members
                      .filter((m) => m.sectorId === sector.id)
                      .map((m) => (
                        <li
                          key={m.id}
                          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl bg-background px-4 py-3"
                        >
                          <span className="text-[15px] font-medium text-foreground">{m.name}</span>
                          <span className="text-sm text-muted-foreground">{m.email}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
