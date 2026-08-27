import { type FormEvent, useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { AdminLoading, AdminShell } from "@/components/hera/AdminShell";
import { Field, HeraButton, HeraCard, HeraInput } from "@/components/hera/ui";
import { createAdminInvite, listAdminInvites } from "@/lib/supabase/admin-server";
import type { AdminInviteListItem } from "@/lib/supabase/admin";

export const Route = createFileRoute("/admin/")({
  loader: () => listAdminInvites(),
  pendingComponent: () => <AdminLoading message="Carregando convites..." />,
  component: AdminInvitesPage,
});

const inviteStatusLabel: Record<AdminInviteListItem["status"], string> = {
  ativo: "Ativo",
  utilizado: "Utilizado",
  expirado: "Expirado",
  revogado: "Revogado",
};

function inviteUrl(token: string) {
  if (typeof window === "undefined") return `/${token}`;
  return `${window.location.origin}/${token}`;
}

function AdminInvitesPage() {
  const result = Route.useLoaderData();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<AdminInviteListItem | null>(null);

  const invites = useMemo(() => {
    if (!result.ok) return [];
    if (!created) return result.invites;
    return [created, ...result.invites.filter((invite) => invite.id !== created.id)];
  }, [created, result]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const empresaNome = String(data.get("empresaNome") ?? "").trim();
    const clienteNome = String(data.get("clienteNome") ?? "").trim();

    if (!empresaNome) {
      toast.error("Informe o nome da empresa.");
      return;
    }

    setSaving(true);
    try {
      const createdInvite = await createAdminInvite({
        data: { empresaNome, clienteNome },
      });
      if (!createdInvite.ok) {
        toast.error(createdInvite.message);
        return;
      }
      setCreated(createdInvite.invite);
      form.reset();
      toast.success("Link gerado");
      await router.invalidate();
    } catch {
      toast.error("Não foi possível gerar o link.");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(token: string) {
    try {
      await navigator.clipboard.writeText(inviteUrl(token));
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  return (
    <AdminShell title="Convites">
      <div className="mx-auto max-w-3xl space-y-6">
        <HeraCard className="px-5 py-5 sm:px-6">
          <h2 className="text-[15px] font-semibold text-foreground">Nova empresa</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gera o link para o responsável preencher o onboarding.
          </p>
          <form
            onSubmit={(event) => void onCreate(event)}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Empresa" required className="sm:col-span-1">
              <HeraInput
                name="empresaNome"
                placeholder="Nome da empresa"
                required
                disabled={saving}
              />
            </Field>
            <Field label="Responsável" className="sm:col-span-1">
              <HeraInput
                name="clienteNome"
                placeholder="Nome de quem vai receber o link"
                disabled={saving}
              />
            </Field>
            <div className="sm:col-span-2">
              <HeraButton type="submit" disabled={saving}>
                {saving ? "Gerando..." : "Gerar link"}
              </HeraButton>
            </div>
          </form>
        </HeraCard>

        {created ? (
          <HeraCard className="px-5 py-5 sm:px-6">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Link gerado
            </p>
            <p className="mt-2 text-[15px] font-semibold text-foreground">{created.company}</p>
            <p className="mt-3 break-all text-sm text-muted-foreground">
              {inviteUrl(created.token)}
            </p>
            <HeraButton
              variant="secondary"
              className="mt-4"
              onClick={() => void copyLink(created.token)}
            >
              <Copy className="h-4 w-4" />
              Copiar link
            </HeraButton>
          </HeraCard>
        ) : null}

        {!result.ok ? (
          <HeraCard className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Não foi possível carregar os convites.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
          </HeraCard>
        ) : invites.length === 0 ? (
          <HeraCard className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">Nenhum convite ainda.</p>
            <p className="mt-1 text-sm text-muted-foreground">Cadastre a primeira empresa acima.</p>
          </HeraCard>
        ) : (
          <ul className="space-y-3">
            {invites.map((invite) => (
              <li key={invite.id}>
                <HeraCard className="px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <p className="truncate text-[15px] font-semibold text-foreground">
                          {invite.company}
                        </p>
                        <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {inviteStatusLabel[invite.status]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {invite.responsible}
                        <span className="mx-1.5 text-border">·</span>
                        {invite.date}
                      </p>
                    </div>
                    <HeraButton
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={() => void copyLink(invite.token)}
                    >
                      <Copy className="h-4 w-4" />
                      Copiar link
                    </HeraButton>
                  </div>
                </HeraCard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
