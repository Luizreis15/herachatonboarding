import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLoading, AdminShell } from "@/components/hera/AdminShell";
import { HeraCard, InitialsAvatar, StatusPill } from "@/components/hera/ui";
import { listAdminSubmissions } from "@/lib/supabase/admin-server";
import type { SubmissionStatus } from "@/lib/hera/types";

export const Route = createFileRoute("/admin/submissions/")({
  loader: () => listAdminSubmissions(),
  pendingComponent: () => <AdminLoading message="Carregando submissões..." />,
  component: AdminSubmissionsPage,
});

const STATS: { status: SubmissionStatus; label: string }[] = [
  { status: "pendente", label: "Pendente" },
  { status: "revisado", label: "Revisado" },
  { status: "criado", label: "Criado" },
];

function padCount(value: number) {
  return String(value).padStart(2, "0");
}

function AdminSubmissionsPage() {
  const result = Route.useLoaderData();
  const submissions = result.ok ? result.submissions : [];
  const counts = {
    pendente: submissions.filter((item) => item.status === "pendente").length,
    revisado: submissions.filter((item) => item.status === "revisado").length,
    criado: submissions.filter((item) => item.status === "criado").length,
  };

  return (
    <AdminShell
      title="Onboarding de clientes"
      subtitle="Acompanhe os cadastros recebidos pelos links individuais."
    >
      {!result.ok ? (
        <HeraCard className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            Não foi possível carregar as submissões.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
        </HeraCard>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {STATS.map((stat) => (
              <HeraCard key={stat.status} className="px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <StatusPill status={stat.status} />
                </div>
                <p className="mt-6 text-4xl font-extrabold tracking-tight text-foreground">
                  {padCount(counts[stat.status])}
                </p>
              </HeraCard>
            ))}
          </div>

          {submissions.length === 0 ? (
            <HeraCard className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Nenhuma submissão ainda.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Quando o cliente enviar o cadastro pelo link, ele aparece aqui.
              </p>
            </HeraCard>
          ) : (
            <HeraCard className="overflow-hidden">
              <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_8rem] gap-4 border-b border-border px-6 py-3 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase md:grid">
                <span>Empresa</span>
                <span>Responsável</span>
                <span>Data</span>
                <span>Status</span>
              </div>
              <ul>
                {submissions.map((submission) => (
                  <li key={submission.id} className="border-b border-border last:border-0">
                    <Link
                      to="/admin/submissions/$id"
                      params={{ id: submission.id }}
                      className="grid items-center gap-3 px-5 py-4 outline-none transition-colors hover:bg-primary-wash/50 focus-visible:bg-primary-wash md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_8rem] md:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <InitialsAvatar name={submission.company} />
                        <p className="truncate font-bold text-foreground">{submission.company}</p>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {submission.responsible}
                      </p>
                      <p className="text-sm text-muted-foreground">{submission.date}</p>
                      <StatusPill status={submission.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </HeraCard>
          )}
        </>
      )}
    </AdminShell>
  );
}
